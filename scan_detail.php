<?php

$pageTitle = 'Scan Results';
$showSidebar = true;

include __DIR__ . '/includes/header.php';

?>


<div
    id="scanLoading"
    class="empty">

    Loading scan results...

</div>


<div
    id="scanContent"
    style="display:none;">


    <section class="result-hero">

        <div>

            <span
                class="eyebrow"
                id="scanType">

                SCAN

            </span>


            <h2 id="scanTarget">
                -
            </h2>


            <p id="scanSummary">
                -
            </p>

        </div>


        <div class="risk-ring">

            <b id="riskScore">
                0
            </b>

            <span id="riskLabel">
                Low
            </span>

        </div>

    </section>



    <section class="panel">

        <h3>
            Findings
        </h3>


        <div id="findingsContainer">

            <div class="empty">
                No findings available.
            </div>

        </div>

    </section>


    <a
        class="btn ghost"
        href="scanner.php">

        Run another scan

    </a>


</div>


<script
    type="module"
    src="./assets/scan_detail.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>