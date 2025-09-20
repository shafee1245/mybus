// ===============================
// MyBus - Owner Bus Management
// ===============================

// Firebase DB reference
const busesRef = db.ref("buses");

// ===============================
// Load Owner's Buses
// ===============================
function loadOwnerBuses() {
  const ownerPhone = localStorage.getItem("phone"); // logged-in owner’s phone
  const busListEl = document.getElementById("busList");

  if (!busListEl) {
    console.warn("No #busList element found on the page.");
    return;
  }

  if (!ownerPhone) {
    alert("⚠️ You must be logged in as an owner!");
    // Redirect to transport login (views folder)
    window.location.href = "transport-login.html";
    return;
  }

  // Show loading text
  busListEl.innerHTML = "<li>Loading your buses...</li>";

  // Fetch only buses belonging to this owner
  busesRef
    .orderByChild("owner")
    .equalTo(ownerPhone)
    .on("value", (snapshot) => {
      busListEl.innerHTML = ""; // reset

      if (!snapshot.exists()) {
        busListEl.innerHTML = "<li>No buses added yet.</li>";
        return;
      }

      snapshot.forEach((child) => {
        const bus = child.val();
        const li = document.createElement("li");
        li.classList.add("bus-item");

        li.innerHTML = `
          <strong>${bus.vehicleNumber || bus.vehicleName || "Unnamed Bus"}</strong>
          <br>
          Route: ${bus.from || "?"} ➡ ${bus.to || "?"}
          <br>
          <small>Departure: ${bus.departureTime || "?"}</small>
          <br>
          <button class="btn small danger" onclick="deleteBus('${child.key}')">❌ Delete</button>
        `;

        busListEl.appendChild(li);
      });
    }, (err) => {
      console.error("Failed to read buses:", err);
      busListEl.innerHTML = "<li>Failed to load buses. Check console.</li>";
    });
}

// ===============================
// Delete Bus
// ===============================
function deleteBus(busId) {
  if (!busId) return;

  if (confirm("Are you sure you want to delete this bus?")) {
    busesRef.child(busId).remove()
      .then(() => {
        alert("✅ Bus deleted successfully");
      })
      .catch((err) => {
        console.error("Delete error:", err);
        alert("❌ Error deleting bus: " + err.message);
      });
  }
}

// Expose function (optional)
window.loadOwnerBuses = loadOwnerBuses;
window.deleteBus = deleteBus;
