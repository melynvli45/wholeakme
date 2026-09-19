<?php

$pageTitle = 'Exposure Report';
$showSidebar = true;

include __DIR__ . '/includes/header.php';

?>


<div
    id="reportViewLoading"
    class="empty">
    Loading report...
</div>


<section
    id="reportPaper"
    class="report-paper"
    style="display:none;">

    <span class="eyebrow">
        WHOLEAKME SECURITY REPORT
    </span>


    <h2 id="reportTitle">
        Exposure Report
    </h2>


    <p id="reportSummary">
        -
    </p>


    <div class="report-score">

        <strong id="reportScore">
            0/100
        </strong>

        <span id="reportRisk">
            Low Risk
        </span>

    </div>


    <h3>
        Recommended actions
    </h3>


    <ol id="reportRecommendations">
    </ol>


    <p
        id="reportGenerated"
        class="muted">
    </p>


    <button
        class="btn primary no-print"
        onclick="window.print()">
        Print / Save as PDF
    </button>

</section>


<script
    type="module"
    src="./assets/report_view.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>