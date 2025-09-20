// ===============================
// MyBus - Firebase Helpers
// ===============================

// --- AUTH HELPERS ---

/**
 * Sign up a new user with phone (used as email alias) + password
 */
async function signupUser(phone, password, role, name = "") {
  try {
    // Firebase Auth requires email format → we use phone@mybus.com
    const email = `${phone}@mybus.com`;

    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Save basic user info in Realtime DB
    await db.ref("users/" + user.uid).set({
      name,
      phone,
      role,
      createdAt: Date.now(),
    });

    // Save locally
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("phone", phone);
    localStorage.setItem("role", role);
    if (name) localStorage.setItem("name", name);

    return { success: true, uid: user.uid };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Login with phone + password
 */
async function loginUser(phone, password) {
  try {
    const email = `${phone}@mybus.com`;
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Fetch user info from DB
    const snapshot = await db.ref("users/" + user.uid).once("value");
    const userData = snapshot.val();

    if (userData) {
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("phone", userData.phone);
      localStorage.setItem("role", userData.role);
      if (userData.name) localStorage.setItem("name", userData.name);
    }

    return { success: true, uid: user.uid, role: userData?.role };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Logout current user
 */
function logoutUser() {
  return firebase.auth().signOut().then(() => {
    localStorage.clear();
    return true;
  });
}

// --- DATABASE HELPERS ---

/**
 * Save bus data
 */
function saveBus(busData) {
  return db.ref("buses").push(busData);
}

/**
 * Fetch all buses once
 */
async function getAllBuses() {
  const snapshot = await db.ref("buses").once("value");
  return snapshot.val();
}

/**
 * Listen for buses in real time
 */
function onBusesChanged(callback) {
  db.ref("buses").on("value", (snapshot) => {
    callback(snapshot.val());
  });
}

// --- EXPORT TO WINDOW ---
window.signupUser = signupUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.saveBus = saveBus;
window.getAllBuses = getAllBuses;
window.onBusesChanged = onBusesChanged;
