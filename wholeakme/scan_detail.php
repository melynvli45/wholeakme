<?php require_once __DIR__ . '/includes/auth.php';
requireLogin();
$id = $_GET['id'] ?? '';
$s = db()->prepare('SELECT * FROM scans WHERE scan_id=? AND user_id=?');
$s->execute([$id, $_SESSION['user_id']]);
$scan = $s->fetch();
if (!$scan) redirect('scans.php');
$r = db()->prepare('SELECT * FROM scan_results WHERE scan_id=? ORDER BY created_at DESC');
$r->execute([$id]);
$results = $r->fetchAll();
$pageTitle = 'Scan Results';
include __DIR__ . '/includes/header.php'; ?><section class="result-hero">
    <div><span class="eyebrow"><?= e(strtoupper($scan['scan_type'])) ?> SCAN</span>
        <h2><?= e($scan['target']) ?></h2>
        <p><?= e($scan['summary']) ?></p>
    </div>
    <div class="risk-ring"><b><?= $scan['risk_score'] ?></b><span><?= e(riskLabel((int)$scan['risk_score'])) ?></span></div>
</section>
<section class="panel">
    <h3>Findings</h3><?php foreach ($results as $x): ?><article class="finding">
            <div><span class="badge <?= riskClass($x['risk_level']) ?>"><?= e($x['risk_level']) ?></span>
                <h3><?= e($x['title']) ?></h3>
                <p><?= e($x['description']) ?></p><small>Source: <?= e($x['source']) ?></small>
            </div>
            <div class="recommend"><b>Recommended action</b>
                <p><?= e(recommendationFor($x['result_type'])) ?></p>
            </div>
        </article><?php endforeach; ?>
</section><a class="btn ghost" href="scanner.php">Run another scan</a><?php include __DIR__ . '/includes/footer.php'; ?>