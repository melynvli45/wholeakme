<?php

$pageTitle = 'Threat Detections';
$showSidebar = true;

include __DIR__ . '/includes/header.php';

?>

<section class="panel">

    <div class="panel-head">

        <h3>
            Detected website threats
        </h3>

    </div>


    <div
        id="threatLoading"
        class="empty">
        Loading threat detections...
    </div>


    <div
        id="emptyThreats"
        class="empty"
        style="display:none;">
        No website threats detected yet.
    </div>


    <div
        id="threatList"
        class="threat-list"
        style="display:none;">
    </div>

</section>


<script
    type="module"
    src="./assets/threats.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>