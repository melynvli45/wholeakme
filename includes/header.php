<?php

$pageTitle = $pageTitle ?? 'WhoLeakMe';
$showSidebar = $showSidebar ?? false;

?>

<!doctype html>

<html lang="en">

<head>

    <meta charset="utf-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1">

    <title>
        <?= htmlspecialchars($pageTitle) ?> | WhoLeakMe
    </title>

    <link
        rel="stylesheet"
        href="assets/style.css">

</head>


<body>


    <?php if ($showSidebar): ?>


        <aside class="sidebar">

            <a
                class="brand"
                href="dashboard.php">

                <span class="logo">
                    W
                </span>

                <span>
                    WhoLeakMe
                </span>

            </a>


            <nav>

                <a href="dashboard.php">
                    ⌂ Dashboard
                </a>

                <a href="scanner.php">
                    ⌕ Exposure Scanner
                </a>

                <a href="scans.php">
                    ◷ Scan History
                </a>

                <a href="threats.php">
                    ⚠︎ Threat Detections
                </a>

                <a href="notifications.php">
                    ♧ Notifications
                </a>

                <a href="reports.php">
                    ▤ Reports
                </a>

                <a href="download_extension.php">
                    ↓ Download Extension
                </a>

                <a href="profile.php">
                    ♙ Profile
                </a>

            </nav>


            <div class="sidebar-bottom">

                <a
                    href="#"
                    id="logoutBtn">
                    ⇥ Log out
                </a>

            </div>

        </aside>


        <main class="main">


            <header class="topbar">

                <div>

                    <h1>
                        <?= htmlspecialchars($pageTitle) ?>
                    </h1>

                    <p>
                        Digital footprint monitoring and privacy insights
                    </p>

                </div>


                <div class="user-chip">

                    <span id="headerUserName">
                        User
                    </span>

                    <div
                        class="avatar"
                        id="headerAvatar">
                        U
                    </div>

                </div>

            </header>


        <?php else: ?>


            <main class="public-main">


            <?php endif; ?>