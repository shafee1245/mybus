// ===============================
// MyBus - Firebase Configuration
// ===============================

// ⚠️ Replace these values with your Firebase project settings
// Find them in Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXRMCyv5Jzsfc23vcKFXjfGdRdoYgsNVo",
  authDomain: "mybus-f407f.firebaseapp.com",
  databaseURL: "https://mybus-f407f-default-rtdb.firebaseio.com",
  projectId: "mybus-f407f",
  storageBucket: "mybus-f407f.appspot.com",
  messagingSenderId: "196017387817",
  appId: "1:196017387817:web:eece9b693fd44fa52c5f38",
  measurementId: "G-MMLE8VM6GJ"

};

// Initialize Firebase (avoid duplicate initialization)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // use the existing one
}

// Reference to Realtime Database
const db = firebase.database();
