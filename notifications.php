<?php

$pageTitle = 'Notifications';
$showSidebar = true;

include __DIR__ . '/includes/header.php';

?>

<section class="panel">

    <div class="panel-head">

        <h3>
            Security alerts
        </h3>

        <button
            class="btn ghost small"
            id="markAllReadBtn"
            type="button">
            Mark all as read
        </button>

    </div>


    <div
        id="notificationLoading"
        class="empty">
        Loading notifications...
    </div>


    <div
        id="notificationList"
        style="display:none;">
    </div>


    <div
        id="emptyNotifications"
        class="empty"
        style="display:none;">
        No notifications yet.
    </div>

</section>


<script
    type="module"
    src="./assets/notifications.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>