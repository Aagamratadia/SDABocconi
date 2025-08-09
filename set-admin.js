// set-admin.js
// Usage: node set-admin.js <UID>
// Requires: service-account.json in the same directory
// DO NOT COMMIT service-account.json to source control.

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const keyPath = path.resolve(__dirname, 'service-account.json');
if (!fs.existsSync(keyPath)) {
  console.error('\nMissing service-account.json next to set-admin.js');
  console.error('Download it from Firebase Console → Project settings → Service accounts → Generate new private key.');
  process.exit(1);
}

const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node set-admin.js <UID>');
  process.exit(1);
}

(async () => {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Admin claim set for UID: ${uid}`);
    console.log('NOTE: The user must sign out and sign back in to refresh claims.');
  } catch (err) {
    console.error('Failed to set admin claim:', err);
    process.exitCode = 1;
  }
})();
