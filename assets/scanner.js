import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const scannerForm = document.getElementById("scannerForm");

const scanTarget = document.getElementById("scanTarget");

const scanBtn = document.getElementById("scanBtn");

const scanError = document.getElementById("scanError");

let currentUser = null;

// ==========================================
// CHECK LOGIN
// ==========================================

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.php";

    return;
  }

  currentUser = user;

  updateHeader(user);
});

// ==========================================
// SCANNER FORM
// ==========================================

scannerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  hideError();

  const scanType = document.querySelector(
    'input[name="scan_type"]:checked',
  ).value;

  const target = scanTarget.value.trim();

  if (!target) {
    showError("Please enter information to scan.");

    return;
  }

  // ==================================
  // VALIDATE EMAIL
  // ==================================

  if (scanType === "email" && !isValidEmail(target)) {
    showError("Please enter a valid email address.");

    return;
  }

  try {
    scanBtn.disabled = true;

    scanBtn.textContent = "Scanning...";

    // ==================================
    // RUN LOCAL HEURISTIC SCAN
    // ==================================

    const findings = runLocalScan(scanType, target);

    const riskScore = calculateHighestRisk(findings);

    const riskLevel = getRiskLabel(riskScore);

    // ==================================
    // IMPORTANT:
    // NEVER STORE RAW PASSWORD
    // ==================================

    const storedTarget = scanType === "password" ? "[Password hidden]" : target;

    // ==================================
    // SAVE MAIN SCAN
    // ==================================

    const scanDocument = await addDoc(collection(db, "scans"), {
      userId: currentUser.uid,

      scanType: scanType,

      target: storedTarget,

      status: "completed",

      riskScore: riskScore,

      riskLevel: riskLevel,

      summary: `${findings.length} local heuristic finding(s) generated.`,

      findings: findings,

      createdAt: serverTimestamp(),

      completedAt: serverTimestamp(),
    });

    // ==================================
    // SAVE EXTRA SECURITY DATA
    // ==================================

    await createRelatedRecords(
      scanType,
      target,
      findings,
      riskScore,
      scanDocument.id,
    );

    console.log("✅ Scan saved:", scanDocument.id);

    // ==================================
    // GO TO RESULT PAGE
    // ==================================

    window.location.href = `scan_detail.php?id=${scanDocument.id}`;
  } catch (error) {
    console.error("❌ Scan error:", error);

    scanBtn.disabled = false;

    scanBtn.textContent = "Run exposure scan";

    showError("Unable to complete the scan. Please try again.");
  }
});

// ==========================================
// LOCAL SCANNER
// ==========================================

function runLocalScan(type, target) {
  const findings = [];

  const lowerTarget = target.toLowerCase();

  // ======================================
  // EMAIL SCAN
  // ======================================

  if (type === "email") {
    findings.push({
      type: "exposure",

      title: "Email exposure assessment",

      description:
        "The email address was checked using the local heuristic exposure engine.",

      risk: "Low",

      score: 15,

      source: "Local heuristic engine",
    });

    if (lowerTarget.includes("test") || lowerTarget.includes("admin")) {
      findings.push({
        type: "leak",

        title: "Possible credential exposure pattern",

        description:
          "The email contains a commonly used account naming pattern that may increase exposure risk.",

        risk: "Medium",

        score: 45,

        source: "Local heuristic engine",
      });
    }

    if (lowerTarget.includes("admin")) {
      findings.push({
        type: "leak",

        title: "High-value account identifier",

        description:
          "Administrative-style email addresses may be targeted more frequently by attackers.",

        risk: "High",

        score: 65,

        source: "Local heuristic engine",
      });
    }
  }

  // ======================================
  // USERNAME SCAN
  // ======================================
  else if (type === "username") {
    let score = 20;

    let level = "Low";

    if (target.length <= 5) {
      score = 40;

      level = "Medium";
    }

    findings.push({
      type: "username",

      title: "Username exposure assessment",

      description:
        "The username was evaluated for common exposure and identification patterns.",

      risk: level,

      score: score,

      source: "Local heuristic engine",
    });

    if (lowerTarget.includes("admin") || lowerTarget.includes("root")) {
      findings.push({
        type: "suspicious",

        title: "Privileged username pattern",

        description:
          "The username resembles a privileged or administrative account name.",

        risk: "High",

        score: 60,

        source: "Local heuristic engine",
      });
    }
  }

  // ======================================
  // DOMAIN / URL
  // ======================================
  else if (type === "domain") {
    let score = 15;

    let level = "Low";

    const suspiciousWords = [
      "login",

      "verify",

      "secure",

      "account",

      "update",

      "bank",

      "paypal",

      "signin",

      "password",
    ];

    const matchedWord = suspiciousWords.find((word) =>
      lowerTarget.includes(word),
    );

    if (matchedWord) {
      score = 60;

      level = "High";

      findings.push({
        type: "phishing",

        title: "Suspicious URL keyword detected",

        description: `The domain or URL contains the suspicious keyword "${matchedWord}".`,

        risk: "High",

        score: 60,

        source: "Local heuristic engine",
      });
    }

    if (lowerTarget.includes("@") || lowerTarget.includes("bit.ly")) {
      findings.push({
        type: "suspicious",

        title: "Potential URL obfuscation",

        description:
          "The URL contains a pattern sometimes associated with misleading or shortened links.",

        risk: "Medium",

        score: 45,

        source: "Local heuristic engine",
      });
    }

    findings.push({
      type: "domain",

      title: "Domain reputation assessment",

      description:
        "The domain was checked using local URL and phishing-pattern heuristics.",

      risk: level,

      score: score,

      source: "Local heuristic engine",
    });
  }

  // ======================================
  // PASSWORD
  // ======================================
  else if (type === "password") {
    let score = 10;

    let level = "Low";

    let description = "The password meets the basic local strength checks.";

    if (target.length < 8) {
      score = 85;

      level = "Critical";

      description =
        "The password is too short and may be vulnerable to guessing or brute-force attacks.";
    } else if (target.length < 12) {
      score = 55;

      level = "High";

      description =
        "The password length is below the recommended strength for important accounts.";
    }

    const commonPasswords = [
      "password",

      "password123",

      "12345678",

      "qwerty123",

      "admin123",

      "letmein",

      "welcome123",
    ];

    if (commonPasswords.includes(lowerTarget)) {
      score = 95;

      level = "Critical";

      description = "The password matches a commonly used password pattern.";
    }

    if (
      !/[A-Z]/.test(target) ||
      !/[a-z]/.test(target) ||
      !/[0-9]/.test(target) ||
      !/[^A-Za-z0-9]/.test(target)
    ) {
      score = Math.max(score, 50);

      if (level === "Low") {
        level = "High";
      }
    }

    findings.push({
      type: "password",

      title: "Password strength assessment",

      description: description,

      risk: level,

      score: score,

      source: "Local heuristic engine",
    });
  }

  return findings;
}

// ==========================================
// CREATE THREAT / BREACH / NOTIFICATION
// ==========================================

async function createRelatedRecords(
  scanType,
  target,
  findings,
  riskScore,
  scanId,
) {
  const promises = [];

  findings.forEach((finding) => {
    // ==================================
    // BREACH
    // ==================================

    if (scanType === "email" && finding.type === "leak") {
      promises.push(
        addDoc(collection(db, "breaches"), {
          userId: currentUser.uid,

          scanId: scanId,

          email: target,

          breachName: finding.title,

          description: finding.description,

          source: finding.source,

          riskLevel: finding.risk,

          isCompromised: true,

          createdAt: serverTimestamp(),
        }),
      );
    }

    // ==================================
    // THREAT
    // ==================================

    if (
      scanType === "domain" &&
      ["phishing", "malware", "suspicious"].includes(finding.type)
    ) {
      promises.push(
        addDoc(collection(db, "threats"), {
          userId: currentUser.uid,

          scanId: scanId,

          target: target,

          threatType: finding.type,

          description: finding.description,

          severity: finding.risk,

          source: finding.source,

          resolved: false,

          createdAt: serverTimestamp(),
        }),
      );
    }
  });

  // ======================================
  // NOTIFICATION
  // ======================================

  if (riskScore >= 40) {
    promises.push(
      addDoc(collection(db, "notifications"), {
        userId: currentUser.uid,

        scanId: scanId,

        type: "alert",

        title: `Security finding: ${getRiskLabel(riskScore)} risk`,

        message:
          scanType === "password"
            ? "A password scan detected a security risk."
            : `A ${scanType} scan detected potential exposure for ${target}.`,

        isRead: false,

        createdAt: serverTimestamp(),
      }),
    );
  }

  await Promise.all(promises);
}

// ==========================================
// CALCULATE RISK
// ==========================================

function calculateHighestRisk(findings) {
  let max = 0;

  findings.forEach((finding) => {
    const score = Number(finding.score || 0);

    if (score > max) {
      max = score;
    }
  });

  return max;
}

// ==========================================
// RISK LABEL
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
// VALID EMAIL
// ==========================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
// ERROR
// ==========================================

function showError(message) {
  scanError.textContent = message;

  scanError.style.display = "block";
}

function hideError() {
  scanError.style.display = "none";
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
