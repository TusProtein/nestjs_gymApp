-- MySQL dump 10.13  Distrib 8.4.6, for Linux (x86_64)
--
-- Host: localhost    Database: nestjs_gym_db
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Gym`
--

DROP TABLE IF EXISTS `Gym`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Gym` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Gym_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Gym`
--

LOCK TABLES `Gym` WRITE;
/*!40000 ALTER TABLE `Gym` DISABLE KEYS */;
INSERT INTO `Gym` VALUES (1,'Default Gym','123 Main St','2025-10-30 09:32:58.789','2025-10-30 09:32:58.789',1);
/*!40000 ALTER TABLE `Gym` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MembershipPlan`
--

DROP TABLE IF EXISTS `MembershipPlan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MembershipPlan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `durationInDays` int NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount` int DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `gymId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MembershipPlan_name_key` (`name`),
  KEY `MembershipPlan_gymId_fkey` (`gymId`),
  CONSTRAINT `MembershipPlan_gymId_fkey` FOREIGN KEY (`gymId`) REFERENCES `Gym` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MembershipPlan`
--

LOCK TABLES `MembershipPlan` WRITE;
/*!40000 ALTER TABLE `MembershipPlan` DISABLE KEYS */;
/*!40000 ALTER TABLE `MembershipPlan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Schedule`
--

DROP TABLE IF EXISTS `Schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ptId` int NOT NULL,
  `memberId` int NOT NULL,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Scheduled',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Schedule_memberId_fkey` (`memberId`),
  KEY `Schedule_ptId_fkey` (`ptId`),
  CONSTRAINT `Schedule_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Schedule_ptId_fkey` FOREIGN KEY (`ptId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Schedule`
--

LOCK TABLES `Schedule` WRITE;
/*!40000 ALTER TABLE `Schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `Schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Subcription`
--

DROP TABLE IF EXISTS `Subcription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Subcription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memberId` int DEFAULT NULL,
  `planId` int NOT NULL,
  `gymId` int NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `totalPrice` int NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Subcription_gymId_fkey` (`gymId`),
  KEY `Subcription_planId_fkey` (`planId`),
  KEY `Subcription_memberId_fkey` (`memberId`),
  CONSTRAINT `Subcription_gymId_fkey` FOREIGN KEY (`gymId`) REFERENCES `Gym` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Subcription_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Subcription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `MembershipPlan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Subcription`
--

LOCK TABLES `Subcription` WRITE;
/*!40000 ALTER TABLE `Subcription` DISABLE KEYS */;
/*!40000 ALTER TABLE `Subcription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `role` enum('SUPER_ADMIN','ADMIN','PT','MEMBER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER',
  `dateOfBirth` datetime(3) NOT NULL,
  `gymId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_phone_key` (`phone`),
  KEY `User_gymId_fkey` (`gymId`),
  CONSTRAINT `User_gymId_fkey` FOREIGN KEY (`gymId`) REFERENCES `Gym` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('Super Admin',1,'maianhtu2001@gmail.com','0964512001','$2b$10$nHhfL2TpQB7iPseXwAxVauYkdh.lV769I9wjZo5YCem.qs4A3zmIC','2025-10-30 09:32:58.889','2025-10-30 09:32:58.889','SUPER_ADMIN','2001-06-11 00:00:00.000',NULL),('Admin',2,'admin123@gym.com','0912345678','$2b$10$0QkFu7f2QkP8WZycXdokPeA2Zng6GhZJF1DzrNLvQrW5oxTQ.x1lW','2025-10-30 09:32:58.989','2025-10-30 09:32:58.989','ADMIN','2001-08-25 00:00:00.000',1),('PT Gym1',3,'pt@gym.com','0964532001','$2b$10$S3n2L2kFfa1G7y8xBqvIpuq/ZrCUGALs1SUwHh3cfj.loaieoiEXi','2025-10-30 09:32:59.068','2025-10-30 09:32:59.068','PT','1998-08-20 00:00:00.000',1),('Tuspro',4,'maitu2923124@gmail.com','0964423001','999999999','2025-10-30 09:32:59.086','2025-10-30 09:32:59.086','MEMBER','2001-06-10 00:00:00.000',1);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserMembership`
--

DROP TABLE IF EXISTS `UserMembership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserMembership` (
  `id` int NOT NULL AUTO_INCREMENT,
  `planId` int NOT NULL,
  `startDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endDate` datetime(3) NOT NULL,
  `paymentStatus` enum('PENDING','PAID','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `finalPrice` double NOT NULL DEFAULT '0',
  `ptId` int DEFAULT NULL,
  `memberId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `UserMembership_planId_idx` (`planId`),
  KEY `UserMembership_ptId_idx` (`ptId`),
  KEY `UserMembership_memberId_fkey` (`memberId`),
  CONSTRAINT `UserMembership_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `UserMembership_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `MembershipPlan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `UserMembership_ptId_fkey` FOREIGN KEY (`ptId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserMembership`
--

LOCK TABLES `UserMembership` WRITE;
/*!40000 ALTER TABLE `UserMembership` DISABLE KEYS */;
/*!40000 ALTER TABLE `UserMembership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WorkoutPlan`
--

DROP TABLE IF EXISTS `WorkoutPlan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WorkoutPlan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime(3) NOT NULL,
  `memberId` int NOT NULL,
  `ptId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `WorkoutPlan_memberId_fkey` (`memberId`),
  KEY `WorkoutPlan_ptId_fkey` (`ptId`),
  CONSTRAINT `WorkoutPlan_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `WorkoutPlan_ptId_fkey` FOREIGN KEY (`ptId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WorkoutPlan`
--

LOCK TABLES `WorkoutPlan` WRITE;
/*!40000 ALTER TABLE `WorkoutPlan` DISABLE KEYS */;
/*!40000 ALTER TABLE `WorkoutPlan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WorkoutProgress`
--

DROP TABLE IF EXISTS `WorkoutProgress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WorkoutProgress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memberId` int NOT NULL,
  `ptId` int NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `weight` double DEFAULT NULL,
  `bodyFat` double DEFAULT NULL,
  `muscleMass` double DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `performance` json DEFAULT NULL,
  `gymId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `WorkoutProgress_gymId_fkey` (`gymId`),
  KEY `WorkoutProgress_memberId_fkey` (`memberId`),
  KEY `WorkoutProgress_ptId_fkey` (`ptId`),
  CONSTRAINT `WorkoutProgress_gymId_fkey` FOREIGN KEY (`gymId`) REFERENCES `Gym` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `WorkoutProgress_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `WorkoutProgress_ptId_fkey` FOREIGN KEY (`ptId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WorkoutProgress`
--

LOCK TABLES `WorkoutProgress` WRITE;
/*!40000 ALTER TABLE `WorkoutProgress` DISABLE KEYS */;
INSERT INTO `WorkoutProgress` VALUES (5,4,3,'2025-11-25 08:00:00.000',68,12,35,'Test','{\"Ép ngực\": \"15kg mỗi bên 16reps\", \"Ngực trên\": \"25kg mỗi bên 8reps\", \"Ngực giữa\": \"30kg mỗi bên 12reps\", \"Tay sau cable\": \"32kg 16reps\", \"Ngực dưới\": \"25kg mỗi bên 12reps\", \"Tay sau cable ngược\": \"23kg 16reps\"}',1,'2025-11-25 08:37:05.523','2025-11-25 08:37:05.523');
/*!40000 ALTER TABLE `WorkoutProgress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('b66980a4-c4a9-49e7-8d87-3a6ea1c80f3a','5b83db6bc4c613be24fd98824d3d9ef8ecc3e50d90263d6c9634479e0b69783e','2025-10-31 08:38:52.416','20251031083852_add_workout_progress',NULL,NULL,'2025-10-31 08:38:52.140',1),('cf34afd7-c385-4f2e-80c2-3b333e2fafa3','074cac9fb0ba83ca21ebd7fbebf04df862d0a4d14c48e4255acbd040194b26de','2025-10-30 09:32:08.393','20251030093205_init',NULL,NULL,'2025-10-30 09:32:05.548',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04  7:26:13
