// ===============================
// MyBus - Transport Auth Logic
// ===============================

// Firebase DB reference
const usersRef = db.ref("transportUsers");

// ===============================
// SIGNUP
// ===============================
async function signupTransport() {
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const message = document.getElementById("signupMessage");

  const role = localStorage.getItem("signupRole") || "owner"; // default to owner if missing

  if (!phone || !password || !confirmPassword) {
    message.textContent = "⚠️ Please fill all fields.";
    message.style.color = "red";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "❌ Passwords do not match.";
    message.style.color = "red";
    return;
  }

  try {
    // Save user in Firebase
    const newUser = {
      phone,
      password, // ⚠️ Plain text for demo only
      role,
      createdAt: Date.now(),
    };

    // Use phone as key
    await usersRef.child(phone).set(newUser);

    // Store in localStorage
    localStorage.setItem("phone", phone);
    localStorage.setItem("role", role);

    message.textContent = "✅ Signup successful! Redirecting...";
    message.style.color = "green";

    setTimeout(() => {
      window.location.href = "transport.html"; // redirect to dashboard
    }, 1000);
  } catch (error) {
    console.error("Signup error:", error);
    message.textContent = "❌ Signup failed. Please try again.";
    message.style.color = "red";
  }
}

// ===============================
// LOGIN
// ===============================
async function loginTransport() {
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  if (!phone || !password) {
    message.textContent = "⚠️ Please fill all fields.";
    message.style.color = "red";
    return;
  }

  try {
    const snapshot = await usersRef.child(phone).once("value");

    if (!snapshot.exists()) {
      message.textContent = "❌ User not found. Please sign up first.";
      message.style.color = "red";
      return;
    }

    const userData = snapshot.val();

    if (userData.password === password) {
      // Save session
      localStorage.setItem("phone", userData.phone);
      localStorage.setItem("role", userData.role);

      message.textContent = "✅ Login successful! Redirecting...";
      message.style.color = "green";

      setTimeout(() => {
        window.location.href = "transport.html";
      }, 1000);
    } else {
      message.textContent = "❌ Invalid password.";
      message.style.color = "red";
    }
  } catch (error) {
    console.error("Login error:", error);
    message.textContent = "❌ Login failed. Please try again.";
    message.style.color = "red";
  }
}

// Expose globally
window.signupTransport = signupTransport;
window.loginTransport = loginTransport;
