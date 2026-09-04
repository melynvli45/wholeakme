<?php require_once __DIR__ . '/includes/auth.php';
requireLogin();
$u = currentUser();
$uid = $u['user_id'];
function countQ($sql, $args)
{
    $s = db()->prepare($sql);
    $s->execute($args);
    return (int)$s->fetchColumn();
}
$scans = countQ('SELECT COUNT(*) FROM scans WHERE user_id=?', [$uid]);
$threats = countQ('SELECT COUNT(*) FROM threat_detections td JOIN visited_urls vu ON td.url_id=vu.url_id JOIN scans s ON vu.scan_id=s.scan_id WHERE s.user_id=? AND td.resolved=0', [$uid]);
$breaches = countQ('SELECT COUNT(*) FROM breach_results br JOIN email_addresses ea ON br.email_id=ea.email_id WHERE ea.user_id=? AND br.is_compromised=1', [$uid]);
$risk = (int)countQ('SELECT COALESCE(MAX(risk_score),0) FROM scans WHERE user_id=?', [$uid]);
$recent = db()->prepare('SELECT scan_id,scan_type,target,status,risk_score,created_at FROM scans WHERE user_id=? ORDER BY created_at DESC LIMIT 6');
$recent->execute([$uid]);
$recent = $recent->fetchAll();
$notif = db()->prepare('SELECT type,title,message,is_read,created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 5');
$notif->execute([$uid]);
$notif = $notif->fetchAll();
$pageTitle = 'Security Dashboard';
include __DIR__ . '/includes/header.php'; ?>
<div class="hero-card">
    <div><span class="eyebrow">YOUR CURRENT EXPOSURE</span>
        <h2><?= e(riskLabel($risk)) ?> Risk <span class="score"><?= $risk ?>/100</span></h2>
        <p>Your score is based on stored scans and locally generated threat indicators.</p>
    </div><a class="btn primary" href="scanner.php">Start new scan</a>
</div>
<div class="stats">
    <div class="stat"><span>Exposure score</span><strong><?= $risk ?></strong><small><?= e(riskLabel($risk)) ?> risk</small></div>
    <div class="stat"><span>Total scans</span><strong><?= $scans ?></strong><small>Stored in history</small></div>
    <div class="stat"><span>Active threats</span><strong><?= $threats ?></strong><small>Unresolved detections</small></div>
    <div class="stat"><span>Breach findings</span><strong><?= $breaches ?></strong><small>Compromised records</small></div>
</div>
<div class="grid-2">
    <section class="panel">
        <div class="panel-head">
            <h3>Recent scans</h3><a href="scans.php">View all</a>
        </div><?php if (!$recent): ?><div class="empty">No scans yet. Run your first exposure scan.</div><?php else: ?><div class="table-wrap">
                <table>
                    <tr>
                        <th>Type</th>
                        <th>Target</th>
                        <th>Risk</th>
                        <th>Date</th>
                    </tr><?php foreach ($recent as $r): ?><tr>
                            <td><?= e($r['scan_type']) ?></td>
                            <td><?= e($r['target']) ?></td>
                            <td><span class="badge <?= riskClass(riskLabel((int)$r['risk_score'])) ?>"><?= e(riskLabel((int)$r['risk_score'])) ?></span></td>
                            <td><?= e($r['created_at']) ?></td>
                        </tr><?php endforeach; ?>
                </table>
            </div><?php endif; ?>
    </section>
    <section class="panel">
        <div class="panel-head">
            <h3>Privacy recommendations</h3>
        </div>
        <ul class="recommendations">
            <li>Enable multi-factor authentication on important accounts.</li>
            <li>Use a unique password for every service.</li>
            <li>Review suspicious domains before entering credentials.</li>
            <li>Limit unnecessary public personal information.</li>
            <li>Check connected third-party applications regularly.</li>
        </ul>
    </section>
</div>
<section class="panel">
    <div class="panel-head">
        <h3>Latest alerts</h3><a href="notifications.php">Open notifications</a>
    </div><?php if (!$notif): ?><div class="empty">No notifications yet.</div><?php else: ?><div class="alerts-list"><?php foreach ($notif as $n): ?><div class="notification <?= $n['is_read'] ? 'read' : '' ?>"><b><?= e($n['title']) ?></b><span><?= e($n['message']) ?></span><small><?= e($n['created_at']) ?></small></div><?php endforeach; ?></div><?php endif; ?>
</section><?php include __DIR__ . '/includes/footer.php'; ?>