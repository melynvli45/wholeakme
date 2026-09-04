<?php require_once __DIR__ . '/includes/auth.php';
requireLogin();
$pageTitle = 'Digital Footprint Scanner';
include __DIR__ . '/includes/header.php'; ?>
<section class="scanner-card"><span class="eyebrow">LOCAL DEMO MODE — NO API KEY REQUIRED</span>
    <h2>Scan your digital footprint</h2>
    <p>Scan an email, username, domain/URL, or password exposure indicator. Real OSINT API integration can be added later without changing the database design.</p>
    <form method="post" action="scan_process.php">
        <div class="scan-options"><label><input type="radio" name="scan_type" value="email" checked><span>✉ Email</span></label><label><input type="radio" name="scan_type" value="username"><span>♙ Username</span></label><label><input type="radio" name="scan_type" value="domain"><span>◉ Domain / URL</span></label><label><input type="radio" name="scan_type" value="password"><span>⌁ Password check</span></label></div><input class="big-input" name="target" placeholder="Enter information to scan..." required><small class="muted">Password scans are evaluated in memory and the password is not stored.</small><button class="btn primary large" type="submit">Run exposure scan</button>
    </form>
</section>
<section class="panel info-panel">
    <h3>What this prototype detects</h3>
    <div class="three-col">
        <div><b>Credential exposure</b>
            <p>Local breach-style indicators and repeated exposure simulations.</p>
        </div>
        <div><b>Suspicious websites</b>
            <p>URL patterns associated with phishing and unsafe behaviour.</p>
        </div>
        <div><b>Risk scoring</b>
            <p>Low, Medium, High and Critical classification based on findings.</p>
        </div>
    </div>
</section><?php include __DIR__ . '/includes/footer.php'; ?>