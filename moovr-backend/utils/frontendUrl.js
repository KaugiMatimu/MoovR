const configuredFrontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
const isLocalFrontendUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredFrontendUrl);

const isDevelopment = process.env.NODE_ENV === "development";

const frontendUrl = !isDevelopment && isLocalFrontendUrl
  ? "https://moovr.taxi"
  : configuredFrontendUrl || (isDevelopment ? "http://localhost:5173" : "https://moovr.taxi");

module.exports = frontendUrl;
