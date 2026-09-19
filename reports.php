<?php

$pageTitle = 'Exposure Reports';
$showSidebar = true;

include __DIR__ . '/includes/header.php';

?>

<section class="panel">

    <div class="panel-head">

        <div>
            <h3>Custom reports</h3>
            <p>
                Generate a report from your stored scans.
            </p>
        </div>

        <button
            class="btn primary"
            id="generateReportBtn"
            type="button"
        >
            Generate report
        </button>

    </div>


    <div
        id="reportMessage"
        class="alert success"
        style="display:none;"
    ></div>


    <div
        id="reportError"
        class="alert danger"
        style="display:none;"
    ></div>


    <div
        id="reportLoading"
        class="empty"
    >
        Loading reports...
    </div>


    <div
        id="emptyReports"
        class="empty"
        style="display:none;"
    >
        No reports generated yet.
    </div>


    <div
        id="reportTable"
        class="table-wrap"
        style="display:none;"
    >

        <table>

            <thead>

                <tr>
                    <th>Title</th>
                    <th>Risk</th>
                    <th>Created</th>
                    <th></th>
                </tr>

            </thead>

            <tbody id="reportTableBody">
            </tbody>

        </table>

    </div>

</section>


<script
    type="module"
    src="./assets/reports.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>