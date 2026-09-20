import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================================
// CHECK LOGIN
// ==========================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.php";
    return;
  }

  // Update the header with the logged-in user's name
  await updateHeader(user);
});

// ==========================================
// HEADER USER NAME + AVATAR LETTER
// ==========================================

async function updateHeader(user) {
  const headerUserName = document.getElementById("headerUserName");

  const headerAvatar = document.getElementById("headerAvatar");

  // Default name from Firebase Authentication
  let userName = user.displayName || user.email?.split("@")[0] || "User";

  try {
    // Get the user's data from Firestore
    const userRef = doc(db, "users", user.uid);

    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();

      // Use the name saved in Firestore
      if (userData.name) {
        userName = userData.name;
      }
    }
  } catch (error) {
    console.error("Error loading user name:", error);
  }

  // Display the user's name
  if (headerUserName) {
    headerUserName.textContent = userName;
  }

  // Display the first letter of the user's name
  if (headerAvatar) {
    headerAvatar.textContent = userName.charAt(0).toUpperCase();
  }
}

// ==========================================
// LOGOUT
// ==========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      await signOut(auth);

      window.location.href = "index.php";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}
