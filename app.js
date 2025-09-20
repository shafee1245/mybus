// ===============================
// MyBus - App Navigation
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Role selection buttons
  const customerBtn = document.getElementById("customerBtn");
  const ownerBtn = document.getElementById("ownerBtn");
  const driverBtn = document.getElementById("driverBtn");

  function requestLocationThen(page) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => window.location.href = page,
        () => window.location.href = page
      );
    } else {
      window.location.href = page;
    }
  }

  if (customerBtn) {
    customerBtn.addEventListener("click", () => {
      localStorage.setItem("role", "customer");
      requestLocationThen("verify.html");
    });
  }

  if (ownerBtn) {
    ownerBtn.addEventListener("click", () => {
      localStorage.setItem("role", "owner");
      requestLocationThen("verify.html");
    });
  }

  if (driverBtn) {
    driverBtn.addEventListener("click", () => {
      localStorage.setItem("role", "driver");
      requestLocationThen("verify.html");
    });
  }
});
