-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2025 at 08:20 AM
-- Server version: 11.4.5-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `legatura`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `admin_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`admin_id`, `username`, `email`, `password_hash`, `last_name`, `middle_name`, `first_name`, `is_active`, `created_at`) VALUES
(1, 'admin123', 'admin@gmail.com', '$2y$12$wN6x17yJegWeKIUj3Lq8O.sAG6QfX.5OPQ13k0xSAY./xrDhej5Uq', 'admin', 'admin', 'admin', 1, '2025-10-25 15:19:23');

-- --------------------------------------------------------

--
-- Table structure for table `bids`
--

CREATE TABLE `bids` (
  `bid_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `contractor_id` int(11) NOT NULL,
  `proposed_cost` decimal(15,2) NOT NULL,
  `estimated_timeline` int(11) NOT NULL,
  `contractor_notes` text DEFAULT NULL,
  `bid_status` enum('submitted','under_review','accepted','rejected','cancelled') DEFAULT 'submitted',
  `reason` text DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  `decision_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bid_files`
--

CREATE TABLE `bid_files` (
  `file_id` int(11) NOT NULL,
  `bid_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contractors`
--

CREATE TABLE `contractors` (
  `contractor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `years_of_experience` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `contractor_type_other` varchar(200) DEFAULT NULL,
  `services_offered` text NOT NULL,
  `business_address` text NOT NULL,
  `company_email` varchar(100) NOT NULL,
  `company_phone` varchar(20) NOT NULL,
  `company_website` varchar(255) DEFAULT NULL,
  `company_social_media` varchar(255) DEFAULT NULL,
  `company_description` text DEFAULT NULL,
  `picab_number` varchar(100) NOT NULL,
  `picab_category` enum('AAAA','AAA','AA','A','B','C','D','Trade/E') NOT NULL,
  `picab_expiration_date` date NOT NULL,
  `business_permit_number` varchar(100) NOT NULL,
  `business_permit_city` varchar(100) NOT NULL,
  `business_permit_expiration` date NOT NULL,
  `tin_business_reg_number` varchar(100) NOT NULL,
  `dti_sec_registration_photo` varchar(255) NOT NULL,
  `verification_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `verification_date` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `completed_projects` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contractor_types`
--

CREATE TABLE `contractor_types` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contractor_users`
--

CREATE TABLE `contractor_users` (
  `contractor_user_id` int(11) NOT NULL,
  `contractor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `authorized_rep_lname` varchar(100) NOT NULL,
  `authorized_rep_mname` varchar(100) DEFAULT NULL,
  `authorized_rep_fname` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `role` enum('owner','manager','engineer','others','architect') DEFAULT 'owner',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `disputes`
--

CREATE TABLE `disputes` (
  `dispute_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `raised_by_user_id` int(11) NOT NULL,
  `against_user_id` int(11) NOT NULL,
  `milestone_id` int(11) DEFAULT NULL,
  `milestone_item_id` int(11) DEFAULT NULL,
  `dispute_type` enum('Payment','Delay','Quality','Others') NOT NULL,
  `dispute_desc` text NOT NULL,
  `dispute_status` enum('open','under_review','resolved','closed','cancelled') DEFAULT 'open',
  `reason` text NOT NULL,
  `admin_response` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dispute_files`
--

CREATE TABLE `dispute_files` (
  `file_id` int(11) NOT NULL,
  `dispute_id` int(11) NOT NULL,
  `storage_path` varchar(500) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `size` int(11) UNSIGNED DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `milestones`
--

CREATE TABLE `milestones` (
  `milestone_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `contractor_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `milestone_name` varchar(200) NOT NULL,
  `milestone_description` text NOT NULL,
  `milestone_status` enum('not_started','in_progress','rejected','delayed','cancelled') DEFAULT 'not_started',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_deleted` tinyint(1) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `setup_status` enum('submitted','rejected','approved','') NOT NULL DEFAULT 'submitted',
  `setup_rej_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `milestone_items`
--

CREATE TABLE `milestone_items` (
  `item_id` int(11) NOT NULL,
  `milestone_id` int(11) NOT NULL,
  `sequence_order` int(11) NOT NULL,
  `percentage_progress` decimal(5,2) NOT NULL,
  `milestone_item_title` varchar(255) NOT NULL,
  `milestone_item_description` text DEFAULT NULL,
  `milestone_item_cost` decimal(12,2) NOT NULL,
  `date_to_finish` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `milestone_payments`
--

CREATE TABLE `milestone_payments` (
  `payment_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `contractor_user_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_type` enum('cash','check','bank_transfer','online_payment') NOT NULL,
  `transaction_number` varchar(100) DEFAULT NULL,
  `receipt_photo` varchar(255) NOT NULL,
  `transaction_date` date DEFAULT current_timestamp(),
  `payment_status` enum('submitted','approved','rejected','deleted') DEFAULT 'submitted',
  `reason` text DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `type` enum('Milestone Update','Bid Status','Payment Reminder','Project Alert') NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `delivery_method` enum('App','Email','Both') DEFAULT 'App',
  `action_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `occupations`
--

CREATE TABLE `occupations` (
  `id` int(11) NOT NULL,
  `occupation_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `occupations`
--

INSERT INTO `occupations` (`id`, `occupation_name`) VALUES
(1, 'Teacher'),
(2, 'Engineer'),
(3, 'Doctor'),
(4, 'Nurse'),
(5, 'Police Officer'),
(6, 'Firefighter'),
(7, 'Lawyer'),
(8, 'Architect'),
(9, 'Driver'),
(10, 'Construction Worker'),
(11, 'Electrician'),
(12, 'Plumber'),
(13, 'Farmer'),
(14, 'Fisherman'),
(15, 'Office Clerk'),
(16, 'Salesperson'),
(17, 'Cashier'),
(18, 'Security Guard'),
(19, 'IT Specialist'),
(20, 'Call Center Agent'),
(21, 'Chef'),
(22, 'Accountant'),
(23, 'Businessman'),
(24, 'Student'),
(25, 'Unemployed'),
(26, 'Others');

-- --------------------------------------------------------

--
-- Table structure for table `payment_plans`
--

CREATE TABLE `payment_plans` (
  `plan_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `contractor_id` int(11) NOT NULL,
  `payment_mode` enum('full_payment','downpayment') NOT NULL,
  `total_project_cost` decimal(12,2) NOT NULL,
  `downpayment_amount` decimal(12,2) DEFAULT 0.00,
  `is_confirmed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `platform_payments`
--

CREATE TABLE `platform_payments` (
  `platform_payment_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `contractor_id` int(11) DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `payment_for` enum('commission','boosted_post') NOT NULL,
  `percentage` decimal(5,2) DEFAULT 0.02,
  `amount` decimal(15,2) NOT NULL,
  `transaction_number` varchar(100) DEFAULT NULL,
  `receipt_photo` varchar(255) NOT NULL,
  `transaction_date` timestamp NULL DEFAULT current_timestamp(),
  `is_approved` tinyint(1) DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `progress_id` int(11) NOT NULL,
  `milestone_item_id` int(11) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `progress_status` enum('submitted','approved','rejected','deleted') DEFAULT 'submitted',
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `progress_files`
--

CREATE TABLE `progress_files` (
  `file_id` int(11) NOT NULL,
  `progress_id` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `project_id` int(11) NOT NULL,
  `relationship_id` int(11) DEFAULT NULL,
  `project_title` varchar(200) NOT NULL,
  `project_description` text NOT NULL,
  `project_location` text NOT NULL,
  `budget_range_min` decimal(15,2) DEFAULT NULL,
  `budget_range_max` decimal(15,2) DEFAULT NULL,
  `lot_size` int(11) NOT NULL,
  `floor_area` int(11) NOT NULL,
  `property_type` enum('Residential','Commercial','Industrial','Agricultural') NOT NULL,
  `type_id` int(11) NOT NULL,
  `to_finish` int(11) DEFAULT NULL,
  `project_status` enum('open','bidding_closed','in_progress','completed','terminated','deleted_post') DEFAULT 'open',
  `selected_contractor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_files`
--

CREATE TABLE `project_files` (
  `file_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `file_type` enum('building permit','blueprint','desired design','title','others') NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_relationships`
--

CREATE TABLE `project_relationships` (
  `rel_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `selected_contractor_id` int(11) DEFAULT NULL,
  `project_post_status` enum('under_review','deleted','approved','rejected') NOT NULL DEFAULT 'under_review',
  `admin_reason` text DEFAULT NULL COMMENT 'Reason for post rejection by admin',
  `reason` text DEFAULT NULL,
  `bidding_due` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property_owners`
--

CREATE TABLE `property_owners` (
  `owner_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `address` varchar(500) NOT NULL,
  `valid_id_id` int(11) DEFAULT NULL,
  `valid_id_photo` varchar(255) DEFAULT NULL,
  `valid_id_back_photo` varchar(255) NOT NULL,
  `police_clearance` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `age` int(11) NOT NULL,
  `occupation_id` int(11) DEFAULT NULL,
  `occupation_other` varchar(200) DEFAULT NULL,
  `verification_status` enum('pending','rejected','verified','') NOT NULL DEFAULT 'pending',
  `verification_date` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qr_codes`
--

CREATE TABLE `qr_codes` (
  `qr_id` int(11) NOT NULL,
  `qr_path` varchar(255) NOT NULL,
  `qr_name` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `reviewer_user_id` int(11) NOT NULL,
  `reviewee_user_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `OTP_hash` varchar(255) NOT NULL,
  `user_type` enum('contractor','property_owner','both') NOT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `profile_pic`, `username`, `email`, `password_hash`, `OTP_hash`, `user_type`, `is_verified`, `is_active`, `created_at`, `updated_at`) VALUES
(1, NULL, 'ashxeyn', 'ashjjxeyn@gmail.com', '$2y$12$fWskY6zbdZiOvj3bbVPJyOahwb1VSPonLaIJVqciJQZb2Ove3AzMW', '$2y$12$rp.IOsHrjuormElLiwz5bOeYjEZ/665JAXMCmy1qqMp3cbAAJBB0a', 'both', 1, 1, '2025-11-01 04:49:04', '2025-11-15 13:34:57'),
(2, NULL, 'sandbox', 'sandbox@gmail.com', '$2y$12$7wRYH0dS2P/O9AKHmUUtR.zHkCE2gnDxGfrIV8z0.QbIX9kjMas8q', '$2y$12$ptwr5DjWPCTWSGVTgvdVJ.HufXk2iAp.Xr1wwG0qH.HyU/2Clnn9m', 'both', 1, 1, '2025-11-01 05:30:31', '2025-11-02 08:32:25'),
(10, NULL, 'ahdbahs', 'ahdbahs@gmal.com', '$2y$12$t6Uvs0VsuVL3ofAtuwKc.Ojsxh9BYW6FbMP1qSurCYWhdZ8shFcsu', '$2y$12$BGvjcwo2.veK2UqFIlSww.7CKetz8KCvRye4RqfeJbftLZ4b5vD3a', 'both', 1, 1, '2025-11-02 00:03:30', '2025-11-02 01:00:12'),
(11, 'profile_pictures/1762072945_profile_552180896_2235352176965283_3789601433528090852_n.jpg', 'ahdbahsahdbahs', 'ahdbahsahdbahs@gmail.com', '$2y$12$v6B4cZ6Zwx4vAnHsEeUYFe0MShzeHah20OxVo/gpw8ekgeQ2X23nK', '$2y$12$TuG8rquHKVRj9w8dNGqgCuOAyTt2uC5LdFZsGOySWQlgO5BKqoPhq', 'both', 1, 1, '2025-11-02 00:05:40', '2025-11-02 00:42:25'),
(12, NULL, 'ronron', 'ronron@gmail.com', '$2y$12$039Xd8JzNUj9XDWfQXosEePFngCgXAXcg8Ca9hIdtrI3tOnmKnPZS', '$2y$12$sxa0MzGRsL2DbUSScb.T0eYjBOTo/onaLyRty8O5EFE840SSpU6y2', 'property_owner', 1, 1, '2025-11-02 01:05:44', '2025-11-12 16:05:18'),
(13, NULL, 'Ronie', 'rone@gmail.com', '$2y$12$sgNYpj05G27xtZxpZhbBu.Rl8gpGzhVCft2JA18SaTamZV2Mz1J.a', '$2y$12$DCQDCvU8tZEtWMI1tbOFkubyIsG2zlVuGlIks4h7xiMvu/eSU1E0S', 'property_owner', 0, 1, '2025-11-11 06:35:01', '2025-11-11 06:35:01'),
(14, NULL, 'asdas', 'daasdad@gmail.com', '$2y$12$cK8JLtzQ64vqkYOwZhesoeNP/VdfF8Ldt4V3y7zqvxAMOl59uob5y', '$2y$12$Ma9sbAx.P.Yj0xqUbtMTfeTiPS1gLzgw6Rs.erSXCRgns.SbHaYz.', 'property_owner', 0, 1, '2025-11-11 06:41:52', '2025-11-11 06:41:52'),
(15, NULL, 'werwrwerwr', 'krystalbwerongow24@gmail.com', '$2y$12$chxZo.smd2kMDDp5sudBI.h6T69dSbiDHgetI7bM93LSynnud8Mo2', '$2y$12$2iFEJDBxObsUuT11/KT9He4GPA.SUYwkqLO96MSw1ZUC4tLK9wb7e', 'contractor', 1, 1, '2025-11-11 06:51:26', '2025-11-21 15:57:59'),
(16, NULL, 'asdasd', 'asdada@gmail.com', '$2y$12$7pQfbTa/4jB7iGe19dme.u39zldsnv2W6LcZr2Kr3ai8vws3acmB.', '$2y$12$lNHrR94yYKjiH5l6.r0Up.Y28SGKlnpHwnNbH2yS8XPM3AHRzQLlm', 'contractor', 0, 0, '2025-11-13 06:26:39', '2025-11-13 06:26:39'),
(17, NULL, 'adas', 'dasdaasd@gmail.com', '$2y$12$2I8xH1G.T869ppuheRHMc.f28tM.5C/XmCD1Iwe0DruyIDmq.wHpi', '$2y$12$9cfp.5hwS.wmHmAn0Srh5OBn8J3Z/Z59cy7KIA0ynOtUbqgwr7WjK', 'property_owner', 0, 0, '2025-11-13 06:40:49', '2025-11-13 06:40:49'),
(18, NULL, '3rwer', 'wewerw@gmail.com', '$2y$12$GNb65rCw1nsra3qw3QnofO4VUdyOFwoFJGqfYp3KWcNnHX40s4zo6', '$2y$12$q7.7Yy0rzTYC8r31Kbq/LetK0WFNIcLU2Avhu.vQGGWpvJhU12RrK', 'property_owner', 0, 0, '2025-11-13 06:51:12', '2025-11-13 06:51:12'),
(19, NULL, 'sds', 'ashASxeyn@gmail.com', '$2y$12$Q89JIrXTfe0Opqr6USgx9uEJNFcaqEyUWB4pvsaZ6P576L31w3HNu', '$2y$12$eFPZ9R8ZhS85z/3a.Rpr1ervgAoDpTZ0EXKusCH4Pc979gK1ILkFG', 'contractor', 0, 0, '2025-11-13 06:55:25', '2025-11-13 06:55:25'),
(20, NULL, 'asddas', 'ashxaaeyn@gmail.com', '$2y$12$XlmIokVrxsdwh8HyioXIsOoX9nH3jlwCL2UAK2No0ixAC3lP7Mboq', '$2y$12$pvDtHTsmnE3EDtOCWythGe8OCfKa.FeEjC8Y6RUpOlrAX26gQD/ha', 'property_owner', 0, 0, '2025-11-13 06:57:08', '2025-11-13 06:57:08'),
(21, NULL, 'asdassssd', 'asdsssas@wmsu.edu.ph', '$2y$12$AI36ZSkW7vYvh/Z/zejlKe4SpVWHJ/hXnytQUNVbsSrqs4WWeQJEC', '$2y$12$5QIwCGQSUVvwlzzhaH3Zu.JhAwFW4hhgpXvhNVpxnRLOEx7JUd6B2', 'property_owner', 0, 0, '2025-11-13 07:10:56', '2025-11-13 07:10:56'),
(22, NULL, 'asdasqqqd', 'sdfsssfd@wmsu.edu.ph', '$2y$12$zBAqQhNTbUxSMt164YXB.O9ZEz5F6XASGENyVTLCbyhaP.F1DxuGG', '$2y$12$wOZfnp4Q4hzASzFN3NorFetAGpFx1fSNU1KQGNRFE0.enIdqIroWO', 'both', 1, 1, '2025-11-13 07:20:42', '2025-11-13 09:40:37'),
(23, NULL, 'werwerwerw', 'sdwerwerfsfd@wmsu.edu.ph', '$2y$12$WCrGtbB1dF0qkolAZS0RUeMH8ayvKo8hUTf9fqyCdkTUUHWSJUuMW', '$2y$12$r7Kx3fca9wo9Hk5W.URmROIMQj9vBFcRvQgHpUF4.kCOVSuyCII.y', 'property_owner', 1, 0, '2025-11-13 09:44:26', '2025-11-14 03:26:51'),
(24, NULL, 'sdfsfdf', 'sdfddddsssfd@wmsu.edu.ph', '$2y$12$XZy815mrT32eJHMMaiiAwO9G34GHAPbJopiaJ2GQzUsgt7suox65O', '$2y$12$VaSuKG68htUWLWM9KQweSOXJiVj5QKnjgrA7bggUVjBaPrmeQjC7a', 'contractor', 0, 0, '2025-11-13 09:48:08', '2025-11-13 09:48:08'),
(25, NULL, 'qweqweeqweqwe', 'asjjhxeyn@gmail.com', '$2y$12$7hIhwmsJEQI9aw72O3mHCOlq5WRaZU.ACT4l73xXtA5Ph5WCYHUha', '$2y$12$6QbbV6rkmUtnprY4q91ukeLA9CPeCUDECsNQsYVtvWxCIwoPJCsv6', 'property_owner', 1, 1, '2025-11-15 05:36:42', '2025-11-21 06:41:36'),
(26, 'profiles/UPo1lTDBB7eaVjd25vpz6IzmTk8EinlCwwQ3sKmq.jpg', 'niggaaa', 'shanehart1001@gmail.com', '$2y$12$D4HOGluctzfO6x33rBKDCeySWY12peVNOpBKsih4/9vD8IXX7vahq', '$2y$12$4FvvXevobxAA3DkG53HqD.zqameMzfqqL8G/eHjLc9SMS1VU5n78C', 'property_owner', 0, 0, '2025-11-16 03:20:07', '2025-11-16 03:20:07'),
(27, NULL, 'wfsdf', 'ashxeyn@gmail.com', '$2y$12$tUuNd7bZlaCoi7as7o8AkOUtDCHYlYyUEr.keuH2PGDLf8tndzWMq', '$2y$12$ZtxNUGDlYljbJYMUbh8tpuVc2KfiN0c5sOA4Qo2F8AcO3FxUMZQgG', 'property_owner', 0, 0, '2025-11-18 16:17:48', '2025-11-18 16:17:48');

-- --------------------------------------------------------

--
-- Table structure for table `valid_ids`
--

CREATE TABLE `valid_ids` (
  `id` int(11) NOT NULL,
  `valid_id_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `valid_ids`
--

INSERT INTO `valid_ids` (`id`, `valid_id_name`) VALUES
(1, 'Philippine Passport'),
(2, 'Driver’s License'),
(3, 'SSS ID/UMID'),
(4, 'PhilHealth ID'),
(6, 'Voter’s ID/Certification'),
(7, 'Postal ID'),
(8, 'PRC ID'),
(9, 'National ID (PhilSys)'),
(10, 'Senior Citizen ID'),
(11, 'OFW/OWWA ID'),
(12, 'PWD ID'),
(14, 'NBI Clearance'),
(17, 'Barangay ID'),
(18, 'GSIS eCard');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `bids`
--
ALTER TABLE `bids`
  ADD PRIMARY KEY (`bid_id`),
  ADD UNIQUE KEY `unique_project_contractor` (`project_id`,`contractor_id`),
  ADD KEY `contractor_id` (`contractor_id`);

--
-- Indexes for table `bid_files`
--
ALTER TABLE `bid_files`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `bid_id` (`bid_id`);

--
-- Indexes for table `contractors`
--
ALTER TABLE `contractors`
  ADD PRIMARY KEY (`contractor_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `type_id` (`type_id`);

--
-- Indexes for table `contractor_types`
--
ALTER TABLE `contractor_types`
  ADD PRIMARY KEY (`type_id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indexes for table `contractor_users`
--
ALTER TABLE `contractor_users`
  ADD PRIMARY KEY (`contractor_user_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `contractor_id` (`contractor_id`);

--
-- Indexes for table `disputes`
--
ALTER TABLE `disputes`
  ADD PRIMARY KEY (`dispute_id`),
  ADD KEY `disputes_ibfk_1` (`project_id`),
  ADD KEY `disputes_ibfk_2` (`raised_by_user_id`),
  ADD KEY `disputes_ibfk_3` (`against_user_id`),
  ADD KEY `disputes_ibfk_4` (`milestone_id`),
  ADD KEY `milestone_item_item_milestone_item_id_foreign` (`milestone_item_id`);

--
-- Indexes for table `dispute_files`
--
ALTER TABLE `dispute_files`
  ADD PRIMARY KEY (`file_id`),
  ADD UNIQUE KEY `storage_path` (`storage_path`),
  ADD KEY `dispute_id` (`dispute_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `milestones`
--
ALTER TABLE `milestones`
  ADD PRIMARY KEY (`milestone_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `contractor_id` (`contractor_id`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indexes for table `milestone_items`
--
ALTER TABLE `milestone_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `milestone_id` (`milestone_id`);

--
-- Indexes for table `milestone_payments`
--
ALTER TABLE `milestone_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `contractor_user_id` (`contractor_user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `occupations`
--
ALTER TABLE `occupations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_plans`
--
ALTER TABLE `payment_plans`
  ADD PRIMARY KEY (`plan_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `contractor_id` (`contractor_id`);

--
-- Indexes for table `platform_payments`
--
ALTER TABLE `platform_payments`
  ADD PRIMARY KEY (`platform_payment_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `contractor_id` (`contractor_id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD KEY `fk_progress_milestone_item` (`milestone_item_id`);

--
-- Indexes for table `progress_files`
--
ALTER TABLE `progress_files`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `fk_progress_files_progress_id` (`progress_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `fk_projects_type_id` (`type_id`),
  ADD KEY `fk_projects_relationship_id` (`relationship_id`);

--
-- Indexes for table `project_files`
--
ALTER TABLE `project_files`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `project_relationships`
--
ALTER TABLE `project_relationships`
  ADD PRIMARY KEY (`rel_id`),
  ADD KEY `fk_projectrel_owner` (`owner_id`),
  ADD KEY `fk_projectrel_contractor` (`selected_contractor_id`);

--
-- Indexes for table `property_owners`
--
ALTER TABLE `property_owners`
  ADD PRIMARY KEY (`owner_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `valid_id_id` (`valid_id_id`),
  ADD KEY `occupation_id` (`occupation_id`);

--
-- Indexes for table `qr_codes`
--
ALTER TABLE `qr_codes`
  ADD PRIMARY KEY (`qr_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `reviewer_user_id` (`reviewer_user_id`),
  ADD KEY `reviewee_user_id` (`reviewee_user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `valid_ids`
--
ALTER TABLE `valid_ids`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bids`
--
ALTER TABLE `bids`
  MODIFY `bid_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bid_files`
--
ALTER TABLE `bid_files`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contractors`
--
ALTER TABLE `contractors`
  MODIFY `contractor_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contractor_types`
--
ALTER TABLE `contractor_types`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contractor_users`
--
ALTER TABLE `contractor_users`
  MODIFY `contractor_user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `disputes`
--
ALTER TABLE `disputes`
  MODIFY `dispute_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dispute_files`
--
ALTER TABLE `dispute_files`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `milestones`
--
ALTER TABLE `milestones`
  MODIFY `milestone_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `milestone_items`
--
ALTER TABLE `milestone_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `milestone_payments`
--
ALTER TABLE `milestone_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `occupations`
--
ALTER TABLE `occupations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `payment_plans`
--
ALTER TABLE `payment_plans`
  MODIFY `plan_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `platform_payments`
--
ALTER TABLE `platform_payments`
  MODIFY `platform_payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `progress_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `progress_files`
--
ALTER TABLE `progress_files`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_files`
--
ALTER TABLE `project_files`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_relationships`
--
ALTER TABLE `project_relationships`
  MODIFY `rel_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `property_owners`
--
ALTER TABLE `property_owners`
  MODIFY `owner_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qr_codes`
--
ALTER TABLE `qr_codes`
  MODIFY `qr_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `valid_ids`
--
ALTER TABLE `valid_ids`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bids`
--
ALTER TABLE `bids`
  ADD CONSTRAINT `bids_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bids_ibfk_2` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`contractor_id`) ON DELETE CASCADE;

--
-- Constraints for table `bid_files`
--
ALTER TABLE `bid_files`
  ADD CONSTRAINT `bid_files_ibfk_1` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`bid_id`) ON DELETE CASCADE;

--
-- Constraints for table `contractors`
--
ALTER TABLE `contractors`
  ADD CONSTRAINT `contractors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contractors_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `contractor_types` (`type_id`) ON DELETE CASCADE;

--
-- Constraints for table `contractor_users`
--
ALTER TABLE `contractor_users`
  ADD CONSTRAINT `contractor_users_ibfk_1` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`contractor_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contractor_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `disputes`
--
ALTER TABLE `disputes`
  ADD CONSTRAINT `disputes_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `disputes_ibfk_2` FOREIGN KEY (`raised_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `disputes_ibfk_3` FOREIGN KEY (`against_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `disputes_ibfk_4` FOREIGN KEY (`milestone_id`) REFERENCES `milestones` (`milestone_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `milestone_item_item_milestone_item_id_foreign` FOREIGN KEY (`milestone_item_id`) REFERENCES `milestone_items` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `dispute_files`
--
ALTER TABLE `dispute_files`
  ADD CONSTRAINT `dispute_files_ibfk_1` FOREIGN KEY (`dispute_id`) REFERENCES `disputes` (`dispute_id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `milestones`
--
ALTER TABLE `milestones`
  ADD CONSTRAINT `milestones_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `milestones_ibfk_2` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`contractor_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `milestones_ibfk_3` FOREIGN KEY (`plan_id`) REFERENCES `payment_plans` (`plan_id`) ON DELETE CASCADE;

--
-- Constraints for table `milestone_items`
--
ALTER TABLE `milestone_items`
  ADD CONSTRAINT `milestone_items_ibfk_1` FOREIGN KEY (`milestone_id`) REFERENCES `milestones` (`milestone_id`) ON DELETE CASCADE;

--
-- Constraints for table `milestone_payments`
--
ALTER TABLE `milestone_payments`
  ADD CONSTRAINT `milestone_payments_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `milestone_items` (`item_id`),
  ADD CONSTRAINT `milestone_payments_ibfk_3` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `milestone_payments_ibfk_4` FOREIGN KEY (`owner_id`) REFERENCES `property_owners` (`owner_id`),
  ADD CONSTRAINT `milestone_payments_ibfk_5` FOREIGN KEY (`contractor_user_id`) REFERENCES `contractor_users` (`contractor_user_id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `payment_plans`
--
ALTER TABLE `payment_plans`
  ADD CONSTRAINT `payment_plans_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `payment_plans_ibfk_2` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`contractor_id`);

--
-- Constraints for table `platform_payments`
--
ALTER TABLE `platform_payments`
  ADD CONSTRAINT `platform_payments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `platform_payments_ibfk_2` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`contractor_id`),
  ADD CONSTRAINT `platform_payments_ibfk_3` FOREIGN KEY (`owner_id`) REFERENCES `property_owners` (`owner_id`),
  ADD CONSTRAINT `platform_payments_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `admin_users` (`admin_id`);

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `fk_progress_milestone_item` FOREIGN KEY (`milestone_item_id`) REFERENCES `milestone_items` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `progress_files`
--
ALTER TABLE `progress_files`
  ADD CONSTRAINT `fk_progress_files_progress_id` FOREIGN KEY (`progress_id`) REFERENCES `progress` (`progress_id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_relationship_id` FOREIGN KEY (`relationship_id`) REFERENCES `project_relationships` (`rel_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_projects_type_id` FOREIGN KEY (`type_id`) REFERENCES `contractor_types` (`type_id`);

--
-- Constraints for table `project_files`
--
ALTER TABLE `project_files`
  ADD CONSTRAINT `project_files_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`);

--
-- Constraints for table `project_relationships`
--
ALTER TABLE `project_relationships`
  ADD CONSTRAINT `fk_projectrel_contractor` FOREIGN KEY (`selected_contractor_id`) REFERENCES `contractors` (`contractor_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_projectrel_owner` FOREIGN KEY (`owner_id`) REFERENCES `property_owners` (`owner_id`);

--
-- Constraints for table `property_owners`
--
ALTER TABLE `property_owners`
  ADD CONSTRAINT `property_owners_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `property_owners_ibfk_2` FOREIGN KEY (`valid_id_id`) REFERENCES `valid_ids` (`id`),
  ADD CONSTRAINT `property_owners_ibfk_3` FOREIGN KEY (`occupation_id`) REFERENCES `occupations` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`reviewee_user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
