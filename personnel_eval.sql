-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 25, 2025 at 10:01 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `personnel_eval`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `cycle_id` int(11) NOT NULL,
  `evaluated_id` int(11) NOT NULL,
  `committee_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'ASSIGNED',
  `reeval_requested` tinyint(1) NOT NULL DEFAULT 0,
  `reeval_reason` text DEFAULT NULL,
  `reeval_approved` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `cycle_id`, `evaluated_id`, `committee_id`, `status`, `reeval_requested`, `reeval_reason`, `reeval_approved`) VALUES
(11, 3, 5, 2, 'ASSIGNED', 0, NULL, NULL),
(12, 3, 5, 2, 'ASSIGNED', 0, NULL, NULL),
(15, 3, 5, 3, 'ASSIGNED', 0, NULL, NULL),
(16, 2, 5, 4, 'ASSIGNED', 0, NULL, NULL),
(19, 3, 5, 2, 'ASSIGNED', 0, NULL, NULL),
(20, 3, 7, 3, 'ASSIGNED', 0, NULL, NULL),
(21, 3, 7, 2, 'ASSIGNED', 0, NULL, NULL),
(22, 3, 5, 2, 'ASSIGNED', 0, NULL, NULL),
(23, 3, 5, 4, 'ASSIGNED', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `committee_signatures`
--

CREATE TABLE `committee_signatures` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `signed_at` datetime DEFAULT NULL,
  `signature_data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cycles`
--

CREATE TABLE `cycles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `submit_start` datetime DEFAULT NULL,
  `submit_end` datetime DEFAULT NULL,
  `review_start` datetime DEFAULT NULL,
  `review_end` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_open` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cycles`
--

INSERT INTO `cycles` (`id`, `name`, `start_date`, `end_date`, `submit_start`, `submit_end`, `review_start`, `review_end`, `is_active`, `is_open`) VALUES
(2, '2042', '2025-10-16', '2025-10-17', '2025-10-16 23:10:00', '2025-10-18 23:10:00', '2025-10-17 23:10:00', '2025-10-17 23:10:00', 1, 1),
(3, '2025', '2025-10-20', '2025-10-23', '2025-10-20 08:50:00', '2025-10-21 11:50:00', '2025-10-21 14:50:00', '2025-10-21 13:50:00', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `indicators`
--

CREATE TABLE `indicators` (
  `id` int(11) NOT NULL,
  `topic_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `weight` decimal(6,2) NOT NULL,
  `score_min` int(11) NOT NULL DEFAULT 1,
  `score_max` int(11) NOT NULL DEFAULT 4,
  `evidence_type` enum('none','pdf','url','pdf_or_url') NOT NULL DEFAULT 'pdf_or_url'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indicators`
--

INSERT INTO `indicators` (`id`, `topic_id`, `title`, `description`, `weight`, `score_min`, `score_max`, `evidence_type`) VALUES
(4, 2, 'การบริการ/สื่อสาร', 'สื่อสารกับผู้เกี่ยวข้อง', 15.00, 1, 4, 'url'),
(5, 2, 'การทำงานเป็นทีม', 'ร่วมมือกับทีม', 10.00, 1, 4, 'pdf'),
(14, 9, 'เรียนรู้ประเมิน', 'เรียน', 20.00, 1, 2, 'pdf_or_url');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `submission_id`, `reviewer_id`, `score`, `comment`, `created_at`) VALUES
(6, 14, 2, 3, 'ดี', '2025-10-22 12:56:15'),
(7, 14, 3, 3, 'ดีจัด', '2025-10-22 13:19:52'),
(8, 14, 4, 12, 'สวย', '2025-10-22 13:24:04'),
(9, 16, 2, 3, 'แย่', '2025-10-22 13:46:53'),
(10, 17, 3, 1, 'แย่', '2025-10-24 06:36:58'),
(11, 17, 2, 3, NULL, '2025-10-24 07:00:55'),
(12, 18, 4, 4, 'ดี', '2025-10-24 07:16:09');

-- --------------------------------------------------------

--
-- Table structure for table `signatures`
--

CREATE TABLE `signatures` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `signed_at` datetime DEFAULT NULL,
  `signature_data` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `cycle_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `indicator_id` int(11) NOT NULL,
  `self_score` int(11) NOT NULL,
  `evidence_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `evidence_type` enum('file','url','text') DEFAULT NULL,
  `evidence_value` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('draft','submitted') NOT NULL DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`id`, `cycle_id`, `user_id`, `indicator_id`, `self_score`, `evidence_path`, `created_at`, `evidence_type`, `evidence_value`, `comment`, `status`) VALUES
(14, 3, 5, 5, 3, 'https://www.youtube.com/watch?v=10GeHGvHUsA&list=RDCbCPL3ECwTM&index=2', '2025-10-22 12:40:29', NULL, NULL, NULL, 'submitted'),
(16, 3, 5, 4, 3, NULL, '2025-10-22 13:46:15', NULL, NULL, NULL, 'submitted'),
(17, 3, 7, 4, 3, NULL, '2025-10-24 06:35:59', NULL, NULL, NULL, 'submitted'),
(18, 3, 5, 14, 3, '/uploads/1761290020602_report_à¸à¸¹à¹à¸£à¸±à¸à¸à¸²à¸£à¸à¸£à¸°à¹à¸¡à¸´à¸_1.pdf', '2025-10-24 07:13:40', NULL, NULL, NULL, 'submitted');

-- --------------------------------------------------------

--
-- Table structure for table `topics`
--

CREATE TABLE `topics` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `topics`
--

INSERT INTO `topics` (`id`, `name`, `description`) VALUES
(2, 'สมรรถนะเฉพาะงาน', 'หัวข้อเฉพาะสายงาน'),
(4, 'สร้างและหรือพัฒนา หลักสูตร', 'มีการจัดทำรายวิชาและหน่วยการเรียนรู้ให้สอดคล้อง กับมาตรฐานการเรียนรู'),
(7, 'ออกแบบ', 'สวย'),
(9, 'จัดกิจกรรมการเรียนรู้ ', 'เรียนรู้');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `role` enum('ฝ่ายบริหารบุคลากร','ผู้รับการประเมิน','คณะกรรมการประเมิน') NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `name`, `role`, `password_hash`, `created_at`) VALUES
(1, 'hr@demo.local', 'ผู้ดูแลระบบ', 'ฝ่ายบริหารบุคลากร', '$2a$10$wyQ0944Vv2nVFTE9WTNn8.SelcU/lGWACVzdkv54qhUx41GAZP1pS', '2025-10-16 14:37:12'),
(2, 'com1@demo.local', 'คณะกรรมการ A', 'คณะกรรมการประเมิน', '$2a$10$q9x9d2DTPXeGBbSuE7x0OOPg1j0OTteotteEfXJ10JhMH/TX29Qqa', '2025-10-16 14:37:12'),
(3, 'com2@demo.local', 'คณะกรรมการ B', 'คณะกรรมการประเมิน', '$2a$10$/R9tIzeTZPkWeVMHAsjTA./7w43xrx84.pXhD4nell/Re6yZE90xO', '2025-10-16 14:37:12'),
(4, 'com3@demo.local', 'คณะกรรมการ C', 'คณะกรรมการประเมิน', '$2a$10$wsIt9ME2Euvt8eWvJ3OA5eOVb1Ef0zJ.wbeubA2YHc8X4.nDBRRQq', '2025-10-16 14:37:12'),
(5, 'eva1@demo.local', 'ผู้รับการประเมิน 1', 'ผู้รับการประเมิน', '$2a$10$QRUme2ACfg3/Uo60kZj3deXFemntbqp3VqIPREjt/00vR55RKHypS', '2025-10-16 14:37:12'),
(6, 'eva2@demo.local', 'ผู้รับการประเมิน 2', 'ผู้รับการประเมิน', '$2a$10$ZLvnRZK5x1IY0MN7iQhxuOCa/k2E9hVRybWW6PQfAQ3eL7ONkU3Dq', '2025-10-16 14:37:12'),
(7, 'eva3@demo.local', 'ผู้รับการประเมิน 3', 'ผู้รับการประเมิน', '$2a$10$QpElqG8pQtVHH7BgPMQqHuYTrBdlVmP6ljYShUfcz5jvQXacqkWqq', '2025-10-16 14:37:12'),
(10, 'admin', 'Admin', 'ฝ่ายบริหารบุคลากร', '$2a$10$NASJ3HndohO2trcV1TiQ2ONiSOnKFy.w6Eg8.MsbnzPZIYwF25/02', '2025-10-21 03:05:37'),
(13, 'evaluator1', 'Evaluator 1', 'คณะกรรมการประเมิน', '$2a$10$dLwq5x3doQDK6XT.nkNPwO16my0jqKr.mAo7D55OOSWnG2LTE1sxO', '2025-10-21 03:05:38'),
(14, 'evaluator2', 'Evaluator 2', 'คณะกรรมการประเมิน', '$2a$10$cS/uV63lnrrP6dAa4n0gHeRpXHkirQsdfDnclvDKrxG5CD9546C/.', '2025-10-21 03:05:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assign_cycle` (`cycle_id`),
  ADD KEY `idx_assign_eval` (`evaluated_id`),
  ADD KEY `idx_assign_comm` (`committee_id`);

--
-- Indexes for table `committee_signatures`
--
ALTER TABLE `committee_signatures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_sign` (`assignment_id`,`reviewer_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

--
-- Indexes for table `cycles`
--
ALTER TABLE `cycles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `indicators`
--
ALTER TABLE `indicators`
  ADD PRIMARY KEY (`id`),
  ADD KEY `topic_id` (`topic_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_review` (`submission_id`,`reviewer_id`),
  ADD KEY `reviewer_id` (`reviewer_id`),
  ADD KEY `idx_reviews_submission` (`submission_id`);

--
-- Indexes for table `signatures`
--
ALTER TABLE `signatures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_sign` (`assignment_id`,`reviewer_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `indicator_id` (`indicator_id`),
  ADD KEY `idx_sub` (`cycle_id`,`user_id`,`indicator_id`),
  ADD KEY `idx_submissions_user_cycle` (`user_id`,`cycle_id`);

--
-- Indexes for table `topics`
--
ALTER TABLE `topics`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `committee_signatures`
--
ALTER TABLE `committee_signatures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cycles`
--
ALTER TABLE `cycles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `indicators`
--
ALTER TABLE `indicators`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `signatures`
--
ALTER TABLE `signatures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `topics`
--
ALTER TABLE `topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `cycles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`evaluated_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`committee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `committee_signatures`
--
ALTER TABLE `committee_signatures`
  ADD CONSTRAINT `committee_signatures_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `committee_signatures_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `indicators`
--
ALTER TABLE `indicators`
  ADD CONSTRAINT `indicators_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `signatures`
--
ALTER TABLE `signatures`
  ADD CONSTRAINT `signatures_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `signatures_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `cycles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_3` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
