import { RecaptchaVerifier, getAuth } from "firebase/auth";

/**
 * Initializes the Firebase reCAPTCHA verifier.
 * @param {string} containerId - The ID of the HTML element to render the reCAPTCHA in.
 * @param {Object} [authInstance] - Optional Firebase Auth instance.
 * @returns {RecaptchaVerifier|null}
 */
export const initRecaptchaVerifier = (containerId, authInstance) => {
  if (typeof window === "undefined") return null;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`reCAPTCHA container not found: ${containerId}`);
    return null;
  }

  // Use the existing verifier if it's already attached to this container
  if (window.recaptchaVerifier && window.recaptchaVerifier.containerId === containerId) {
    return window.recaptchaVerifier;
  }

  // Otherwise, clear any old ones
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {}
    window.recaptchaVerifier = null;
  }

  try {
    // Ensure the container is empty and clear for a fresh start
    container.innerHTML = "";
    const recaptchaDiv = document.createElement("div");
    container.appendChild(recaptchaDiv);

    // Get Auth instance: use provided one, or get from SDK
    const auth = authInstance || getAuth();

    if (!auth) {
      console.error("Firebase Auth not found. Ensure Firebase is initialized.");
      return null;
    }

    // CRITICAL: Ensure 'settings' exists on auth object. 
    // This property is internal to Firebase and sometimes missing in certain environments/versions.
    if (!auth.settings || typeof auth.settings !== 'object') {
      try {
        // We use a simple object as a last resort
        auth.settings = { appVerificationDisabledForTesting: false };
      } catch (err) {
        console.warn("Failed to set auth.settings:", err);
      }
    }

    // Try to ensure the property is set, but don't crash if it's frozen
    try {
      if (auth.settings) {
        auth.settings.appVerificationDisabledForTesting = false;
      }
    } catch (e) {}

    // Correct Modular SDK (v9+) signature: new RecaptchaVerifier(auth, containerOrId, parameters)
    const verifier = new RecaptchaVerifier(
      auth,
      recaptchaDiv,
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired");
        },
      }
    );

    window.recaptchaVerifier = verifier;
    return verifier;
  } catch (error) {
    console.error("Failed to create reCAPTCHA verifier:", error);
    return null;
  }
};
