<?php require_once __DIR__ . '/includes/auth.php';
requireLogin();
$q = db()->prepare('SELECT td.*,vu.url,vu.domain FROM threat_detections td JOIN visited_urls vu ON td.url_id=vu.url_id JOIN scans s ON vu.scan_id=s.scan_id WHERE s.user_id=? ORDER BY td.detected_at DESC');
$q->execute([$_SESSION['user_id']]);
$rows = $q->fetchAll();
$pageTitle = 'Threat Detections';
include __DIR__ . '/includes/header.php'; ?><section class="panel">
    <div class="panel-head">
        <h3>Detected website threats</h3>
    </div><?php if (!$rows): ?><div class="empty">No website threats detected yet.</div><?php endif; ?><div class="threat-list"><?php foreach ($rows as $t): ?><div class="threat-card"><span class="badge <?= riskClass($t['severity']) ?>"><?= e($t['severity']) ?></span>
                <h3><?= e($t['threat_type']) ?></h3>
                <p><?= e($t['description']) ?></p><small><?= e($t['domain']) ?> · <?= e($t['created_at']) ?></small>
                <p><?= $t['resolved'] ? '<b>Resolved</b>' : '<b>Active</b>' ?></p>
            </div><?php endforeach; ?></div>
</section><?php include __DIR__ . '/includes/footer.php'; ?>