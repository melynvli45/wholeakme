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
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const loadingDashboard = document.getElementById("loadingDashboard");

const dashboardContent = document.getElementById("dashboardContent");

onAuthStateChanged(auth, async (user) => {
  // If user is not logged in
  if (!user) {
    window.location.href = "index.php";

    return;
  }

  console.log("✅ Logged in user:", user.email);
  console.log("Firebase UID:", user.uid);

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

  // ===============================
  // LOAD DASHBOARD DATA
  // ===============================

  try {
    await loadDashboard(user.uid);

    if (loadingDashboard) {
      loadingDashboard.style.display = "none";
    }

    if (dashboardContent) {
      dashboardContent.style.display = "block";
    }
  } catch (error) {
    console.error("❌ Dashboard error:", error);

    if (loadingDashboard) {
      loadingDashboard.textContent = "Unable to load dashboard.";
    }
  }
});

async function loadDashboard(uid) {
  await Promise.all([
    loadScans(uid),

    loadThreats(uid),

    loadBreaches(uid),

    loadNotifications(uid),
  ]);
}

// ======================================
// LOAD SCANS
// ======================================

async function loadScans(uid) {
  const scansRef = collection(db, "scans");

  const scansQuery = query(scansRef, where("userId", "==", uid));

  const snapshot = await getDocs(scansQuery);

  let totalScans = 0;

  let highestRisk = 0;

  const scans = [];

  snapshot.forEach((document) => {
    const data = document.data();

    totalScans++;

    const riskScore = Number(data.riskScore || 0);

    if (riskScore > highestRisk) {
      highestRisk = riskScore;
    }

    scans.push({
      id: document.id,

      ...data,
    });
  });

  document.getElementById("totalScans").textContent = totalScans;

  document.getElementById("riskScore").textContent = highestRisk;

  document.getElementById("exposureScore").textContent = highestRisk;

  const risk = getRiskLabel(highestRisk);

  document.getElementById("riskLabel").textContent = risk;

  document.getElementById("exposureRiskLabel").textContent = risk + " risk";

  showRecentScans(scans);
}

// ======================================
// SHOW RECENT SCANS
// ======================================

function showRecentScans(scans) {
  const container = document.getElementById("recentScans");

  if (!container) {
    return;
  }

  if (scans.length === 0) {
    container.innerHTML = `

            <div class="empty">
                No scans yet. Run your first exposure scan.
            </div>

        `;

    return;
  }

  scans.sort((a, b) => {
    const dateA = getTimestampSeconds(a.createdAt);

    const dateB = getTimestampSeconds(b.createdAt);

    return dateB - dateA;
  });

  const recent = scans.slice(0, 6);

  let rows = "";

  recent.forEach((scan) => {
    const riskScore = Number(scan.riskScore || 0);

    const riskLabel = getRiskLabel(riskScore);

    const date = formatFirestoreDate(scan.createdAt);

    rows += `

            <tr>

                <td>
                    ${escapeHtml(scan.scanType || "-")}
                </td>

                <td>
                    ${escapeHtml(scan.target || "-")}
                </td>

                <td>
                    ${escapeHtml(riskLabel)}
                </td>

                <td>
                    ${escapeHtml(date)}
                </td>

            </tr>

        `;
  });

  container.innerHTML = `

        <div class="table-wrap">

            <table>

                <tr>

                    <th>
                        Type
                    </th>

                    <th>
                        Target
                    </th>

                    <th>
                        Risk
                    </th>

                    <th>
                        Date
                    </th>

                </tr>

                ${rows}

            </table>

        </div>

    `;
}

// ======================================
// LOAD THREATS
// ======================================

async function loadThreats(uid) {
  const threatsRef = collection(db, "threats");

  const threatsQuery = query(
    threatsRef,
    where("userId", "==", uid),
    where("resolved", "==", false),
  );

  const snapshot = await getDocs(threatsQuery);

  const activeThreats = document.getElementById("activeThreats");

  if (activeThreats) {
    activeThreats.textContent = snapshot.size;
  }
}

// ======================================
// LOAD BREACHES
// ======================================

async function loadBreaches(uid) {
  const breachesRef = collection(db, "breaches");

  const breachesQuery = query(
    breachesRef,
    where("userId", "==", uid),
    where("isCompromised", "==", true),
  );

  const snapshot = await getDocs(breachesQuery);

  const breachFindings = document.getElementById("breachFindings");

  if (breachFindings) {
    breachFindings.textContent = snapshot.size;
  }
}

// ======================================
// LOAD NOTIFICATIONS
// ======================================

async function loadNotifications(uid) {
  const notificationsRef = collection(db, "notifications");

  const notificationsQuery = query(
    notificationsRef,
    where("userId", "==", uid),
  );

  const snapshot = await getDocs(notificationsQuery);

  const notifications = [];

  snapshot.forEach((document) => {
    notifications.push({
      id: document.id,

      ...document.data(),
    });
  });

  notifications.sort((a, b) => {
    const dateA = getTimestampSeconds(a.createdAt);

    const dateB = getTimestampSeconds(b.createdAt);

    return dateB - dateA;
  });

  showNotifications(notifications.slice(0, 5));
}

// ======================================
// SHOW NOTIFICATIONS
// ======================================

function showNotifications(notifications) {
  const container = document.getElementById("latestAlerts");

  if (!container) {
    return;
  }

  if (notifications.length === 0) {
    container.innerHTML = `

            <div class="empty">
                No notifications yet.
            </div>

        `;

    return;
  }

  let html = `

        <div class="alerts-list">

    `;

  notifications.forEach((notification) => {
    const date = formatFirestoreDate(notification.createdAt);

    html += `

                <div class="notification">

                    <b>
                        ${escapeHtml(notification.title || "Notification")}
                    </b>

                    <span>
                        ${escapeHtml(notification.message || "")}
                    </span>

                    <small>
                        ${escapeHtml(date)}
                    </small>

                </div>

            `;
  });

  html += `

        </div>

    `;

  container.innerHTML = html;
}

// ======================================
// RISK LABEL
// ======================================

function getRiskLabel(score) {
  if (score >= 75) {
    return "Critical";
  }

  if (score >= 50) {
    return "High";
  }

  if (score >= 25) {
    return "Medium";
  }

  return "Low";
}

// ======================================
// FIRESTORE DATE HELPERS
// ======================================

function getTimestampSeconds(timestamp) {
  if (!timestamp) {
    return 0;
  }

  if (typeof timestamp.seconds === "number") {
    return timestamp.seconds;
  }

  if (typeof timestamp.toDate === "function") {
    return Math.floor(timestamp.toDate().getTime() / 1000);
  }

  return 0;
}

function formatFirestoreDate(timestamp) {
  if (!timestamp) {
    return "-";
  }

  try {
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleString();
    }

    if (typeof timestamp.seconds === "number") {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    return "-";
  } catch (error) {
    console.error("Date error:", error);

    return "-";
  }
}

// ======================================
// ESCAPE HTML
// ======================================

function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = String(value);

  return div.innerHTML;
}

// ======================================
// FIREBASE LOGOUT
// ======================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      await signOut(auth);

      console.log("✅ Logout successful");

      window.location.href = "index.php";
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  });
}
