<?php

$pageTitle = 'Welcome';
include __DIR__ . '/includes/header.php';

?>

<section class="auth-wrap">

  <div class="auth-hero">
    <span class="eyebrow">DIGITAL PRIVACY MONITORING</span>

    <h2>Know what your digital footprint is exposing.</h2>

    <p>
      WhoLeakMe organizes scans, threats, breach indicators
      and privacy recommendations in one dashboard.
    </p>

    <div class="feature-mini">
      <b>✓ Exposure scans</b>
      <b>✓ Risk scoring</b>
      <b>✓ Security insights</b>
    </div>
  </div>


  <form class="auth-card" id="loginForm">

    <h2>Welcome back</h2>

    <p>Sign in to your security dashboard.</p>

    <div
      id="loginError"
      class="alert danger"
      style="display:none;">
    </div>

    <label>
      Email
      <input
        type="email"
        id="email"
        autocomplete="email"
        required>
    </label>

    <label>
      Password
      <input
        type="password"
        id="password"
        autocomplete="current-password"
        required>
    </label>

    <button class="btn primary" type="submit">
      Sign in
    </button>

    <p class="muted">
      New to WhoLeakMe?
      <a href="register.php">Create an account</a>
    </p>

  </form>

</section>

<script type="module" src="./assets/login.js"></script>

<?php
include __DIR__ . '/includes/footer.php';
?>