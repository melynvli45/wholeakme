<?php require_once __DIR__ . '/includes/auth.php';
requireLogin();
$uid = $_SESSION['user_id'];
$pdo = db();
if (isset($_POST['generate'])) {
    $title = 'Exposure Report - ' . gmdate('Y-m-d H:i');
    $risk = (int)$pdo->prepare('SELECT COALESCE(MAX(risk_score),0) FROM scans WHERE user_id=?')->execute([$uid]);
    $stmt = $pdo->prepare('SELECT COALESCE(MAX(risk_score),0) FROM scans WHERE user_id=?');
    $stmt->execute([$uid]);
    $risk = (int)$stmt->fetchColumn();
    $summary = 'Generated local report based on current scans and threat findings.';
    $rec = ['Enable MFA', 'Change compromised passwords', 'Avoid suspicious websites', 'Review account privacy settings'];
    $pdo->prepare('INSERT INTO reports (report_id,user_id,title,summary,risk_score_overall,recommendations,file_url,created_at) VALUES (?,?,?,?,?,?,NULL,UTC_TIMESTAMP())')->execute([uuidv4(), $uid, $title, $summary, $risk, json_encode($rec)]);
}
$q = $pdo->prepare('SELECT * FROM reports WHERE user_id=? ORDER BY created_at DESC');
$q->execute([$uid]);
$rows = $q->fetchAll();
$pageTitle = 'Exposure Reports';
include __DIR__ . '/includes/header.php'; ?><section class="panel">
    <div class="panel-head">
        <div>
            <h3>Custom reports</h3>
            <p>Generate a report from your stored scans.</p>
        </div>
        <form method="post"><button class="btn primary" name="generate">Generate report</button></form>
    </div>
    <div class="table-wrap">
        <table>
            <tr>
                <th>Title</th>
                <th>Risk</th>
                <th>Created</th>
                <th></th>
            </tr><?php foreach ($rows as $r): ?><tr>
                    <td><?= e($r['title']) ?></td>
                    <td><span class="badge <?= riskClass(riskLabel((int)$r['risk_score_overall'])) ?>"><?= $r['risk_score_overall'] ?></span></td>
                    <td><?= e($r['created_at']) ?></td>
                    <td><a href="report_view.php?id=<?= e($r['report_id']) ?>" target="_blank">Open / Print</a></td>
                </tr><?php endforeach; ?>
        </table>
    </div>
</section><?php include __DIR__ . '/includes/footer.php'; ?>