import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const reportViewLoading = document.getElementById("reportViewLoading");

const reportPaper = document.getElementById("reportPaper");

const urlParams = new URLSearchParams(window.location.search);

const reportId = urlParams.get("id");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.php";

    return;
  }

  updateHeader(user);

  if (!reportId) {
    window.location.href = "reports.php";

    return;
  }

  await loadReport(reportId, user.uid);
});

// ==========================================
// LOAD REPORT
// ==========================================

async function loadReport(id, uid) {
  try {
    const reportRef = doc(db, "reports", id);

    const snapshot = await getDoc(reportRef);

    if (!snapshot.exists()) {
      reportViewLoading.textContent = "Report not found.";

      return;
    }

    const report = snapshot.data();

    if (report.userId !== uid) {
      reportViewLoading.textContent = "Report not found.";

      return;
    }

    const score = Number(report.riskScoreOverall || 0);

    const riskLevel = report.riskLevel || getRiskLabel(score);

    document.getElementById("reportTitle").textContent =
      report.title || "Exposure Report";

    document.getElementById("reportSummary").textContent =
      report.summary || "-";

    document.getElementById("reportScore").textContent = `${score}/100`;

    document.getElementById("reportRisk").textContent = `${riskLevel} Risk`;

    renderRecommendations(report.recommendations || []);

    document.getElementById("reportGenerated").textContent =
      `Generated: ${formatTimestamp(
        report.createdAt,
      )} · Prototype report without external OSINT API data.`;

    reportViewLoading.style.display = "none";

    reportPaper.style.display = "block";
  } catch (error) {
    console.error("❌ Report load error:", error);

    reportViewLoading.textContent = "Unable to load report.";
  }
}

// ==========================================
// RECOMMENDATIONS
// ==========================================

function renderRecommendations(recommendations) {
  const list = document.getElementById("reportRecommendations");

  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    list.innerHTML = "<li>No recommendations available.</li>";

    return;
  }

  let html = "";

  recommendations.forEach((recommendation) => {
    html += `

                <li>

                    ${escapeHtml(recommendation)}

                </li>

            `;
  });

  list.innerHTML = html;
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

// ==========================================
// DATE
// ==========================================

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "-";
  }

  try {
    return timestamp.toDate().toLocaleString("en-MY", {
      dateStyle: "medium",

      timeStyle: "short",
    });
  } catch (error) {
    return "-";
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

    await signOut(auth);

    window.location.href = "index.php";
  });
}
