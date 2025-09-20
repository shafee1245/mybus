// ===============================
// MyBus - Transport (Add Bus Logic)
// ===============================

// Firebase DB reference for buses
const busesRef = db.ref("buses");

// Store stops temporarily before saving
let stops = [];

// Add Stop
document.getElementById("addStopBtn").addEventListener("click", () => {
  const stopName = document.getElementById("stopName").value.trim();
  const stopTime = document.getElementById("stopTime").value.trim();
  const stopsList = document.getElementById("stopsList");
  const message = document.getElementById("transportMessage");

  if (!stopName || !stopTime) {
    message.textContent = "⚠️ Please enter stop name and time.";
    message.style.color = "red";
    return;
  }

  // Add stop to array
  const stop = { name: stopName, time: stopTime };
  stops.push(stop);

  // Update UI
  const li = document.createElement("li");
  li.textContent = `${stopName} - ${stopTime}`;
  stopsList.appendChild(li);

  // Clear inputs
  document.getElementById("stopName").value = "";
  document.getElementById("stopTime").value = "";

  message.textContent = "✅ Stop added!";
  message.style.color = "green";
});

// Save Bus
document.getElementById("transportForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const vehicleName = document.getElementById("vehicleName").value.trim();
  const vehicleNumber = document.getElementById("vehicleNumber").value.trim();
  const fromLocation = document.getElementById("fromLocation").value.trim();
  const toLocation = document.getElementById("toLocation").value.trim();
  const departureTime = document.getElementById("departureTime").value.trim();
  const message = document.getElementById("transportMessage");

  if (!vehicleName || !vehicleNumber || !fromLocation || !toLocation || !departureTime) {
    message.textContent = "⚠️ Please fill all required fields.";
    message.style.color = "red";
    return;
  }

  try {
    // Get current user
    const phone = localStorage.getItem("phone") || "unknown";

    // Prepare bus data
    const busData = {
      vehicleName,
      vehicleNumber,
      from: fromLocation,
      to: toLocation,
      departureTime,
      stops,
      owner: phone,
      createdAt: Date.now(),
    };

    // Save to Firebase
    await busesRef.push(busData);

    message.textContent = "✅ Bus saved successfully!";
    message.style.color = "green";

    // Reset form + stops
    document.getElementById("transportForm").reset();
    document.getElementById("stopsList").innerHTML = "";
    stops = [];
  } catch (error) {
    console.error("Error saving bus:", error);
    message.textContent = "❌ Failed to save bus. Please try again.";
    message.style.color = "red";
  }
});
