// ===============================
// MyBus - Owner Dashboard Logic
// ===============================

function loadOwnerBuses() {
  const busList = document.getElementById("busList");
  busList.innerHTML = "⏳ Loading buses...";

  try {
    // Read from Firebase "buses" node
    const busesRef = db.ref("buses"); // db comes from firebase.js

    busesRef.once("value", (snapshot) => {
      const busesData = snapshot.val();
      busList.innerHTML = ""; // clear loading text

      if (busesData) {
        Object.values(busesData).forEach((bus) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${bus.vehicleName || "Unnamed Bus"}</strong> 
            (${bus.vehicleNumber || "No Number"})<br>
            Route: ${bus.from || "?"} → ${bus.to || "?"}<br>
            Departure: ${bus.departureTime || "N/A"}<br>
            Stops: ${
              bus.stops && bus.stops.length
                ? bus.stops.map((s) => `${s.name} (${s.time})`).join(", ")
                : "No stops listed"
            }
          `;
          busList.appendChild(li);
        });
      } else {
        busList.innerHTML = "<p>❌ No buses found. Please add one.</p>";
      }
    });
  } catch (error) {
    console.error("Error loading buses:", error);
    busList.innerHTML = "<p>⚠️ Failed to load buses. Try again later.</p>";
  }
}

// Expose globally
window.loadOwnerBuses = loadOwnerBuses;
