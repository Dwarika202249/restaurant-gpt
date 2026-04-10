const admin = require('firebase-admin');

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  
  // Fix for private key newline characters in environment variables
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('[Firebase] Admin SDK initialized successfully');
} catch (error) {
  console.error('[Firebase] Failed to initialize Admin SDK:', error.message);
}

module.exports = admin;
