<?php
require_once __DIR__ . '/includes/auth.php';
if (loggedIn()) redirect('dashboard.php');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) $error = 'Enter a valid name/email and a password of at least 8 characters.';
    elseif ($password !== $confirm) $error = 'Passwords do not match.';
    else {
        $check = db()->prepare('SELECT 1 FROM users WHERE email=?');
        $check->execute([$email]);
        if ($check->fetch()) $error = 'An account with this email already exists.';
        else {
            $uid = uuidv4();
            $pdo = db();
            $pdo->beginTransaction();
            try {
                $pdo->prepare('INSERT INTO users (user_id,name,email,password_hash,created_at,updated_at) VALUES (?,?,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP())')->execute([$uid, $name, $email, password_hash($password, PASSWORD_DEFAULT)]);
                $pdo->prepare('INSERT INTO user_profiles (profile_id,user_id,username,created_at,updated_at) VALUES (?,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP())')->execute([uuidv4(), $uid, $username]);
                $pdo->commit();
                $_SESSION['user_id'] = $uid;
                redirect('dashboard.php');
            } catch (Throwable $e) {
                $pdo->rollBack();
                $error = 'Registration failed. Check that your database matches the ERD.';
            }
        }
    }
}
$pageTitle = 'Create Account';
include __DIR__ . '/includes/header.php'; ?>
<section class="auth-wrap">
    <div class="auth-hero"><span class="eyebrow">WHOLEAKME</span>
        <h2>Start monitoring your online exposure.</h2>
        <p>This prototype works without external API keys. It uses local heuristic rules until OSINT services are connected.</p>
    </div>
    <form class="auth-card" method="post">
        <h2>Create account</h2><?php if ($error): ?><div class="alert danger"><?= e($error) ?></div><?php endif; ?><label>Full name<input name="name" required></label><label>Username<input name="username"></label><label>Email<input type="email" name="email" required></label><label>Password<input type="password" name="password" required minlength="8"></label><label>Confirm password<input type="password" name="confirm_password" required></label><button class="btn primary">Create account</button>
        <p class="muted">Already have an account? <a href="index.php">Sign in</a></p>
    </form>
</section><?php include __DIR__ . '/includes/footer.php'; ?>