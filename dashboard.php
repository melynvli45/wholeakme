<?php

$pageTitle = 'Security Dashboard';
$showSidebar = true;

include __DIR__ . '/includes/header.php';

?>

<div id="loadingDashboard" class="empty">
    Loading dashboard...
</div>


<div id="dashboardContent" style="display: none;">

    <div class="hero-card">

        <div>

            <span class="eyebrow">
                YOUR CURRENT EXPOSURE
            </span>

            <h2>
                <span id="riskLabel">Low</span> Risk

                <span class="score">
                    <span id="riskScore">0</span>/100
                </span>
            </h2>

            <p>
                Your score is based on stored scans and detected exposure indicators.
            </p>

        </div>


        <a class="btn primary" href="scanner.php">
            Start new scan
        </a>

    </div>


    <div class="stats">

        <div class="stat">

            <span>
                Exposure score
            </span>

            <strong id="exposureScore">
                0
            </strong>

            <small id="exposureRiskLabel">
                Low risk
            </small>

        </div>


        <div class="stat">

            <span>
                Total scans
            </span>

            <strong id="totalScans">
                0
            </strong>

            <small>
                Stored in history
            </small>

        </div>


        <div class="stat">

            <span>
                Active threats
            </span>

            <strong id="activeThreats">
                0
            </strong>

            <small>
                Unresolved detections
            </small>

        </div>


        <div class="stat">

            <span>
                Breach findings
            </span>

            <strong id="breachFindings">
                0
            </strong>

            <small>
                Compromised records
            </small>

        </div>

    </div>


    <div class="grid-2">


        <section class="panel">

            <div class="panel-head">

                <h3>
                    Recent scans
                </h3>

                <a href="scans.php">
                    View all
                </a>

            </div>


            <div id="recentScans">

                <div class="empty">
                    No scans yet. Run your first exposure scan.
                </div>

            </div>

        </section>


        <section class="panel">

            <div class="panel-head">

                <h3>
                    Privacy recommendations
                </h3>

            </div>


            <ul class="recommendations">

                <li>
                    Enable multi-factor authentication on important accounts.
                </li>

                <li>
                    Use a unique password for every service.
                </li>

                <li>
                    Review suspicious domains before entering credentials.
                </li>

                <li>
                    Limit unnecessary public personal information.
                </li>

                <li>
                    Check connected third-party applications regularly.
                </li>

            </ul>

        </section>


    </div>


    <section class="panel">

        <div class="panel-head">

            <h3>
                Latest alerts
            </h3>

            <a href="notifications.php">
                Open notifications
            </a>

        </div>


        <div id="latestAlerts">

            <div class="empty">
                No notifications yet.
            </div>

        </div>

    </section>

</div>


<script
    type="module"
    src="./assets/dashboard.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>