// Lazy initialization of firebase-admin.
//
// Auth resolution order:
//   1. FIREBASE_SERVICE_ACCOUNT env var containing JSON inline
//      (used by the GitHub Actions workflow).
//   2. GOOGLE_APPLICATION_CREDENTIALS env var pointing at a service-account
//      JSON file (handled natively by firebase-admin's
//      `applicationDefault()`).
//
// Fails fast at startup if neither is set.

const admin = require('firebase-admin');

let app;

function init() {
  if (app) return app;

  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!inlineJson && !filePath) {
    throw new Error(
      'Neither FIREBASE_SERVICE_ACCOUNT (inline JSON) nor ' +
        'GOOGLE_APPLICATION_CREDENTIALS (path) is set. ' +
        'One is required to authenticate with Firestore.'
    );
  }

  let credential;
  if (inlineJson) {
    let parsed;
    try {
      parsed = JSON.parse(inlineJson);
    } catch (err) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT env var is not valid JSON: ${err.message}`
      );
    }
    credential = admin.credential.cert(parsed);
  } else {
    credential = admin.credential.applicationDefault();
  }

  app = admin.initializeApp({ credential });
  return app;
}

function db() {
  init();
  return admin.firestore();
}

module.exports = { init, db };
