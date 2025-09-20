// ===============================
// MyBus - Location Management
// ===============================

// Save user location to Firebase
function saveUserLocation(lat, lng) {
  const role = localStorage.getItem("role") || "guest";
  const phone = localStorage.getItem("phone") || "unknown";

  if (!db) {
    console.error("Firebase DB not initialized!");
    return;
  }

  const locationData = {
    latitude: lat,
    longitude: lng,
    timestamp: Date.now(),
    role: role,
    phone: phone
  };

  // Store in Firebase -> users/{role}/{phone}/location
  db.ref(`users/${role}/${phone}/location`)
    .set(locationData)
    .then(() => {
      console.log("✅ Location saved for", role, phone, locationData);
    })
    .catch((error) => {
      console.error("❌ Failed to save location:", error);
    });
}

// Expose globally
window.saveUserLocation = saveUserLocation;
