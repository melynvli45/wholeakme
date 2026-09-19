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
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const generateReportBtn = document.getElementById("generateReportBtn");

const reportLoading = document.getElementById("reportLoading");

const emptyReports = document.getElementById("emptyReports");

const reportTable = document.getElementById("reportTable");

const reportTableBody = document.getElementById("reportTableBody");

const reportMessage = document.getElementById("reportMessage");

const reportError = document.getElementById("reportError");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.php";

    return;
  }

  currentUser = user;

  updateHeader(user);

  await loadReports(user.uid);
});

// ==========================================
// GENERATE REPORT
// ==========================================

generateReportBtn.addEventListener("click", async () => {
  if (!currentUser) {
    return;
  }

  hideMessages();

  try {
    generateReportBtn.disabled = true;

    generateReportBtn.textContent = "Generating...";

    // ==================================
    // LOAD USER SCANS
    // ==================================

    const scansQuery = query(
      collection(db, "scans"),

      where("userId", "==", currentUser.uid),
    );

    const scanSnapshot = await getDocs(scansQuery);

    let highestRisk = 0;
    let totalScans = 0;

    scanSnapshot.forEach((documentSnapshot) => {
      const scan = documentSnapshot.data();

      const score = Number(scan.riskScore || 0);

      totalScans++;

      if (score > highestRisk) {
        highestRisk = score;
      }
    });

    // ==================================
    // RECOMMENDATIONS
    // ==================================

    const recommendations = [
      "Enable multi-factor authentication on important accounts.",

      "Use unique passwords for every online service.",

      "Change passwords associated with compromised accounts.",

      "Avoid suspicious websites and verify links before entering credentials.",

      "Review account privacy settings regularly.",
    ];

    const title = `Exposure Report - ${formatReportDate(new Date())}`;

    const summary =
      totalScans === 0
        ? "No scans were available when this report was generated."
        : `Generated local report based on ${totalScans} stored scan(s) and current exposure findings.`;

    await addDoc(collection(db, "reports"), {
      userId: currentUser.uid,

      title: title,

      summary: summary,

      riskScoreOverall: highestRisk,

      riskLevel: getRiskLabel(highestRisk),

      totalScans: totalScans,

      recommendations: recommendations,

      createdAt: serverTimestamp(),
    });

    showSuccess("Report generated successfully!");

    await loadReports(currentUser.uid);
  } catch (error) {
    console.error("❌ Generate report error:", error);

    showError("Unable to generate report.");
  } finally {
    generateReportBtn.disabled = false;

    generateReportBtn.textContent = "Generate report";
  }
});

// ==========================================
// LOAD REPORTS
// ==========================================

async function loadReports(uid) {
  try {
    const reportsQuery = query(
      collection(db, "reports"),

      where("userId", "==", uid),
    );

    const snapshot = await getDocs(reportsQuery);

    const reports = [];

    snapshot.forEach((documentSnapshot) => {
      reports.push({
        id: documentSnapshot.id,

        ...documentSnapshot.data(),
      });
    });

    reports.sort((a, b) => {
      return (
        getTimestampMilliseconds(b.createdAt) -
        getTimestampMilliseconds(a.createdAt)
      );
    });

    reportLoading.style.display = "none";

    if (reports.length === 0) {
      emptyReports.style.display = "block";

      reportTable.style.display = "none";

      return;
    }

    emptyReports.style.display = "none";

    renderReports(reports);

    reportTable.style.display = "block";
  } catch (error) {
    console.error("❌ Load reports error:", error);

    reportLoading.textContent = "Unable to load reports.";
  }
}

// ==========================================
// RENDER REPORTS
// ==========================================

function renderReports(reports) {
  let html = "";

  reports.forEach((report) => {
    const score = Number(report.riskScoreOverall || 0);

    const riskLevel = report.riskLevel || getRiskLabel(score);

    html += `

                <tr>

                    <td>

                        ${escapeHtml(report.title || "Exposure Report")}

                    </td>


                    <td>

                        <span
                            class="badge ${getRiskClass(riskLevel)}"
                        >

                            ${score}

                        </span>

                    </td>


                    <td>

                        ${escapeHtml(formatTimestamp(report.createdAt))}

                    </td>


                    <td>

                        <a
                            href="report_view.php?id=${encodeURIComponent(
                              report.id,
                            )}"
                            target="_blank"
                        >
                            Open / Print
                        </a>

                    </td>

                </tr>

            `;
  });

  reportTableBody.innerHTML = html;
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

function formatReportDate(date) {
  return date.toLocaleString("en-MY", {
    year: "numeric",

    month: "2-digit",

    day: "2-digit",

    hour: "2-digit",

    minute: "2-digit",
  });
}

// ==========================================
// MESSAGES
// ==========================================

function showSuccess(message) {
  reportMessage.textContent = message;

  reportMessage.style.display = "block";

  reportError.style.display = "none";
}

function showError(message) {
  reportError.textContent = message;

  reportError.style.display = "block";

  reportMessage.style.display = "none";
}

function hideMessages() {
  reportMessage.style.display = "none";

  reportError.style.display = "none";
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

    await signOut(auth);

    window.location.href = "index.php";
  });
}
