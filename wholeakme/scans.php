<?php require_once __DIR__ . '/includes/auth.php';
requireLogin();
$q = db()->prepare('SELECT * FROM scans WHERE user_id=? ORDER BY created_at DESC');
$q->execute([$_SESSION['user_id']]);
$rows = $q->fetchAll();
$pageTitle = 'Scan History';
include __DIR__ . '/includes/header.php'; ?><section class="panel">
    <div class="panel-head">
        <h3>All scans</h3><a class="btn primary small" href="scanner.php">New scan</a>
    </div>
    <div class="table-wrap">
        <table>
            <tr>
                <th>Type</th>
                <th>Target</th>
                <th>Status</th>
                <th>Risk score</th>
                <th>Created</th>
                <th></th>
            </tr><?php foreach ($rows as $r): ?><tr>
                    <td><?= e($r['scan_type']) ?></td>
                    <td><?= e($r['target']) ?></td>
                    <td><?= e($r['status']) ?></td>
                    <td><span class="badge <?= riskClass(riskLabel((int)$r['risk_score'])) ?>"><?= $r['risk_score'] ?> — <?= e(riskLabel((int)$r['risk_score'])) ?></span></td>
                    <td><?= e($r['created_at']) ?></td>
                    <td><a href="scan_detail.php?id=<?= e($r['scan_id']) ?>">View</a></td>
                </tr><?php endforeach; ?>
        </table>
    </div>
</section><?php include __DIR__ . '/includes/footer.php'; ?>