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
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const threatLoading = document.getElementById("threatLoading");

const emptyThreats = document.getElementById("emptyThreats");

const threatList = document.getElementById("threatList");

let currentUser = null;

// ==========================================
// AUTH CHECK
// ==========================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.php";

    return;
  }

  currentUser = user;

  updateHeader(user);

  await loadThreats(user.uid);
});

// ==========================================
// LOAD THREATS
// ==========================================

async function loadThreats(uid) {
  try {
    const threatsQuery = query(
      collection(db, "threats"),

      where("userId", "==", uid),
    );

    const snapshot = await getDocs(threatsQuery);

    const threats = [];

    snapshot.forEach((documentSnapshot) => {
      threats.push({
        id: documentSnapshot.id,

        ...documentSnapshot.data(),
      });
    });

    // ==================================
    // SORT NEWEST FIRST
    // ==================================

    threats.sort((a, b) => {
      const timeA = getTimestampMilliseconds(a.createdAt);

      const timeB = getTimestampMilliseconds(b.createdAt);

      return timeB - timeA;
    });

    threatLoading.style.display = "none";

    if (threats.length === 0) {
      emptyThreats.style.display = "block";

      return;
    }

    renderThreats(threats);

    threatList.style.display = "block";
  } catch (error) {
    console.error("❌ Threat loading error:", error);

    threatLoading.textContent = "Unable to load threat detections.";
  }
}

// ==========================================
// RENDER THREATS
// ==========================================

function renderThreats(threats) {
  let html = "";

  threats.forEach((threat) => {
    const severity = threat.severity || "Low";

    const statusText = threat.resolved ? "Resolved" : "Active";

    html += `

                <div
                    class="threat-card"
                    data-threat-id="${escapeHtml(threat.id)}"
                >

                    <span
                        class="badge ${getRiskClass(severity)}"
                    >

                        ${escapeHtml(severity)}

                    </span>


                    <h3>

                        ${escapeHtml(
                          formatThreatType(threat.threatType || "Threat"),
                        )}

                    </h3>


                    <p>

                        ${escapeHtml(threat.description || "")}

                    </p>


                    <small>

                        ${escapeHtml(threat.target || "-")}

                        ·

                        ${escapeHtml(formatTimestamp(threat.createdAt))}

                    </small>


                    <p>

                        <b>

                            ${statusText}

                        </b>

                    </p>


                    ${
                      threat.resolved
                        ? ""
                        : `

                                <button
                                    class="btn ghost small resolve-threat-btn"
                                    data-id="${escapeHtml(threat.id)}"
                                >
                                    Mark as resolved
                                </button>

                            `
                    }

                </div>

            `;
  });

  threatList.innerHTML = html;

  attachResolveButtons();
}

// ==========================================
// RESOLVE BUTTON
// ==========================================

function attachResolveButtons() {
  const buttons = document.querySelectorAll(".resolve-threat-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const threatId = button.dataset.id;

      if (!threatId || !currentUser) {
        return;
      }

      try {
        button.disabled = true;

        button.textContent = "Updating...";

        const threatRef = doc(db, "threats", threatId);

        await updateDoc(threatRef, {
          resolved: true,

          resolvedAt: serverTimestamp(),
        });

        console.log("✅ Threat resolved:", threatId);

        await loadThreats(currentUser.uid);
      } catch (error) {
        console.error("❌ Resolve threat error:", error);

        button.disabled = false;

        button.textContent = "Mark as resolved";
      }
    });
  });
}

// ==========================================
// FORMAT THREAT TYPE
// ==========================================

function formatThreatType(value) {
  return String(value)
    .replace(/_/g, " ")

    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

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
// RISK CLASS
// ==========================================

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
// SAFE HTML
// ==========================================

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
