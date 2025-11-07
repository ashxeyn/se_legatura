-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 05, 2025 at 01:12 PM
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
  `bid_status` enum('submitted','under_review','accepted','rejected','withdrawn') DEFAULT 'submitted',
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

--
-- Dumping data for table `contractors`
--

INSERT INTO `contractors` (`contractor_id`, `user_id`, `company_name`, `years_of_experience`, `type_id`, `contractor_type_other`, `services_offered`, `business_address`, `company_email`, `company_phone`, `company_website`, `company_social_media`, `company_description`, `picab_number`, `picab_category`, `picab_expiration_date`, `business_permit_number`, `business_permit_city`, `business_permit_expiration`, `tin_business_reg_number`, `dti_sec_registration_photo`, `verification_status`, `verification_date`, `rejection_reason`, `completed_projects`, `created_at`, `updated_at`) VALUES
(1, 2, 'Sandbox', 13, 5, NULL, 'SHEESH', 'Sheesh, Sagua, Margosatubig, Zamboanga Del Sur 7000', 'sandbox@gmail.com', '09926314079', 'https://chatgpt.com/c/6905fa96-08c0-8321-8a63-d13ae3fabea5', NULL, NULL, '123123', 'AAA', '2025-11-06', '123213', 'Abucay', '2025-11-06', '123123', 'DTI_SEC/9Fx1ys8wvaTxw6UsmqO2QyJufudjy4T1gXRIAqCY.jpg', 'pending', NULL, NULL, 0, '2025-11-01 05:30:31', '2025-11-01 05:30:31'),
(2, 1, 'sad', 12, 5, NULL, 'dsd', 'asdasd, Minanga Sur, Iguig, Cagayan 1234', 'ashxeyn@gmail.com', '09926312271', NULL, NULL, NULL, 'ad12312', 'AAAA', '2025-11-08', '13231', 'Al-Barka', '2025-11-08', '13123123', 'contractor_documents/1762006595_dti_sec_557969314_2535718666804066_2236441680610974884_n.png', 'pending', NULL, NULL, 0, '2025-11-01 06:16:37', '2025-11-01 06:16:37'),
(3, 11, 'Niggatura', 12, 9, 'naueg', 'afsf', 'asasda, Taloto, City of Tagbilaran, Bohol 2311', 'ahdbahsahdbahs@gmail.com', '09926314033', NULL, NULL, NULL, '12312312312', 'AA', '2025-11-07', '123123131', 'Abra De Ilog', '2025-11-06', '13123132131', 'DTI_SEC/ghZAar8qp7Uxv8pz82RX3JHN3CLHXJlNHVphoRIR.png', 'pending', NULL, NULL, 0, '2025-11-02 00:05:40', '2025-11-02 00:05:40'),
(5, 10, 'adad', 23, 2, NULL, 'sdada', 'adad, Singi, Vinzons, Camarines Norte 2311', 'ahdbahs@gmal.com', '09926314072', NULL, NULL, NULL, '12312333', 'AAA', '2025-11-06', '12312312312313', 'Abra De Ilog', '2025-11-12', '13123124123', 'contractor_documents/1762074010_dti_sec_work diagram.drawio.png', 'pending', NULL, NULL, 0, '2025-11-02 01:00:12', '2025-11-02 01:00:12');

-- --------------------------------------------------------

--
-- Table structure for table `contractor_types`
--

CREATE TABLE `contractor_types` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contractor_types`
--

INSERT INTO `contractor_types` (`type_id`, `type_name`) VALUES
(6, 'Architectural Contractor'),
(5, 'Civil Works Contractor'),
(2, 'Electrical Contractor'),
(1, 'General Contractor'),
(7, 'Interior Fit-out Contractor'),
(8, 'Landscaping Contractor'),
(4, 'Mechanical Contractor'),
(9, 'Others'),
(3, 'Pool Contractor');

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

--
-- Dumping data for table `contractor_users`
--

INSERT INTO `contractor_users` (`contractor_user_id`, `contractor_id`, `user_id`, `authorized_rep_lname`, `authorized_rep_mname`, `authorized_rep_fname`, `phone_number`, `role`, `is_active`, `created_at`) VALUES
(1, 1, 2, 'Hart', NULL, 'Shane', '09926354567', 'owner', 1, '2025-11-01 05:30:31'),
(2, 2, 1, 'Jimenez', NULL, 'Shane Hart', '09926314071', 'owner', 1, '2025-11-01 06:16:37'),
(3, 3, 11, 'ahdbahsahdbahs', NULL, 'ahdbahahdbahss', '09926314033', 'owner', 1, '2025-11-02 00:05:40'),
(5, 5, 10, 'ahdbahs', NULL, 'ahdbahs', '09926314071', 'owner', 1, '2025-11-02 01:00:12');

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
  `milestone_status` enum('not_started','in_progress','submitted','under_review','approved','rejected','delayed') DEFAULT 'not_started',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
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
  `plan_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `contractor_user_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_type` enum('cash','check','bank_transfer','online_payment') NOT NULL,
  `transaction_number` varchar(100) DEFAULT NULL,
  `receipt_photo` varchar(255) NOT NULL,
  `transaction_date` timestamp NULL DEFAULT current_timestamp(),
  `is_approved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `milestone_payment_view`
-- (See below for the actual view)
--
CREATE TABLE `milestone_payment_view` (
);

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
-- Table structure for table `progress_files`
--

CREATE TABLE `progress_files` (
  `file_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `contractor_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` enum('pdf','doc','docx','zip','jpg','png') NOT NULL,
  `file_status` enum('submitted','under_review','approved','needs_revision') DEFAULT 'submitted',
  `owner_feedback` text DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `project_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
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
  `project_status` enum('open','bidding_closed','in_progress','completed','terminated') DEFAULT 'open',
  `selected_contractor_id` int(11) DEFAULT NULL,
  `bidding_deadline` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_files`
--

CREATE TABLE `project_files` (
  `file_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `file_type` enum('building permit','blueprint','desired design','others') NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp()
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
  `valid_id_number` varchar(100) NOT NULL,
  `valid_id_photo` varchar(255) DEFAULT NULL,
  `police_clearance` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `age` int(11) NOT NULL,
  `occupation_id` int(11) DEFAULT NULL,
  `occupation_other` varchar(200) DEFAULT NULL,
  `verification_status` enum('pending','rejected','verified','') NOT NULL DEFAULT 'pending',
  `verification_date` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_owners`
--

INSERT INTO `property_owners` (`owner_id`, `user_id`, `last_name`, `middle_name`, `first_name`, `phone_number`, `address`, `valid_id_id`, `valid_id_number`, `valid_id_photo`, `police_clearance`, `date_of_birth`, `age`, `occupation_id`, `occupation_other`, `verification_status`, `verification_date`, `created_at`) VALUES
(1, 1, 'Jimenez', NULL, 'Shane Hart', '09926314071', 'Sapphire, Tumaga, City of Zamboanga, Zamboanga Del Sur, 7000', 9, '123456789992', 'validID/KRZqUkJdJ5MNgo0sc8XJzv34JUAuwAWnyqiBNRUj.jpg', 'policeClearance/93cTyjFuXGYfruccxpqlLcB0PpEfVdqLA3U22nAA.jpg', '2004-10-01', 21, 19, NULL, 'pending', '0000-00-00 00:00:00', '2025-11-01 04:49:04'),
(2, 2, 'Hart', NULL, 'Shane', '09926354567', 'aasdasd, Canangca-an, Corella, Bohol, 7000', 9, '111111111111', 'owner_documents/1762064843_valid_id_557969314_2535718666804066_2236441680610974884_n.png', 'owner_documents/1762064843_police_557969314_2535718666804066_2236441680610974884_n.png', '1997-10-15', 28, 20, NULL, 'pending', '0000-00-00 00:00:00', '2025-11-01 22:27:25'),
(4, 10, 'ahdbahs', NULL, 'ahdbahs', '09926314071', 'sapphire, Pongol, Libona, Bukidnon, 7000', 18, '12345678', 'validID/J2N7HRzSSqIZjj1aizDXhROD3JsHGhOxxM9TVTiR.png', 'policeClearance/S2Q5O9Oq7ZzYxeBXE9ZoIAQhHtXjeFVkKI0l9Rsz.png', '1985-06-11', 40, 23, NULL, 'pending', '2025-11-02 08:03:30', '2025-11-02 00:03:30'),
(5, 11, 'ahdbahsahdbahs', NULL, 'ahdbahahdbahss', '09926314033', 'sapphire, District II (Pob.), Gainza, Camarines Sur, 7000', 18, '12345567', 'owner_documents/1762072939_valid_id_566669930_786139620958735_7349053833120477730_n.jpg', 'owner_documents/1762072939_police_557432724_783418661334280_8030311886887135624_n.jpg', '2000-02-07', 25, 23, NULL, 'pending', '2025-11-02 08:42:25', '2025-11-02 00:42:25'),
(6, 12, 'Kulong', 'Gellecania', 'Rone', '09926318765', 'Emerald, Tumaga, City of Zamboanga, Zamboanga Del Sur, 7000', 9, '123456789009', 'validID/pGZFZygIzYsijS3D520jq8Dka455HTdM9ph95jhX.png', 'policeClearance/VFBu06m9DcmkOifKVaUhRX7djn2X8wgQTiTMFJ5G.png', '2005-07-26', 20, 23, NULL, 'pending', '2025-11-02 09:05:44', '2025-11-02 01:05:44');

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
(1, NULL, 'ashxeyn', 'ashxeyn@gmail.com', '$2y$12$fWskY6zbdZiOvj3bbVPJyOahwb1VSPonLaIJVqciJQZb2Ove3AzMW', '$2y$12$rp.IOsHrjuormElLiwz5bOeYjEZ/665JAXMCmy1qqMp3cbAAJBB0a', 'both', 1, 1, '2025-11-01 04:49:04', '2025-11-02 07:00:50'),
(2, NULL, 'sandbox', 'sandbox@gmail.com', '$2y$12$7wRYH0dS2P/O9AKHmUUtR.zHkCE2gnDxGfrIV8z0.QbIX9kjMas8q', '$2y$12$ptwr5DjWPCTWSGVTgvdVJ.HufXk2iAp.Xr1wwG0qH.HyU/2Clnn9m', 'both', 1, 1, '2025-11-01 05:30:31', '2025-11-02 08:32:25'),
(10, NULL, 'ahdbahs', 'ahdbahs@gmal.com', '$2y$12$t6Uvs0VsuVL3ofAtuwKc.Ojsxh9BYW6FbMP1qSurCYWhdZ8shFcsu', '$2y$12$BGvjcwo2.veK2UqFIlSww.7CKetz8KCvRye4RqfeJbftLZ4b5vD3a', 'both', 1, 1, '2025-11-02 00:03:30', '2025-11-02 01:00:12'),
(11, 'profile_pictures/1762072945_profile_552180896_2235352176965283_3789601433528090852_n.jpg', 'ahdbahsahdbahs', 'ahdbahsahdbahs@gmail.com', '$2y$12$v6B4cZ6Zwx4vAnHsEeUYFe0MShzeHah20OxVo/gpw8ekgeQ2X23nK', '$2y$12$TuG8rquHKVRj9w8dNGqgCuOAyTt2uC5LdFZsGOySWQlgO5BKqoPhq', 'both', 1, 1, '2025-11-02 00:05:40', '2025-11-02 00:42:25'),
(12, NULL, 'ronron', 'ronron@gmail.com', '$2y$12$039Xd8JzNUj9XDWfQXosEePFngCgXAXcg8Ca9hIdtrI3tOnmKnPZS', '$2y$12$sxa0MzGRsL2DbUSScb.T0eYjBOTo/onaLyRty8O5EFE840SSpU6y2', 'property_owner', 0, 1, '2025-11-02 01:05:44', '2025-11-02 01:05:44');

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

-- --------------------------------------------------------

--
-- Structure for view `milestone_payment_view`
--
DROP TABLE IF EXISTS `milestone_payment_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `milestone_payment_view`  AS SELECT `mi`.`item_id` AS `item_id`, `mi`.`milestone_id` AS `milestone_id`, `mi`.`payment_percentage` AS `payment_percentage`, `pp`.`payment_mode` AS `payment_mode`, `pp`.`total_project_cost` AS `total_project_cost`, `pp`.`downpayment_amount` AS `downpayment_amount`, CASE WHEN `pp`.`payment_mode` = 'full_payment' THEN `pp`.`total_project_cost`* (`mi`.`payment_percentage` / 100) WHEN `pp`.`payment_mode` = 'downpayment' THEN (`pp`.`total_project_cost` - `pp`.`downpayment_amount`) * (`mi`.`payment_percentage` / 100) END AS `payment_amount` FROM ((`milestone_items` `mi` join `milestones` `m` on(`mi`.`milestone_id` = `m`.`milestone_id`)) join `payment_plans` `pp` on(`m`.`plan_id` = `pp`.`plan_id`)) ;

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
  ADD KEY `plan_id` (`plan_id`),
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
-- Indexes for table `progress_files`
--
ALTER TABLE `progress_files`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `contractor_id` (`contractor_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `type_id` (`type_id`);

--
-- Indexes for table `project_files`
--
ALTER TABLE `project_files`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `project_id` (`project_id`);

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
  MODIFY `contractor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `contractor_types`
--
ALTER TABLE `contractor_types`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `contractor_users`
--
ALTER TABLE `contractor_users`
  MODIFY `contractor_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- AUTO_INCREMENT for table `property_owners`
--
ALTER TABLE `property_owners`
  MODIFY `owner_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  ADD CONSTRAINT `milestone_payments_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `payment_plans` (`plan_id`),
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
-- Constraints for table `progress_files`
--
ALTER TABLE `progress_files`
  ADD CONSTRAINT `progress_files_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `milestone_items` (`item_id`),
  ADD CONSTRAINT `progress_files_ibfk_2` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`contractor_id`);

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `property_owners` (`owner_id`),
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `contractor_types` (`type_id`);

--
-- Constraints for table `project_files`
--
ALTER TABLE `project_files`
  ADD CONSTRAINT `project_files_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`);

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
