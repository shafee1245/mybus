// ===============================
// MyBus - Driver Dashboard Logic
// ===============================

// Firebase DB reference
const driversRef = db.ref("drivers");

function loadDriverDashboard() {
  const driverNameEl = document.getElementById("driverName");
  const statusEl = document.getElementById("driverStatus");
  const updateBtn = document.getElementById("updateStatusBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Get driver phone/ID (must be set at login/signup)
  const driverPhone = localStorage.getItem("phone");
  if (!driverPhone) {
    alert("⚠️ Driver not logged in!");
    window.location.href = "../index.html";
    return;
  }

  // Load driver info
  driversRef.child(driverPhone).once("value", (snapshot) => {
    const driverData = snapshot.val();
    const driverName = driverData?.name || localStorage.getItem("driverName") || "Driver";

    if (driverNameEl) driverNameEl.textContent = driverName;

    // Show current status
    const status = driverData?.status || "offline";
    updateStatusUI(statusEl, status);
  });

  // Handle status update (toggle online/offline)
  if (updateBtn && statusEl) {
    updateBtn.addEventListener("click", async () => {
      const currentStatus = statusEl.dataset.status || "offline";
      const newStatus = currentStatus === "online" ? "offline" : "online";

      try {
        await driversRef.child(driverPhone).update({ status: newStatus });
        updateStatusUI(statusEl, newStatus);
      } catch (err) {
        alert("❌ Failed to update status: " + err.message);
      }
    });
  }

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
}

// ===============================
// Helper: Update Status UI
// ===============================
function updateStatusUI(statusEl, status) {
  if (!statusEl) return;

  if (status === "online") {
    statusEl.textContent = "✅ Online (Active)";
    statusEl.style.color = "green";
    statusEl.dataset.status = "online";
  } else {
    statusEl.textContent = "❌ Offline";
    statusEl.style.color = "red";
    statusEl.dataset.status = "offline";
  }
}

// Expose globally
window.loadDriverDashboard = loadDriverDashboard;
