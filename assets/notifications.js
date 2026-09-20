import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const notificationLoading = document.getElementById("notificationLoading");

const notificationList = document.getElementById("notificationList");

const emptyNotifications = document.getElementById("emptyNotifications");

const markAllReadBtn = document.getElementById("markAllReadBtn");

let currentUser = null;

// ==========================================
// AUTH
// ==========================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.php";

    return;
  }

  currentUser = user;

  updateHeader(user);

  await loadNotifications(user.uid);
});

// ===============================
// HEADER USER NAME + AVATAR
// ===============================

const userName = user.displayName || user.email?.split("@")[0] || "User";

const headerUserName = document.getElementById("headerUserName");

const headerAvatar = document.getElementById("headerAvatar");

if (headerUserName) {
  headerUserName.textContent = userName;
}

if (headerAvatar) {
  headerAvatar.textContent = userName.charAt(0).toUpperCase();
}

// ==========================================
// LOAD NOTIFICATIONS
// ==========================================

async function loadNotifications(uid) {
  try {
    const notificationQuery = query(
      collection(db, "notifications"),

      where("userId", "==", uid),
    );

    const snapshot = await getDocs(notificationQuery);

    const notifications = [];

    snapshot.forEach((documentSnapshot) => {
      notifications.push({
        id: documentSnapshot.id,

        ...documentSnapshot.data(),
      });
    });

    // ==================================
    // SORT NEWEST FIRST
    // ==================================

    notifications.sort((a, b) => {
      const timeA = getTimestampMilliseconds(a.createdAt);

      const timeB = getTimestampMilliseconds(b.createdAt);

      return timeB - timeA;
    });

    notificationLoading.style.display = "none";

    if (notifications.length === 0) {
      emptyNotifications.style.display = "block";

      notificationList.style.display = "none";

      markAllReadBtn.style.display = "none";

      return;
    }

    renderNotifications(notifications);

    notificationList.style.display = "block";

    emptyNotifications.style.display = "none";

    const hasUnread = notifications.some(
      (notification) => !notification.isRead,
    );

    markAllReadBtn.style.display = hasUnread ? "inline-flex" : "none";
  } catch (error) {
    console.error("❌ Notification loading error:", error);

    notificationLoading.textContent = "Unable to load notifications.";
  }
}

// ==========================================
// RENDER
// ==========================================

function renderNotifications(notifications) {
  let html = "";

  notifications.forEach((notification) => {
    const isRead = notification.isRead === true;

    html += `

                <div
                    class="notification ${isRead ? "read" : ""}"
                    data-id="${escapeHtml(notification.id)}"
                >

                    <b>

                        ${escapeHtml(notification.title || "Security alert")}

                    </b>


                    <span>

                        ${escapeHtml(notification.message || "")}

                    </span>


                    <small>

                        ${escapeHtml(formatTimestamp(notification.createdAt))}

                    </small>


                    ${
                      isRead
                        ? ""
                        : `

                                <button
                                    type="button"
                                    class="btn ghost small mark-read-btn"
                                    data-id="${escapeHtml(notification.id)}"
                                >
                                    Mark as read
                                </button>

                            `
                    }

                </div>

            `;
  });

  notificationList.innerHTML = html;

  attachReadButtons();
}

// ==========================================
// MARK ONE AS READ
// ==========================================

function attachReadButtons() {
  const buttons = document.querySelectorAll(".mark-read-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const notificationId = button.dataset.id;

      if (!notificationId || !currentUser) {
        return;
      }

      try {
        button.disabled = true;

        button.textContent = "Updating...";

        const notificationRef = doc(db, "notifications", notificationId);

        await updateDoc(notificationRef, {
          isRead: true,
        });

        console.log("✅ Notification marked as read");

        await loadNotifications(currentUser.uid);
      } catch (error) {
        console.error("❌ Mark read error:", error);

        button.disabled = false;

        button.textContent = "Mark as read";
      }
    });
  });
}

// ==========================================
// MARK ALL AS READ
// ==========================================

markAllReadBtn.addEventListener("click", async () => {
  if (!currentUser) {
    return;
  }

  try {
    markAllReadBtn.disabled = true;

    markAllReadBtn.textContent = "Updating...";

    const unreadQuery = query(
      collection(db, "notifications"),

      where("userId", "==", currentUser.uid),

      where("isRead", "==", false),
    );

    const snapshot = await getDocs(unreadQuery);

    if (snapshot.empty) {
      await loadNotifications(currentUser.uid);

      return;
    }

    const batch = writeBatch(db);

    snapshot.forEach((documentSnapshot) => {
      const notificationRef = doc(db, "notifications", documentSnapshot.id);

      batch.update(notificationRef, {
        isRead: true,
      });
    });

    await batch.commit();

    console.log("✅ All notifications marked as read");

    await loadNotifications(currentUser.uid);
  } catch (error) {
    console.error("❌ Mark all read error:", error);
  } finally {
    markAllReadBtn.disabled = false;

    markAllReadBtn.textContent = "Mark all as read";
  }
});

// ==========================================
// DATE
// ==========================================

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "-";
  }

  try {
    const date = timestamp.toDate();

    return date.toLocaleString("en-MY", {
      dateStyle: "medium",

      timeStyle: "short",
    });
  } catch (error) {
    return "-";
  }
}

function getTimestampMilliseconds(timestamp) {
  if (!timestamp || typeof timestamp.toMillis !== "function") {
    return 0;
  }

  return timestamp.toMillis();
}

// ==========================================
// HEADER
// ==========================================

function updateHeader(user) {
  const headerUserName = document.getElementById("headerUserName");

  const headerAvatar = document.getElementById("headerAvatar");

  const name = user.displayName || user.email?.split("@")[0] || "User";

  if (headerUserName) {
    headerUserName.textContent = name;
  }

  if (headerAvatar) {
    headerAvatar.textContent = name.charAt(0).toUpperCase();
  }
}

// ==========================================
// SAFE HTML
// ==========================================

function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = String(value);

  return div.innerHTML;
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
      console.error("Logout error:", error);
    }
  });
}
