import { auth, db, storage } from "./firebase.js";

import {
  onAuthStateChanged,
  updateProfile,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// ============================================
// ELEMENTS
// ============================================

const profileForm = document.getElementById("profileForm");

const profileLoading = document.getElementById("profileLoading");

const profileContent = document.getElementById("profileContent");

const profileSuccess = document.getElementById("profileSuccess");

const profileError = document.getElementById("profileError");

const saveProfileBtn = document.getElementById("saveProfileBtn");

const profilePictureInput = document.getElementById("profile_picture");

const profilePreview = document.getElementById("profilePreview");

const defaultProfilePicture = document.getElementById("defaultProfilePicture");

const selectedFileName = document.getElementById("selectedFileName");

let currentUser = null;

let currentProfilePicture = "";

// ============================================
// CHECK LOGIN
// ============================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.php";

    return;
  }

  currentUser = user;

  // ====================================
  // HEADER USER
  // ====================================

  updateHeader(user);

  // ====================================
  // LOAD PROFILE
  // ====================================

  await loadProfile(user);
});

// ============================================
// LOAD PROFILE FROM FIRESTORE
// ============================================

async function loadProfile(user) {
  try {
    const userRef = doc(db, "users", user.uid);

    const snapshot = await getDoc(userRef);

    let profileData = {};

    if (snapshot.exists()) {
      profileData = snapshot.data();
    }

    // ====================================
    // FILL FORM
    // ====================================

    document.getElementById("name").value =
      profileData.name || user.displayName || "";

    document.getElementById("username").value = profileData.username || "";

    document.getElementById("email").value = user.email || "";

    document.getElementById("phone").value = profileData.phone || "";

    document.getElementById("country").value = profileData.country || "";

    document.getElementById("bio").value = profileData.bio || "";

    currentProfilePicture = profileData.profilePicture || "";

    // ====================================
    // SHOW PROFILE PICTURE
    // ====================================

    if (currentProfilePicture) {
      profilePreview.src = currentProfilePicture;

      profilePreview.classList.remove("hidden");

      defaultProfilePicture.style.display = "none";
    } else {
      const name = profileData.name || user.displayName || user.email || "User";

      defaultProfilePicture.textContent = name.charAt(0).toUpperCase();

      defaultProfilePicture.style.display = "flex";

      profilePreview.classList.add("hidden");
    }

    profileLoading.style.display = "none";

    profileContent.style.display = "block";
  } catch (error) {
    console.error("❌ Load profile error:", error);

    profileLoading.style.display = "none";

    showError("Unable to load your profile.");
  }
}

// ============================================
// PROFILE PICTURE PREVIEW
// ============================================

profilePictureInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    selectedFileName.textContent = "No new file selected";

    return;
  }

  // ====================================
  // CHECK FILE TYPE
  // ====================================

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    showError("Only JPG, PNG, GIF and WEBP images are allowed.");

    profilePictureInput.value = "";

    return;
  }

  // ====================================
  // MAXIMUM 5 MB
  // ====================================

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    showError("Profile picture must be smaller than 5 MB.");

    profilePictureInput.value = "";

    return;
  }

  selectedFileName.textContent = file.name;

  // ====================================
  // SHOW LOCAL PREVIEW
  // ====================================

  const previewURL = URL.createObjectURL(file);

  profilePreview.src = previewURL;

  profilePreview.classList.remove("hidden");

  defaultProfilePicture.style.display = "none";
});

// ============================================
// SAVE PROFILE
// ============================================

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  hideMessages();

  const name = document.getElementById("name").value.trim();

  const username = document.getElementById("username").value.trim();

  const phone = document.getElementById("phone").value.trim();

  const country = document.getElementById("country").value.trim();

  const bio = document.getElementById("bio").value.trim();

  if (!name) {
    showError("Please enter your full name.");

    return;
  }

  if (!username) {
    showError("Please enter your username.");

    return;
  }

  try {
    saveProfileBtn.disabled = true;

    saveProfileBtn.textContent = "Saving...";

    let profilePictureURL = currentProfilePicture;

    // ====================================
    // UPLOAD NEW PROFILE PICTURE
    // ====================================

    const file = profilePictureInput.files[0];

    if (file) {
      saveProfileBtn.textContent = "Uploading picture...";

      const fileExtension = file.name.split(".").pop();

      const fileName = `profile_${Date.now()}.${fileExtension}`;

      const storageReference = ref(
        storage,
        `profilePictures/${currentUser.uid}/${fileName}`,
      );

      await uploadBytes(storageReference, file);

      profilePictureURL = await getDownloadURL(storageReference);
    }

    // ====================================
    // UPDATE FIREBASE AUTH DISPLAY NAME
    // ====================================

    await updateProfile(currentUser, {
      displayName: name,
    });

    // ====================================
    // UPDATE FIRESTORE
    // ====================================

    const userRef = doc(db, "users", currentUser.uid);

    await setDoc(
      userRef,
      {
        uid: currentUser.uid,

        name: name,

        username: username,

        email: currentUser.email,

        phone: phone,

        country: country,

        bio: bio,

        profilePicture: profilePictureURL,

        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    currentProfilePicture = profilePictureURL;

    // ====================================
    // UPDATE HEADER
    // ====================================

    updateHeader(currentUser, name, profilePictureURL);

    // ====================================
    // UPDATE PROFILE PICTURE
    // ====================================

    if (profilePictureURL) {
      profilePreview.src = profilePictureURL;

      profilePreview.classList.remove("hidden");

      defaultProfilePicture.style.display = "none";
    }

    profilePictureInput.value = "";

    selectedFileName.textContent = "No new file selected";

    showSuccess("Profile updated successfully!");
  } catch (error) {
    console.error("❌ Profile update error:", error);

    showError("Failed to update profile. Please try again.");
  } finally {
    saveProfileBtn.disabled = false;

    saveProfileBtn.textContent = "Save Profile";
  }
});

// ============================================
// UPDATE HEADER
// ============================================

function updateHeader(user, customName = null, profilePicture = null) {
  const headerUserName = document.getElementById("headerUserName");

  const headerAvatar = document.getElementById("headerAvatar");

  const name =
    customName || user.displayName || user.email?.split("@")[0] || "User";

  if (headerUserName) {
    headerUserName.textContent = name;
  }

  if (headerAvatar) {
    headerAvatar.textContent = name.charAt(0).toUpperCase();
  }
}

// ============================================
// LOGOUT
// ============================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      await signOut(auth);

      window.location.href = "index.php";
    } catch (error) {
      console.error("Logout error:", error);
    }
  });
}

// ============================================
// SUCCESS MESSAGE
// ============================================

function showSuccess(message) {
  profileSuccess.textContent = message;

  profileSuccess.style.display = "block";

  profileError.style.display = "none";
}

// ============================================
// ERROR MESSAGE
// ============================================

function showError(message) {
  profileError.textContent = message;

  profileError.style.display = "block";

  profileSuccess.style.display = "none";
}

// ============================================
// HIDE MESSAGES
// ============================================

function hideMessages() {
  profileSuccess.style.display = "none";

  profileError.style.display = "none";
}
