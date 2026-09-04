<?php require_once __DIR__ . '/includes/auth.php';
requireLogin();
$q = db()->prepare('SELECT * FROM reports WHERE report_id=? AND user_id=?');
$q->execute([$_GET['id'] ?? '', $_SESSION['user_id']]);
$r = $q->fetch();
if (!$r) die('Report not found');
$recs = json_decode($r['recommendations'] ?? '[]', true) ?: [];
$pageTitle = 'Exposure Report';
include __DIR__ . '/includes/header.php'; ?><section class="report-paper"><span class="eyebrow">WHOLEAKME SECURITY REPORT</span>
    <h2><?= e($r['title']) ?></h2>
    <p><?= e($r['summary']) ?></p>
    <div class="report-score"><strong><?= e($r['risk_score_overall']) ?>/100</strong><span><?= e(riskLabel((int)$r['risk_score_overall'])) ?> Risk</span></div>
    <h3>Recommended actions</h3>
    <ol><?php foreach ($recs as $x): ?><li><?= e($x) ?></li><?php endforeach; ?></ol>
    <p class="muted">Generated: <?= e($r['created_at']) ?> UTC · Prototype report without external OSINT API data.</p><button class="btn primary no-print" onclick="window.print()">Print / Save as PDF</button>
</section><?php include __DIR__ . '/includes/footer.php'; ?>