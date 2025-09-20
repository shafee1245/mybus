// ===============================
// MyBus - Profile page logic
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("profileName");
  const phoneEl = document.getElementById("profilePhone");
  const roleEl = document.getElementById("profileRole");
  const dashboardBtn = document.getElementById("dashboardBtn");
  const profileInfo = document.querySelector(".profile-info");

  // Load initial data from localStorage
  let name = localStorage.getItem("name");
  let phone = localStorage.getItem("phone");
  let role = localStorage.getItem("role");

  // If Firebase auth is available, check for current user
  if (window.auth) {
    try {
      const current = auth.currentUser;
      if (current) {
        if (!name && current.displayName) name = current.displayName;
        if (!phone && current.phoneNumber) phone = current.phoneNumber;
      }

      auth.onAuthStateChanged((user) => {
        if (user) {
          if (!name && user.displayName) name = user.displayName;
          if (!phone && user.phoneNumber) phone = user.phoneNumber;
          updateUI();
          loadRoleExtras();
        }
      });
    } catch (err) {
      console.warn("Auth check failed:", err);
    }
  }

  function safeText(el, txt) {
    if (!el) return;
    el.textContent = txt;
  }

  function updateUI() {
    safeText(nameEl, name || "Unknown");
    safeText(phoneEl, phone || "N/A");
    safeText(roleEl, role ? role.toUpperCase() : "GUEST");
  }

  updateUI();
  loadRoleExtras();

  // ===============================
  // Role-specific info
  // ===============================
  function loadRoleExtras() {
    if (!profileInfo) return;

    const prev = document.getElementById("profileExtra");
    if (prev) prev.remove();

    const extra = document.createElement("p");
    extra.id = "profileExtra";
    profileInfo.appendChild(extra);

    if (!window.db) {
      extra.textContent = "Realtime info unavailable (no DB).";
      return;
    }

    // Owner → count buses
    if (role === "owner") {
      if (!phone) {
        extra.textContent = "Owner phone not found.";
        return;
      }
      extra.textContent = "⏳ Loading your buses...";
      db.ref("buses")
        .orderByChild("owner")
        .equalTo(phone)
        .once("value")
        .then((snap) => {
          const n = snap.numChildren();
          extra.textContent = `You have ${n} registered bus${n !== 1 ? "es" : ""}.`;
        })
        .catch((err) => {
          console.error("Failed to load owner buses:", err);
          extra.textContent = "Failed to load owner info.";
        });
      return;
    }

    // Driver → list assigned buses
    if (role === "driver") {
      if (!phone) {
        extra.textContent = "Driver phone not found.";
        return;
      }
      extra.textContent = "⏳ Loading assigned buses...";
      db.ref("buses")
        .orderByChild("driverPhone")
        .equalTo(phone)
        .once("value")
        .then((snap) => {
          const data = snap.val();
          if (!data) {
            extra.textContent = "No assigned bus yet.";
            return;
          }
          const names = Object.values(data)
            .map((b) => b.vehicleName || b.vehicleNumber || "Unnamed")
            .join(", ");
          extra.textContent = `Assigned to: ${names}`;
        })
        .catch((err) => {
          console.error("Failed to load driver assignment:", err);
          extra.textContent = "Failed to load driver info.";
        });
      return;
    }

    // Customer / others
    extra.textContent = "No extra profile details available.";
  }

  // ===============================
  // Dashboard navigation
  // ===============================
  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
      if (role === "customer") {
        window.location.href = "customer.html";
      } else if (role === "owner") {
        window.location.href = "dashboard-owner.html";
      } else if (role === "driver") {
        window.location.href = "dashboard-driver.html";
      } else {
        window.location.href = "../index.html";
      }
    });
  }

  // ===============================
  // Logout
  // ===============================
  function logout() {
    if (window.auth) {
      auth
        .signOut()
        .catch((err) => console.warn("Firebase signOut failed:", err))
        .finally(() => {
          localStorage.clear();
          window.location.href = "../index.html";
        });
    } else {
      localStorage.clear();
      window.location.href = "../index.html";
    }
  }

  window.logout = logout; // expose for profile.html button
});
