-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 04, 2026 at 09:52 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wholeakme`
--

-- --------------------------------------------------------

--
-- Table structure for table `api_logs`
--

CREATE TABLE `api_logs` (
  `log_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `notification_id` char(36) DEFAULT NULL,
  `api_name` varchar(100) DEFAULT NULL,
  `endpoint` varchar(500) DEFAULT NULL,
  `request_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`request_data`)),
  `response_status` int(11) DEFAULT NULL,
  `response_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `breach_results`
--

CREATE TABLE `breach_results` (
  `breach_result_id` char(36) NOT NULL,
  `email_id` char(36) NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `breach_name` varchar(255) DEFAULT NULL,
  `breach_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_compromised` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_addresses`
--

CREATE TABLE `email_addresses` (
  `email_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_checked_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `report_id` char(36) DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `report_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `risk_score_overall` int(11) DEFAULT 0,
  `recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recommendations`)),
  `file_url` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scans`
--

CREATE TABLE `scans` (
  `scan_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `scan_type` varchar(50) NOT NULL,
  `target` varchar(255) NOT NULL,
  `status` varchar(30) DEFAULT 'pending',
  `risk_score` int(11) DEFAULT 0,
  `summary` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scan_results`
--

CREATE TABLE `scan_results` (
  `result_id` char(36) NOT NULL,
  `scan_id` char(36) NOT NULL,
  `result_type` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `risk_level` varchar(20) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `reference_link` varchar(1000) DEFAULT NULL,
  `raw_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `threat_detections`
--

CREATE TABLE `threat_detections` (
  `threat_id` char(36) NOT NULL,
  `url_id` char(36) NOT NULL,
  `threat_type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `severity` varchar(20) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `detected_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_picture` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `profile_picture`, `created_at`, `updated_at`, `last_login`) VALUES
('ecf2fe65-9ba5-4f97-b90e-1b8f2892f8dd', 'lia lynn', '67676767@gmail.com', '$2y$10$S5Q2WpHtt6gq7xlv0Tjba.upU9.UOxeXENajd6uY10ZphvAuD4zTi', NULL, '2026-08-23 15:28:25', '2026-08-23 16:02:38', '2026-08-23 16:02:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `profile_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferences`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profile_picture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`profile_id`, `user_id`, `username`, `bio`, `phone`, `country`, `preferences`, `created_at`, `updated_at`, `profile_picture`) VALUES
('d8b1f182-5399-4834-8739-54b227347e2f', 'ecf2fe65-9ba5-4f97-b90e-1b8f2892f8dd', 'llyvllnn', '', '', '', NULL, '2026-08-23 15:28:25', '2026-08-23 15:58:58', 'uploads/profile_ecf2fe65-9ba5-4f97-b90e-1b8f2892f8dd_1787529538_08b76d17.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `visited_urls`
--

CREATE TABLE `visited_urls` (
  `url_id` char(36) NOT NULL,
  `scan_id` char(36) NOT NULL,
  `url` varchar(2048) NOT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `category` varchar(30) DEFAULT NULL,
  `risk_score` int(11) DEFAULT 0,
  `first_seen_at` timestamp NULL DEFAULT NULL,
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `api_logs`
--
ALTER TABLE `api_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_api_log_user` (`user_id`),
  ADD KEY `idx_api_log_notification` (`notification_id`),
  ADD KEY `idx_api_log_api_name` (`api_name`);

--
-- Indexes for table `breach_results`
--
ALTER TABLE `breach_results`
  ADD PRIMARY KEY (`breach_result_id`),
  ADD KEY `idx_breach_email` (`email_id`);

--
-- Indexes for table `email_addresses`
--
ALTER TABLE `email_addresses`
  ADD PRIMARY KEY (`email_id`),
  ADD KEY `idx_email_user` (`user_id`),
  ADD KEY `idx_email_address` (`email_address`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notification_user` (`user_id`),
  ADD KEY `idx_notification_report` (`report_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `idx_report_user` (`user_id`);

--
-- Indexes for table `scans`
--
ALTER TABLE `scans`
  ADD PRIMARY KEY (`scan_id`),
  ADD KEY `idx_scan_user` (`user_id`),
  ADD KEY `idx_scan_status` (`status`);

--
-- Indexes for table `scan_results`
--
ALTER TABLE `scan_results`
  ADD PRIMARY KEY (`result_id`),
  ADD KEY `idx_result_scan` (`scan_id`);

--
-- Indexes for table `threat_detections`
--
ALTER TABLE `threat_detections`
  ADD PRIMARY KEY (`threat_id`),
  ADD KEY `idx_threat_url` (`url_id`),
  ADD KEY `idx_threat_severity` (`severity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`profile_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `visited_urls`
--
ALTER TABLE `visited_urls`
  ADD PRIMARY KEY (`url_id`),
  ADD KEY `idx_url_scan` (`scan_id`),
  ADD KEY `idx_url_domain` (`domain`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `api_logs`
--
ALTER TABLE `api_logs`
  ADD CONSTRAINT `fk_api_log_notification` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`notification_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_api_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `breach_results`
--
ALTER TABLE `breach_results`
  ADD CONSTRAINT `fk_breach_email` FOREIGN KEY (`email_id`) REFERENCES `email_addresses` (`email_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `email_addresses`
--
ALTER TABLE `email_addresses`
  ADD CONSTRAINT `fk_email_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_report` FOREIGN KEY (`report_id`) REFERENCES `reports` (`report_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `fk_report_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `scans`
--
ALTER TABLE `scans`
  ADD CONSTRAINT `fk_scan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `scan_results`
--
ALTER TABLE `scan_results`
  ADD CONSTRAINT `fk_result_scan` FOREIGN KEY (`scan_id`) REFERENCES `scans` (`scan_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `threat_detections`
--
ALTER TABLE `threat_detections`
  ADD CONSTRAINT `fk_threat_url` FOREIGN KEY (`url_id`) REFERENCES `visited_urls` (`url_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `visited_urls`
--
ALTER TABLE `visited_urls`
  ADD CONSTRAINT `fk_url_scan` FOREIGN KEY (`scan_id`) REFERENCES `scans` (`scan_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
