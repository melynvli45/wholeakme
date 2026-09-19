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

const scanHistoryLoading = document.getElementById("scanHistoryLoading");

const scanHistoryContent = document.getElementById("scanHistoryContent");

const scanHistoryBody = document.getElementById("scanHistoryBody");

const emptyScanHistory = document.getElementById("emptyScanHistory");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.php";

    return;
  }

  updateHeader(user);

  await loadScanHistory(user.uid);
});

// ==========================================
// LOAD SCAN HISTORY
// ==========================================

async function loadScanHistory(uid) {
  try {
    const scansQuery = query(
      collection(db, "scans"),

      where("userId", "==", uid),
    );

    const snapshot = await getDocs(scansQuery);

    const scans = [];

    snapshot.forEach((documentSnapshot) => {
      scans.push({
        id: documentSnapshot.id,

        ...documentSnapshot.data(),
      });
    });

    // ==================================
    // SORT NEWEST FIRST
    // ==================================

    scans.sort((a, b) => {
      const timeA = getTimestampMilliseconds(a.createdAt);

      const timeB = getTimestampMilliseconds(b.createdAt);

      return timeB - timeA;
    });

    scanHistoryLoading.style.display = "none";

    if (scans.length === 0) {
      emptyScanHistory.style.display = "block";

      return;
    }

    renderScans(scans);

    scanHistoryContent.style.display = "block";
  } catch (error) {
    console.error("❌ Scan history error:", error);

    scanHistoryLoading.textContent = "Unable to load scan history.";
  }
}

// ==========================================
// RENDER TABLE
// ==========================================

function renderScans(scans) {
  let html = "";

  scans.forEach((scan) => {
    const riskScore = Number(scan.riskScore || 0);

    const riskLevel = scan.riskLevel || getRiskLabel(riskScore);

    html += `

                <tr>

                    <td>

                        ${escapeHtml(capitalize(scan.scanType || "scan"))}

                    </td>


                    <td>

                        ${escapeHtml(scan.target || "-")}

                    </td>


                    <td>

                        ${escapeHtml(capitalize(scan.status || "completed"))}

                    </td>


                    <td>

                        <span
                            class="badge ${getRiskClass(riskLevel)}"
                        >

                            ${riskScore}
                            —
                            ${escapeHtml(riskLevel)}

                        </span>

                    </td>


                    <td>

                        ${escapeHtml(formatTimestamp(scan.createdAt))}

                    </td>


                    <td>

                        <a
                            href="scan_detail.php?id=${encodeURIComponent(
                              scan.id,
                            )}"
                        >
                            View
                        </a>

                    </td>

                </tr>

            `;
  });

  scanHistoryBody.innerHTML = html;
}

// ==========================================
// DATE FORMAT
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
// RISK
// ==========================================

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

function getRiskClass(risk) {
  switch (String(risk).toLowerCase()) {
    case "critical":
      return "critical";

    case "high":
      return "high";

    case "medium":
      return "medium";

    default:
      return "low";
  }
}

// ==========================================
// TEXT
// ==========================================

function capitalize(value) {
  const text = String(value);

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = String(value);

  return div.innerHTML;
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
