<?php
session_start();
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/functions.php';
function loggedIn(): bool { return !empty($_SESSION['user_id']); }
function requireLogin(): void { if (!loggedIn()) redirect('index.php'); }
function currentUser(): ?array {
    if (!loggedIn()) return null;
    $stmt = db()->prepare('SELECT user_id, name, email, profile_picture, created_at, last_login FROM users WHERE user_id=? LIMIT 1');
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch() ?: null;
}
?>
