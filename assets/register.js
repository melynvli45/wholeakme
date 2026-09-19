import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");

const registerError = document.getElementById("registerError");

const registerBtn = document.getElementById("registerBtn");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();

  const username = document.getElementById("username").value.trim();

  const email = document.getElementById("email").value.trim().toLowerCase();

  const password = document.getElementById("password").value;

  const confirmPassword = document.getElementById("confirmPassword").value;

  registerError.style.display = "none";

  registerError.textContent = "";

  // =============================
  // VALIDATION
  // =============================

  if (!name) {
    showError("Please enter your full name.");

    return;
  }

  if (!username) {
    showError("Please enter a username.");

    return;
  }

  if (!email) {
    showError("Please enter your email address.");

    return;
  }

  if (password.length < 8) {
    showError("Password must contain at least 8 characters.");

    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match.");

    return;
  }

  try {
    // Disable button while processing
    registerBtn.disabled = true;

    registerBtn.textContent = "Creating account...";

    // =============================
    // CREATE FIREBASE AUTH ACCOUNT
    // =============================

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const user = userCredential.user;

    // =============================
    // SAVE DISPLAY NAME TO AUTH
    // =============================

    await updateProfile(user, {
      displayName: name,
    });

    // =============================
    // SAVE USER PROFILE TO FIRESTORE
    // =============================

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,

      name: name,

      username: username,

      email: user.email,

      role: "user",

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    });

    console.log("✅ Registration successful");

    console.log("Firebase UID:", user.uid);

    // =============================
    // SIGN OUT AFTER REGISTRATION
    // =============================

    await signOut(auth);

    console.log("✅ User signed out after registration");

    // =============================
    // REDIRECT TO LOGIN PAGE
    // =============================

    window.location.href = "index.php";
  } catch (error) {
    console.error("❌ Registration error:", error);

    registerBtn.disabled = false;

    registerBtn.textContent = "Create account";

    // =============================
    // FIREBASE ERROR HANDLING
    // =============================

    if (error.code === "auth/email-already-in-use") {
      showError("An account with this email already exists.");
    } else if (error.code === "auth/invalid-email") {
      showError("Please enter a valid email address.");
    } else if (error.code === "auth/weak-password") {
      showError("Please use a stronger password.");
    } else if (error.code === "auth/network-request-failed") {
      showError("Network error. Please check your internet connection.");
    } else {
      showError("Registration failed. Please try again.");
    }
  }
});

// =============================
// SHOW ERROR MESSAGE
// =============================

function showError(message) {
  registerError.textContent = message;

  registerError.style.display = "block";
}
