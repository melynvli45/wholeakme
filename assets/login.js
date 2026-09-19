import { auth } from "./firebase.js";

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    console.log("✅ LOGIN SUCCESSFUL");
    console.log("UID:", userCredential.user.uid);
    console.log("Email:", userCredential.user.email);

    window.location.href = "dashboard.php";
  } catch (error) {
    console.error("❌ Login error:", error);

    loginError.style.display = "block";

    if (error.code === "auth/invalid-credential") {
      loginError.textContent = "Invalid email or password.";
    } else {
      loginError.textContent = "Login failed: " + error.code;
    }
  }
});
