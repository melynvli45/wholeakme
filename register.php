<?php

$pageTitle = 'Create Account';
$showSidebar = false;

include __DIR__ . '/includes/header.php';

?>

<section class="auth-wrap">

    <div class="auth-hero">

        <span class="eyebrow">
            WHOLEAKME
        </span>

        <h2>
            Start monitoring your online exposure.
        </h2>

        <p>
            Create your account to access exposure scans,
            breach findings, privacy recommendations and
            your personal security dashboard.
        </p>

    </div>


    <form
        class="auth-card"
        id="registerForm">

        <h2>
            Create account
        </h2>


        <div
            id="registerError"
            class="alert danger"
            style="display:none;"></div>


        <label>

            Full name

            <input
                type="text"
                id="name"
                autocomplete="name"
                required>

        </label>


        <label>

            Username

            <input
                type="text"
                id="username"
                autocomplete="username"
                required>

        </label>


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
                autocomplete="new-password"
                minlength="8"
                required>

        </label>


        <label>

            Confirm password

            <input
                type="password"
                id="confirmPassword"
                autocomplete="new-password"
                minlength="8"
                required>

        </label>


        <button
            class="btn primary"
            type="submit"
            id="registerBtn">
            Create account
        </button>


        <p class="muted">

            Already have an account?

            <a href="login.php">
                Sign in
            </a>

        </p>

    </form>

</section>


<script
    type="module"
    src="./assets/register.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>