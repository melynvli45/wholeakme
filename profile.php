<?php

$pageTitle = 'Profile';
$showSidebar = true;

include __DIR__ . '/includes/header.php';

?>


<section class="panel form-panel">

    <h3>Personal Profile</h3>


    <!-- SUCCESS MESSAGE -->

    <div
        id="profileSuccess"
        class="alert success"
        style="display: none;">
    </div>


    <!-- ERROR MESSAGE -->

    <div
        id="profileError"
        class="alert danger"
        style="display: none;">
    </div>


    <!-- LOADING -->

    <div
        id="profileLoading"
        class="empty">

        Loading profile...

    </div>


    <!-- PROFILE CONTENT -->

    <div id="profileContent" style="display: none;">

        <!-- PROFILE PICTURE -->
        <div class="profile-picture-section">
            <div class="profile-picture-wrapper">

                <div
                    id="defaultProfilePicture"
                    class="default-profile-picture">
                    U
                </div>

                <img
                    id="profilePreview"
                    class="profile-picture hidden"
                    src=""
                    alt="Profile Picture">

            </div>
        </div>

        <!-- PROFILE FORM -->
        <form id="profileForm" class="profile-form">

            <!-- UPLOAD BUTTON -->
            <div class="picture-upload-area">

                <label
                    for="profile_picture"
                    class="upload-picture-btn">
                    Choose Profile Picture
                </label>

                <input
                    type="file"
                    id="profile_picture"
                    accept=".jpg,.jpeg,.png,.gif,.webp">

                <span
                    id="selectedFileName"
                    class="selected-file-name">
                    No new file selected
                </span>

            </div>


            <!-- FULL NAME -->
            <label class="full-name-field">
                Full Name

                <input
                    type="text"
                    id="name"
                    autocomplete="name"
                    required>
            </label>


            <!-- USERNAME -->
            <label>
                Username

                <input
                    type="text"
                    id="username"
                    autocomplete="username"
                    required>
            </label>


            <!-- EMAIL -->
            <label>
                Email

                <input
                    type="email"
                    id="email"
                    autocomplete="email"
                    disabled>
            </label>


            <!-- PHONE -->
            <label>
                Phone

                <input
                    type="text"
                    id="phone"
                    autocomplete="tel">
            </label>


            <!-- COUNTRY -->
            <label>
                Country

                <input
                    type="text"
                    id="country"
                    autocomplete="country-name">
            </label>


            <!-- BIO -->
            <label>
                Bio

                <textarea
                    id="bio"
                    rows="5"
                    placeholder="Tell us a little about yourself..."></textarea>
            </label>


            <!-- SAVE -->
            <button
                type="submit"
                class="btn primary"
                id="saveProfileBtn">
                Save Profile
            </button>

        </form>

    </div>

</section>


<script
    type="module"
    src="./assets/profile.js">
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>