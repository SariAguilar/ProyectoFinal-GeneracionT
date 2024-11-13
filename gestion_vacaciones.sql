-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: gestion_vacaciones
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empleado_id` int NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('presente','ausente','justificado') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `empleado_id` (`empleado_id`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dni` varchar(20) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `rol` enum('empleado','administrador') DEFAULT 'empleado',
  `dias_vacaciones_acumulados` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  KEY `dni_2` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleados`
--

LOCK TABLES `empleados` WRITE;
/*!40000 ALTER TABLE `empleados` DISABLE KEYS */;
INSERT INTO `empleados` VALUES (1,'12345678','Juan','Perez','1985-01-15','2020-06-01','activo','empleado',0),(2,'87654321','María','Gonzalez','1990-03-22','2018-11-15','activo','empleado',0),(3,'45678912','Pedro','Ramirez','1982-07-30','2015-02-20','activo','empleado',0),(4,'47429971','Sara Luz','Aguilar Mariaca','2024-08-22','2024-04-10','activo','empleado',0);
/*!40000 ALTER TABLE `empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_vacaciones`
--

DROP TABLE IF EXISTS `historial_vacaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_vacaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empleado_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `empleado_id` (`empleado_id`),
  CONSTRAINT `historial_vacaciones_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_vacaciones`
--

LOCK TABLES `historial_vacaciones` WRITE;
/*!40000 ALTER TABLE `historial_vacaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_vacaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_vacaciones`
--

DROP TABLE IF EXISTS `solicitudes_vacaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_vacaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empleado_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
  `observaciones` text,
  PRIMARY KEY (`id`),
  KEY `empleado_id` (`empleado_id`),
  CONSTRAINT `solicitudes_vacaciones_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_vacaciones`
--

LOCK TABLES `solicitudes_vacaciones` WRITE;
/*!40000 ALTER TABLE `solicitudes_vacaciones` DISABLE KEYS */;
INSERT INTO `solicitudes_vacaciones` VALUES (2,3,'2024-12-01','2024-12-05','pendiente','');
/*!40000 ALTER TABLE `solicitudes_vacaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empleado_id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `empleado_id` (`empleado_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (3,4,'saraluzaguilar.m@gmail.com','$2b$10$a6yjV2H141aDYlmD/6HBpOSLr5dHv2XkaD4C0PJMmFM35PUYQmW/e'),(4,1,'juan.perez@example.com','$2b$10$z3XJjZ/bDdj3Pt94zIX4Z.4n9xzrLXpiCdgmO2eAAGwHe9rIODZdu');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_admin`
--

DROP TABLE IF EXISTS `usuarios_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_admin`
--

LOCK TABLES `usuarios_admin` WRITE;
/*!40000 ALTER TABLE `usuarios_admin` DISABLE KEYS */;
INSERT INTO `usuarios_admin` VALUES (1,'Gael Leonardo','Bozo','11111111','lescalantegu@gmail.com','$2b$10$mzbg0oLaybGgRDuBYS7oQuVBCSg8xfZSxP77rVT/8ZZucRR6C6xba');
/*!40000 ALTER TABLE `usuarios_admin` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-12 23:43:30
