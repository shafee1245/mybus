// ===============================
// MyBus - OTP Auth with Firebase
// ===============================

let confirmationResult; // Firebase OTP confirmation

// --- SEND OTP ---
function sendOTP() {
  const phoneNumber = document.getElementById("phone").value.trim();
  const message = document.getElementById("message");

  if (!phoneNumber) {
    message.innerText = "⚠️ Please enter a phone number.";
    message.style.color = "red";
    return;
  }

  // Append country code if missing (default +91 for India)
  const fullPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;

  // Setup invisible reCAPTCHA (only once)
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved automatically
      },
    });
  }

  firebase
    .auth()
    .signInWithPhoneNumber(fullPhone, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;

      document.getElementById("otpSection").style.display = "block";
      message.innerText = "✅ OTP sent successfully!";
      message.style.color = "green";
    })
    .catch((error) => {
      console.error("OTP Error:", error);
      message.innerText = "❌ " + error.message;
      message.style.color = "red";
    });
}

// --- VERIFY OTP ---
function verifyOTP() {
  const otp = document.getElementById("otp").value.trim();
  const message = document.getElementById("message");

  if (!otp) {
    message.innerText = "⚠️ Please enter the OTP.";
    message.style.color = "red";
    return;
  }

  confirmationResult
    .confirm(otp)
    .then((result) => {
      const user = result.user;
      message.innerText = "✅ Phone verified successfully!";
      message.style.color = "green";

      // Save user into Firebase DB
      const role = localStorage.getItem("role") || "guest";
      const phone = user.phoneNumber;

      const userData = {
        uid: user.uid,
        phone,
        role,
        createdAt: Date.now(),
      };

      db.ref("users/" + user.uid).set(userData);

      // Save locally
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("phone", phone);
      localStorage.setItem("role", role);

      // Redirect
      setTimeout(() => {
        if (role === "customer") {
          window.location.href = "customer.html";
        } else if (role === "owner") {
          window.location.href = "dashboard-owner.html";
        } else if (role === "driver") {
          window.location.href = "dashboard-driver.html";
        } else {
          window.location.href = "error.html";
        }
      }, 1000);
    })
    .catch((error) => {
      console.error("OTP Verify Error:", error);
      message.innerText = "❌ Invalid OTP. " + error.message;
      message.style.color = "red";
    });
}

// Expose globally
window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
