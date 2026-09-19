<?php

$pageTitle = 'Scan History';
$showSidebar = true;

include __DIR__ . '/includes/header.php';

?>

<section class="panel">

    <div class="panel-head">

        <h3>
            All scans
        </h3>

        <a
            class="btn primary small"
            href="scanner.php">
            New scan
        </a>

    </div>


    <div
        id="scanHistoryLoading"
        class="empty">
        Loading scan history...
    </div>


    <div
        id="scanHistoryContent"
        class="table-wrap"
        style="display:none;">

        <table>

            <thead>

                <tr>

                    <th>Type</th>

                    <th>Target</th>

                    <th>Status</th>

                    <th>Risk score</th>

                    <th>Created</th>

                    <th></th>

                </tr>

            </thead>


            <tbody id="scanHistoryBody">

            </tbody>

        </table>

    </div>


    <div
        id="emptyScanHistory"
        class="empty"
        style="display:none;">
        No scans yet. Run your first exposure scan.
    </div>

</section>


<script
    type="module"
    src="./assets/scans.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>