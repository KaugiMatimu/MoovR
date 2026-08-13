import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPhoneNumber, RecaptchaVerifier, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing! Check your .env file.");
}

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth, app, analytics };

let globalVerifier = null;

export const sendOtp = async (phoneNumber, containerId = "recaptcha-container") => {
  try {
    if (globalVerifier) {
      try { globalVerifier.clear(); } catch (e) {}
      globalVerifier = null;
    }

    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }
    container.innerHTML = "";

    console.log("Initializing RecaptchaVerifier for:", phoneNumber);

    // Explicitly pass the Enterprise score-based site key
    const enterpriseKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    console.log("Using reCAPTCHA Enterprise key:", enterpriseKey);

    globalVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      ...(enterpriseKey && { "recaptcha-enterprise-site-key": enterpriseKey }),
      callback: () => console.log("reCAPTCHA solved"),
      "expired-callback": () => {
        if (globalVerifier) { try { globalVerifier.clear(); } catch (e) {} }
        globalVerifier = null;
      }
    });

    await globalVerifier.render();
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, globalVerifier);
    return confirmationResult;

  } catch (error) {
    console.error("sendOtp Critical Failure:", error);
    if (globalVerifier) {
      try { globalVerifier.clear(); } catch (e) {}
      globalVerifier = null;
    }
    throw error;
  }
};

export { firebaseConfig };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail };