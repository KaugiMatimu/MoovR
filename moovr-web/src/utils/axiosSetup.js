import axios from "axios";
import Cookies from "js-cookie";
import { auth } from "../firebase";
import { BaseURL } from "./BaseURL";

// Ensure default base URL matches app expectations
axios.defaults.baseURL = BaseURL;

const normalizeRequestUrl = (config) => {
  if (!config || !config.url) return config;

  if (/^https?:\/\//i.test(config.url)) {
    return config;
  }

  const baseURL = axios.defaults.baseURL || "";
  const cleanBaseURL = baseURL.replace(/\/+$/, "");
  const cleanUrl = config.url.replace(/^\/+/, "");

  if (!cleanBaseURL) {
    config.url = cleanUrl;
    return config;
  }

  if (cleanUrl === "" || cleanUrl === "api/v1" || cleanUrl.startsWith("api/v1/")) {
    config.url = cleanUrl;
    return config;
  }

  config.url = `${cleanBaseURL}/${cleanUrl}`;
  return config;
};

// Attach token from localStorage or cookies to every request if present
const REFRESH_ENDPOINT = "/auth/firebase-verify";
axios.interceptors.request.use(
  (config) => {
    normalizeRequestUrl(config);

    // Avoid attaching the potentially-expired backend JWT to the refresh endpoint
    if (config && config.url && config.url.includes(REFRESH_ENDPOINT)) {
      return config;
    }

    const storageToken = localStorage.getItem("token");
    const cookieToken = Cookies.get("token");
    const token = storageToken && storageToken !== "null" && storageToken !== "undefined"
      ? storageToken
      : cookieToken && cookieToken !== "null" && cookieToken !== "undefined"
      ? cookieToken
      : null;

    config.headers = config.headers || {};

    // If a header was explicitly provided but contains 'null'/'undefined', remove it
    if (config.headers["Authorization"]) {
      const hdr = String(config.headers["Authorization"]).toLowerCase();
      if (hdr.includes("null") || hdr.includes("undefined")) {
        delete config.headers["Authorization"];
      }
    }

    // Attach token if available
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to refresh expired backend JWT using Firebase ID token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // If the failed request was the refresh endpoint itself, don't try to refresh again
    if (originalRequest.url && originalRequest.url.includes(REFRESH_ENDPOINT)) {
      return Promise.reject(error);
    }

    const shouldRefresh = error.response && error.response.status === 401;
    if (!shouldRefresh) return Promise.reject(error);

    // Queue to ensure only one refresh request runs at a time
    let isRefreshing = axios.__isRefreshing || false;
    axios.__failedQueue = axios.__failedQueue || [];

    const processQueue = (err, token = null) => {
      axios.__failedQueue.forEach((prom) => {
        if (err) prom.reject(err);
        else prom.resolve(token);
      });
      axios.__failedQueue = [];
    };

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        axios.__failedQueue.push({
          resolve: (token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(axios(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    axios.__isRefreshing = true;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // No firebase session; clear local token and reject
        localStorage.removeItem("token");
        axios.__isRefreshing = false;
        processQueue(new Error("No firebase session"), null);
        return Promise.reject(error);
      }

      const idToken = await currentUser.getIdToken(true);
      const plain = axios.create({ baseURL: BaseURL });
      const resp = await plain.post(
        REFRESH_ENDPOINT,
        { idToken, role: localStorage.getItem("role") || "user" },
        { headers: { "Content-Type": "application/json" } }
      );

      if (resp.data && resp.data.token) {
        const newToken = resp.data.token;
        localStorage.setItem("token", newToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        axios.__isRefreshing = false;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axios(originalRequest);
      }

      // If backend returned user but no JWT, store userData and reject; do not auto-redirect
      if (resp.data && resp.data.user) {
        try {
          localStorage.setItem("userData", JSON.stringify(resp.data.user));
          if (resp.data.user.role) {
            localStorage.setItem("role", resp.data.user.role);
            Cookies.set("role", resp.data.user.role, { expires: 7, path: "/" });
          }
        } catch (e) {
          console.warn("Failed to persist refreshed user/role:", e);
        }
      }

      axios.__isRefreshing = false;
      processQueue(new Error("Refresh failed"), null);
      return Promise.reject(error);
    } catch (e) {
      axios.__isRefreshing = false;
      localStorage.removeItem("token");
      processQueue(e, null);
      return Promise.reject(e);
    }
  }
);

export default axios;
