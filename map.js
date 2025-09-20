// ===============================
// MyBus - Map Display Logic
// ===============================

let map;
let markers = {};

// Initialize Google Map
function initMap() {
  if (!document.getElementById("map")) {
    console.error("❌ Map container (#map) not found in HTML.");
    return;
  }

  // Create the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 12.9716, lng: 77.5946 }, // default center (Bangalore)
    zoom: 7,
  });

  console.log("✅ Google Map initialized");

  // Start tracking buses/drivers
  trackBuses();
}

// Track drivers in Firebase
function trackBuses() {
  if (!window.db) {
    console.error("❌ Firebase DB not initialized!");
    return;
  }

  const busesRef = db.ref("users/driver");

  busesRef.on("value", (snapshot) => {
    const data = snapshot.val();

    // Clear old markers
    for (let key in markers) {
      markers[key].setMap(null);
    }
    markers = {};

    if (data) {
      Object.keys(data).forEach((phone) => {
        const user = data[phone];
        if (user.location) {
          const { latitude, longitude } = user.location;
          const pos = { lat: latitude, lng: longitude };

          // Add marker for each driver
          const marker = new google.maps.Marker({
            position: pos,
            map: map,
            title: `${user.name || "Driver"} (${phone})`,
          });

          markers[phone] = marker;
        }
      });
      console.log("✅ Markers updated:", Object.keys(markers).length);
    } else {
      console.log("ℹ️ No driver data found in Firebase.");
    }
  });
}

// Expose initMap globally (required by Google Maps API callback)
window.initMap = initMap;

/*
⚠️ IMPORTANT:
Make sure your map HTML includes the Google Maps API loader like this:

<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap" async defer></script>

Replace "YOUR_API_KEY" with your actual Google Maps API key.
*/
