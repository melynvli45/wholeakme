<?php

require_once __DIR__ . '/includes/auth.php';

requireLogin();

$u = currentUser();
$msg = '';
$error = '';


// ============================================
// GET USER PROFILE
// ============================================

$p = db()->prepare(
    'SELECT *
     FROM user_profiles
     WHERE user_id = ?
     LIMIT 1'
);

$p->execute([
    $u['user_id']
]);

$profile = $p->fetch() ?: [];


// ============================================
// HANDLE FORM SUBMISSION
// ============================================

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name = trim($_POST['name'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $bio = trim($_POST['bio'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $country = trim($_POST['country'] ?? '');

    $profilePicturePath = $profile['profile_picture'] ?? null;


    // ============================================
    // PROFILE PICTURE UPLOAD
    // ============================================

    if (
        isset($_FILES['profile_picture']) &&
        $_FILES['profile_picture']['error'] !== UPLOAD_ERR_NO_FILE
    ) {

        $file = $_FILES['profile_picture'];

        // Check upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {

            $error = 'There was an error uploading your profile picture.';
        } else {

            // Maximum file size: 5 MB
            $maxSize = 5 * 1024 * 1024;

            if ($file['size'] > $maxSize) {

                $error = 'Profile picture must be smaller than 5 MB.';
            } else {

                // Allowed image types
                $allowedTypes = [
                    'image/jpeg' => 'jpg',
                    'image/png'  => 'png',
                    'image/gif'  => 'gif',
                    'image/webp' => 'webp'
                ];


                // Check the actual MIME type
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file(
                    $finfo,
                    $file['tmp_name']
                );
                finfo_close($finfo);


                if (!array_key_exists($mimeType, $allowedTypes)) {

                    $error = 'Only JPG, PNG, GIF, and WEBP images are allowed.';
                } else {

                    // Upload directory
                    $uploadDirectory = __DIR__ . '/uploads/';


                    // Create folder if it does not exist
                    if (!is_dir($uploadDirectory)) {

                        mkdir(
                            $uploadDirectory,
                            0755,
                            true
                        );
                    }


                    // Generate unique filename
                    $extension = $allowedTypes[$mimeType];

                    $newFileName =
                        'profile_' .
                        $u['user_id'] .
                        '_' .
                        time() .
                        '_' .
                        bin2hex(random_bytes(4)) .
                        '.' .
                        $extension;


                    $destination =
                        $uploadDirectory .
                        $newFileName;


                    // Move uploaded image
                    if (
                        move_uploaded_file(
                            $file['tmp_name'],
                            $destination
                        )
                    ) {

                        // Delete old profile picture
                        if (!empty($profile['profile_picture'])) {

                            $oldPicture =
                                __DIR__ .
                                '/' .
                                $profile['profile_picture'];


                            if (file_exists($oldPicture)) {

                                unlink($oldPicture);
                            }
                        }


                        // Save relative path
                        $profilePicturePath =
                            'uploads/' .
                            $newFileName;
                    } else {

                        $error =
                            'Failed to save your profile picture.';
                    }
                }
            }
        }
    }


    // ============================================
    // UPDATE PROFILE
    // Only continue if there is no upload error
    // ============================================

    if (empty($error)) {

        // Update USERS table
        db()
            ->prepare(
                'UPDATE users
                 SET name = ?,
                     updated_at = UTC_TIMESTAMP()
                 WHERE user_id = ?'
            )
            ->execute([
                $name,
                $u['user_id']
            ]);


        // Update USER_PROFILES table
        db()
            ->prepare(
                'UPDATE user_profiles
                 SET username = ?,
                     bio = ?,
                     phone = ?,
                     country = ?,
                     profile_picture = ?,
                     updated_at = UTC_TIMESTAMP()
                 WHERE user_id = ?'
            )
            ->execute([
                $username,
                $bio,
                $phone,
                $country,
                $profilePicturePath,
                $u['user_id']
            ]);


        $msg = 'Profile updated successfully!';


        // Refresh user information
        $u = currentUser();


        // Refresh profile information
        $p = db()->prepare(
            'SELECT *
             FROM user_profiles
             WHERE user_id = ?
             LIMIT 1'
        );

        $p->execute([
            $u['user_id']
        ]);

        $profile = $p->fetch() ?: [];
    }
}


// ============================================
// PAGE SETTINGS
// ============================================

$pageTitle = 'Profile';

include __DIR__ . '/includes/header.php';

?>


<section class="panel form-panel">

    <h3>Personal Profile</h3>


    <!-- SUCCESS MESSAGE -->

    <?php if ($msg): ?>

        <div class="alert success">

            <?= e($msg) ?>

        </div>

    <?php endif; ?>


    <!-- ERROR MESSAGE -->

    <?php if ($error): ?>

        <div class="alert error">

            <?= e($error) ?>

        </div>

    <?php endif; ?>


    <!-- PROFILE PICTURE -->

    <div class="profile-picture-section">

        <div class="profile-picture-wrapper">


            <?php if (!empty($profile['profile_picture'])): ?>

                <img
                    id="profilePreview"
                    class="profile-picture"
                    src="<?= e($profile['profile_picture']) ?>"
                    alt="Profile Picture">


            <?php else: ?>

                <div
                    id="defaultProfilePicture"
                    class="default-profile-picture">

                    <?= e(
                        strtoupper(
                            substr(
                                $profile['username']
                                    ?? $u['name']
                                    ?? 'U',
                                0,
                                1
                            )
                        )
                    ) ?>

                </div>


                <img
                    id="profilePreview"
                    class="profile-picture hidden"
                    src=""
                    alt="Profile Picture">

            <?php endif; ?>


        </div>

    </div>


    <!-- PROFILE FORM -->

    <form
        method="post"
        enctype="multipart/form-data"
        class="profile-form">


        <!-- PROFILE PICTURE UPLOAD -->

        <div class="picture-upload-area">

            <label
                for="profile_picture"
                class="upload-picture-btn">

                Choose Profile Picture

            </label>


            <input
                type="file"
                name="profile_picture"
                id="profile_picture"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                onchange="previewProfilePicture(event)">


            <span
                id="selectedFileName"
                class="selected-file-name">

                No new file selected

            </span>

        </div>


        <!-- FULL NAME -->

        <label>

            Full Name

            <input
                type="text"
                name="name"
                value="<?= e($u['name']) ?>"
                required>

        </label>


        <!-- USERNAME -->

        <label>

            Username

            <input
                type="text"
                name="username"
                value="<?= e($profile['username'] ?? '') ?>"
                required>

        </label>


        <!-- EMAIL -->

        <label>

            Email

            <input
                type="email"
                value="<?= e($u['email']) ?>"
                disabled>

        </label>


        <!-- PHONE -->

        <label>

            Phone

            <input
                type="text"
                name="phone"
                value="<?= e($profile['phone'] ?? '') ?>">

        </label>


        <!-- COUNTRY -->

        <label>

            Country

            <input
                type="text"
                name="country"
                value="<?= e($profile['country'] ?? '') ?>">

        </label>


        <!-- BIO -->

        <label>

            Bio

            <textarea
                name="bio"
                rows="5"><?= e($profile['bio'] ?? '') ?></textarea>

        </label>


        <!-- SAVE BUTTON -->

        <button
            type="submit"
            class="btn primary">

            Save Profile

        </button>


    </form>

</section>


<script>
    function previewProfilePicture(event) {

        const file = event.target.files[0];

        if (!file) {
            return;
        }


        const preview =
            document.getElementById('profilePreview');

        const fileName =
            document.getElementById('selectedFileName');

        const defaultPicture =
            document.getElementById('defaultProfilePicture');


        // Display selected file name
        fileName.textContent = file.name;


        // Create preview
        preview.src =
            URL.createObjectURL(file);

        preview.classList.remove('hidden');


        // Hide default letter picture
        if (defaultPicture) {

            defaultPicture.style.display = 'none';

        }

    }
</script>


<?php

include __DIR__ . '/includes/footer.php';

?>