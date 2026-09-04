<?php require_once __DIR__ . '/includes/auth.php';
requireLogin();
$pdo = db();
if (isset($_POST['read'])) $pdo->prepare('UPDATE notifications SET is_read=1 WHERE user_id=?')->execute([$_SESSION['user_id']]);
$q = $pdo->prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC');
$q->execute([$_SESSION['user_id']]);
$rows = $q->fetchAll();
$pageTitle = 'Notifications';
include __DIR__ . '/includes/header.php'; ?><section class="panel">
    <div class="panel-head">
        <h3>Security alerts</h3>
        <form method="post"><button class="btn ghost small" name="read">Mark all as read</button></form>
    </div><?php foreach ($rows as $n): ?><div class="notification <?= $n['is_read'] ? 'read' : '' ?>"><b><?= e($n['title']) ?></b><span><?= e($n['message']) ?></span><small><?= e($n['created_at']) ?></small></div><?php endforeach;
                                                                                                                                                                                                                    if (!$rows): ?><div class="empty">No notifications yet.</div>
    <?php endif; ?>
</section><?php include __DIR__ . '/includes/footer.php'; ?>