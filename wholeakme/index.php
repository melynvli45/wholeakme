<?php
require_once __DIR__ . '/includes/auth.php';
if (loggedIn()) redirect('dashboard.php');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $email = trim($_POST['email'] ?? '');
  $password = $_POST['password'] ?? '';
  $stmt = db()->prepare('SELECT * FROM users WHERE email=? LIMIT 1');
  $stmt->execute([$email]);
  $u = $stmt->fetch();
  if ($u && password_verify($password, $u['password_hash'])) {
    $_SESSION['user_id'] = $u['user_id'];
    db()->prepare('UPDATE users SET last_login=UTC_TIMESTAMP(), updated_at=UTC_TIMESTAMP() WHERE user_id=?')->execute([$u['user_id']]);
    redirect('dashboard.php');
  }
  $error = 'Invalid email or password.';
}
$pageTitle = 'Welcome';
include __DIR__ . '/includes/header.php'; ?>
<section class="auth-wrap">
  <div class="auth-hero"><span class="eyebrow">DIGITAL PRIVACY MONITORING</span>
    <h2>Know what your digital footprint is exposing.</h2>
    <p>WhoLeakMe organizes scans, threats, breach indicators and privacy recommendations in one dashboard.</p>
    <div class="feature-mini"><b>✓ Exposure scans</b><b>✓ Risk scoring</b><b>✓ Security insights</b></div>
  </div>
  <form class="auth-card" method="post">
    <h2>Welcome back</h2>
    <p>Sign in to your security dashboard.</p><?php if ($error): ?><div class="alert danger"><?= e($error) ?></div><?php endif; ?><label>Email<input type="email" name="email" required></label><label>Password<input type="password" name="password" required></label><button class="btn primary" type="submit">Sign in</button>
    <p class="muted">New to WhoLeakMe? <a href="register.php">Create an account</a></p>
  </form>
</section><?php include __DIR__ . '/includes/footer.php'; ?>