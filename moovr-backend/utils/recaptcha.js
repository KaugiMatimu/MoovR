const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

/**
  * Create an assessment to analyze the risk of a UI action.
  *
  * @param {Object} params
  * @param {string} params.token - The generated token obtained from the client.
  * @param {string} params.recaptchaAction - Action name corresponding to the token.
  * @returns {Promise<number|null>} - The risk score or null if failed.
  */
async function createAssessment({
  token,
  recaptchaAction,
}) {
  const projectID = process.env.VITE_FIREBASE_PROJECT_ID || "moovr-73876";
  const recaptchaKey = process.env.RECAPTCHA_SITE_KEY || "6LfQtPksAAAAAE7c-sR8VIKOKKOPPvL9nJ8VIbFs";

  // Create the reCAPTCHA client.
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

  // Build the assessment request.
  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  };

  try {
    const [response] = await client.createAssessment(request);

    // Check if the token is valid.
    if (!response.tokenProperties.valid) {
      console.log(`reCAPTCHA failed: ${response.tokenProperties.invalidReason}`);
      return null;
    }

    // Check if the expected action was executed.
    if (response.tokenProperties.action === recaptchaAction) {
      console.log(`reCAPTCHA score: ${response.riskAnalysis.score}`);
      return response.riskAnalysis.score;
    } else {
      console.log("reCAPTCHA action mismatch");
      return null;
    }
  } catch (error) {
    console.error("reCAPTCHA Assessment Error:", error);
    return null;
  }
}

module.exports = { createAssessment };
