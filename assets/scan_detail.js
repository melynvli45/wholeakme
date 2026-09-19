import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const scanLoading = document.getElementById("scanLoading");

const scanContent = document.getElementById("scanContent");

let currentUser = null;

// ==========================================
// GET SCAN ID FROM URL
// ==========================================

const urlParams = new URLSearchParams(window.location.search);

const scanId = urlParams.get("id");

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

  if (!scanId) {
    window.location.href = "scans.php";

    return;
  }

  await loadScan(scanId, user.uid);
});

// ==========================================
// LOAD SCAN
// ==========================================

async function loadScan(id, uid) {
  try {
    const scanRef = doc(db, "scans", id);

    const snapshot = await getDoc(scanRef);

    if (!snapshot.exists()) {
      window.location.href = "scans.php";

      return;
    }

    const scan = snapshot.data();

    // VERY IMPORTANT:
    // Make sure scan belongs to logged-in user

    if (scan.userId !== uid) {
      window.location.href = "scans.php";

      return;
    }

    document.getElementById("scanType").textContent = `${String(
      scan.scanType || "scan",
    ).toUpperCase()} SCAN`;

    document.getElementById("scanTarget").textContent = scan.target || "-";

    document.getElementById("scanSummary").textContent =
      scan.summary || "Scan completed.";

    document.getElementById("riskScore").textContent = scan.riskScore || 0;

    document.getElementById("riskLabel").textContent =
      scan.riskLevel || getRiskLabel(Number(scan.riskScore || 0));

    renderFindings(scan.findings || []);

    scanLoading.style.display = "none";

    scanContent.style.display = "block";
  } catch (error) {
    console.error("❌ Error loading scan:", error);

    scanLoading.textContent = "Unable to load scan results.";
  }
}

// ==========================================
// DISPLAY FINDINGS
// ==========================================

function renderFindings(findings) {
  const container = document.getElementById("findingsContainer");

  if (findings.length === 0) {
    container.innerHTML = `

            <div class="empty">

                No findings were generated.

            </div>

        `;

    return;
  }

  let html = "";

  findings.forEach((finding) => {
    html += `

                <article class="finding">

                    <div>

                        <span class="badge ${getRiskClass(finding.risk)}">

                            ${escapeHtml(finding.risk || "Low")}

                        </span>


                        <h3>

                            ${escapeHtml(finding.title || "Finding")}

                        </h3>


                        <p>

                            ${escapeHtml(finding.description || "")}

                        </p>


                        <small>

                            Source:
                            ${escapeHtml(
                              finding.source || "Local heuristic engine",
                            )}

                        </small>

                    </div>


                    <div class="recommend">

                        <b>
                            Recommended action
                        </b>

                        <p>

                            ${escapeHtml(getRecommendation(finding.type))}

                        </p>

                    </div>

                </article>

            `;
  });

  container.innerHTML = html;
}

// ==========================================
// RECOMMENDATIONS
// ==========================================

function getRecommendation(type) {
  switch (type) {
    case "leak":
      return "Change passwords associated with the exposed account and enable multi-factor authentication.";

    case "phishing":
      return "Avoid entering credentials on this website and verify the domain before continuing.";

    case "malware":
      return "Avoid accessing the suspicious resource and run a security scan on your device.";

    case "suspicious":
      return "Verify the source carefully before interacting with the account, link or website.";

    case "password":
      return "Use a longer unique password containing uppercase, lowercase, numbers and symbols.";

    case "username":
      return "Avoid reusing the same username together with identifiable personal information across services.";

    default:
      return "Review your account security settings and reduce unnecessary public personal information.";
  }
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
