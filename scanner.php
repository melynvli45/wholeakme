<?php

$pageTitle = 'Digital Footprint Scanner';
$showSidebar = true;

include __DIR__ . '/includes/header.php';

?>


<section class="scanner-card">

    <span class="eyebrow">
        LOCAL DEMO MODE — NO API KEY REQUIRED
    </span>

    <h2>
        Scan your digital footprint
    </h2>

    <p>
        Scan an email, username, domain/URL, or password exposure indicator.
        Real OSINT API integration can be added later.
    </p>


    <div
        id="scanError"
        class="alert danger"
        style="display:none;">
    </div>


    <form id="scannerForm">

        <div class="scan-options">

            <label>

                <input
                    type="radio"
                    name="scan_type"
                    value="email"
                    checked>

                <span>
                    ✉️ Email
                </span>

            </label>


            <label>

                <input
                    type="radio"
                    name="scan_type"
                    value="username">

                <span>
                    ♙ Username
                </span>

            </label>


            <label>

                <input
                    type="radio"
                    name="scan_type"
                    value="domain">

                <span>
                    ◉ Domain / URL
                </span>

            </label>


            <label>

                <input
                    type="radio"
                    name="scan_type"
                    value="password">

                <span>
                    ⌁ Password check
                </span>

            </label>

        </div>


        <input
            class="big-input"
            id="scanTarget"
            placeholder="Enter information to scan..."
            autocomplete="off"
            required>


        <small class="muted">
            Password scans are evaluated in memory and the password is never stored.
        </small>


        <button
            class="btn primary large"
            type="submit"
            id="scanBtn">

            Run exposure scan

        </button>

    </form>

</section>



<section class="panel info-panel">

    <h3>
        What this prototype detects
    </h3>


    <div class="three-col">

        <div>

            <b>
                Credential exposure
            </b>

            <p>
                Local breach-style indicators and repeated exposure simulations.
            </p>

        </div>


        <div>

            <b>
                Suspicious websites
            </b>

            <p>
                URL patterns associated with phishing and unsafe behaviour.
            </p>

        </div>


        <div>

            <b>
                Risk scoring
            </b>

            <p>
                Low, Medium, High and Critical classification based on findings.
            </p>

        </div>

    </div>

</section>


<script
    type="module"
    src="./assets/scanner.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>