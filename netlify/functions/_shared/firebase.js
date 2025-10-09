// netlify/functions/_shared/firebase.js
// Centralized Firebase Admin initialization for Netlify functions.

const admin = require('firebase-admin')

let app

function getFirebaseApp() {
  if (app) return app

  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID env var is required for Firebase initialization')
  }

  if (admin.apps.length) {
    app = admin.apps[0]
    return app
  }

  const credential = process.env.FIREBASE_SERVICE_ACCOUNT
    ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    : admin.credential.applicationDefault()

  app = admin.initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID
  })

  return app
}

function getDb() {
  const firebaseApp = getFirebaseApp()
  return firebaseApp.firestore()
}

module.exports = { getFirebaseApp, getDb, admin }
