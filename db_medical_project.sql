-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-11-2025 a las 20:11:08
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `db_medical_project`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `analysis`
--

CREATE TABLE `analysis` (
  `id_analysis` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `id_disease` int(11) DEFAULT NULL,
  `id_user_doctor` int(11) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `result_ia` longtext DEFAULT NULL,
  `observation_doctor` text DEFAULT NULL,
  `url_image` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(4) DEFAULT 1 CHECK (`state` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `analysis`
--

INSERT INTO `analysis` (`id_analysis`, `id_user`, `id_disease`, `id_user_doctor`, `date`, `result_ia`, `observation_doctor`, `url_image`, `created_at`, `updated_at`, `state`) VALUES
(1, 7, NULL, 5, '2025-11-05 11:00:00', 'Sin hallazgos patológicos. Pulmones limpios.', 'Paciente asintomático. Control anual.', 'https://example.com/rayosx_juan.jpg', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(2, 8, NULL, 6, '2025-11-06 15:00:00', 'Nódulo pequeño en lóbulo superior derecho. Requiere seguimiento.', 'Derivar a especialista en 3 meses.', 'https://example.com/rayosx_ana.jpg', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `appointment`
--

CREATE TABLE `appointment` (
  `id_appointment` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `id_user_doctor` int(11) DEFAULT NULL,
  `appointment_date` datetime DEFAULT NULL,
  `id_state` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(4) DEFAULT 1 CHECK (`state` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `appointment`
--

INSERT INTO `appointment` (`id_appointment`, `id_user`, `id_user_doctor`, `appointment_date`, `id_state`, `created_at`, `updated_at`, `state`) VALUES
(1, 3, 2, '2025-10-10 09:00:00', 1, '2025-10-06 20:32:41', '2025-11-02 01:53:10', 1),
(2, 2, 2, '2025-10-11 15:30:00', 2, '2025-10-06 20:32:41', '2025-11-02 01:53:18', 1),
(3, 3, 5, '2025-11-10 10:00:00', 1, '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(4, 7, 6, '2025-11-11 14:30:00', 1, '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(5, 8, NULL, '2025-11-12 09:00:00', 2, '2025-11-02 12:26:30', '2025-11-02 12:27:27', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `appointment_history`
--

CREATE TABLE `appointment_history` (
  `id_history` int(11) NOT NULL,
  `id_appointment` int(11) NOT NULL,
  `id_event_type` int(11) NOT NULL,
  `id_user_action` int(11) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `previous_datetime` datetime DEFAULT NULL,
  `new_datetime` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `appointment_history`
--

INSERT INTO `appointment_history` (`id_history`, `id_appointment`, `id_event_type`, `id_user_action`, `reason`, `previous_datetime`, `new_datetime`, `created_at`, `updated_at`, `state`) VALUES
(1, 5, 3, 8, 'Conflicto de horario', '2025-11-11 09:00:00', '2025-11-12 09:00:00', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `attribute`
--

CREATE TABLE `attribute` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(4) DEFAULT 1 CHECK (`state` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `attribute`
--

INSERT INTO `attribute` (`id`, `name`, `description`, `created_at`, `updated_at`, `state`) VALUES
(1, 'Altura', 'Altura del paciente en cm', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(2, 'Peso', 'Peso del paciente en kg', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disease_type`
--

CREATE TABLE `disease_type` (
  `id_disease` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `label_s` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `severity_level` enum('leve','moderado','grave') DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `disease_type`
--

INSERT INTO `disease_type` (`id_disease`, `name`, `label_s`, `description`, `severity_level`, `created_at`, `updated_at`, `state`) VALUES
(1, 'Atelectasis', 'Atelectasia', 'Colapso parcial o completo del pulmón, que reduce la capacidad respiratoria.', 'moderado', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(2, 'Cardiomegaly', 'Cardiomegalia', 'Agrandamiento anormal del corazón, indicativo de sobrecarga cardíaca.', 'moderado', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(3, 'Consolidation', 'Consolidación', 'Acumulación de líquido o pus en los alvéolos pulmonares, común en infecciones.', 'moderado', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(4, 'Edema', 'Edema Pulmonar', 'Acumulación de líquido en el tejido pulmonar, que dificulta la respiración.', 'grave', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(5, 'Effusion', 'Derrame Pleural', 'Acumulación de líquido entre las capas de la pleura que rodean los pulmones.', 'moderado', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(6, 'Emphysema', 'Enfisema', 'Daño a los alvéolos pulmonares que reduce el intercambio de oxígeno.', 'grave', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(7, 'Fibrosis', 'Fibrosis Pulmonar', 'Formación de tejido cicatricial en los pulmones, que dificulta la respiración.', 'grave', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(8, 'Hernia', 'Hernia Diafragmática', 'Desplazamiento de órganos hacia el tórax a través del diafragma.', 'grave', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(9, 'Infiltration', 'Infiltración Pulmonar', 'Presencia de sustancias o células anormales dentro del tejido pulmonar.', 'moderado', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(10, 'Mass', 'Masa Pulmonar', 'Lesión sólida en el pulmón que puede ser benigna o maligna.', 'grave', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(11, 'Nodule', 'Nódulo Pulmonar', 'Pequeña lesión redondeada en el pulmón, usualmente menor a 3 cm.', 'leve', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(12, 'Pleural Thickening', 'Engrosamiento Pleural', 'Aumento del grosor de la pleura, a menudo por inflamación crónica.', 'moderado', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(13, 'Pneumonia', 'Neumonía', 'Infección pulmonar que inflama los sacos aéreos y causa acumulación de líquido.', 'grave', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1),
(14, 'Pneumothorax', 'Neumotórax', 'Colapso del pulmón por acumulación de aire en la cavidad pleural.', 'grave', '2025-11-01 21:49:20', '2025-11-01 21:49:20', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_type`
--

CREATE TABLE `event_type` (
  `id_event_type` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `label_es` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `changes_state` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `event_type`
--

INSERT INTO `event_type` (`id_event_type`, `code`, `label_es`, `description`, `changes_state`, `created_at`, `updated_at`, `state`) VALUES
(1, 'created', 'Creación de cita', 'Se ha creado una nueva cita en el sistema.', 1, '2025-11-01 18:11:37', '2025-11-01 18:11:37', 1),
(2, 'confirmed', 'Confirmación de cita', 'El doctor o paciente confirmó la cita.', 1, '2025-11-01 18:11:37', '2025-11-01 18:11:37', 1),
(3, 'rescheduled', 'Reprogramación de cita', 'La cita fue reprogramada para otra fecha.', 1, '2025-11-01 18:11:37', '2025-11-01 18:11:37', 1),
(4, 'cancelled', 'Cancelación de cita', 'La cita fue cancelada por alguna de las partes.', 1, '2025-11-01 18:11:37', '2025-11-01 18:11:37', 1),
(5, 'completed', 'Cita completada', 'La cita se realizó exitosamente.', 1, '2025-11-01 18:11:37', '2025-11-01 18:11:37', 1),
(6, 'no_show', 'Inasistencia', 'El paciente no asistió a la cita.', 1, '2025-11-01 18:11:37', '2025-11-01 18:11:37', 1),
(7, 'updated', 'Actualización de datos', 'Se modificaron detalles menores de la cita.', 0, '2025-11-01 18:11:37', '2025-11-01 18:11:37', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `module`
--

CREATE TABLE `module` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(4) DEFAULT 1 CHECK (`state` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `module`
--

INSERT INTO `module` (`id`, `name`, `description`, `created_at`, `updated_at`, `state`) VALUES
(1, 'Gestión de Usuarios', 'Permite administrar cuentas y roles', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(2, 'Gestión de Citas', 'Permite crear y gestionar citas médicas', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(3, 'Análisis de Imágenes', 'Subir y analizar imágenes médicas', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(4, 'Historial Clínico', 'Ver historial completo del paciente', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `module_x_rol`
--

CREATE TABLE `module_x_rol` (
  `id` int(11) NOT NULL,
  `id_rol` int(11) DEFAULT NULL,
  `id_module` int(11) DEFAULT NULL,
  `state` tinyint(4) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `module_x_rol`
--

INSERT INTO `module_x_rol` (`id`, `id_rol`, `id_module`, `state`, `created_at`, `updated_at`) VALUES
(3, 2, 2, 1, '2025-10-06 20:32:41', '2025-10-06 20:32:41'),
(4, 1, 1, 1, '2025-11-02 01:22:26', '2025-11-02 01:22:26'),
(5, 1, 2, 1, '2025-11-02 01:22:26', '2025-11-02 01:22:26'),
(6, 1, 3, 1, '2025-11-02 12:26:30', '2025-11-02 12:26:30'),
(7, 1, 4, 1, '2025-11-02 12:26:30', '2025-11-02 12:26:30'),
(8, 2, 3, 1, '2025-11-02 12:26:30', '2025-11-02 12:26:30'),
(9, 2, 4, 1, '2025-11-02 12:26:30', '2025-11-02 12:26:30'),
(10, 3, 3, 1, '2025-11-02 12:26:30', '2025-11-02 12:26:30'),
(11, 3, 4, 1, '2025-11-02 12:26:30', '2025-11-02 12:26:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(4) DEFAULT 1 CHECK (`state` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id`, `name`, `description`, `created_at`, `updated_at`, `state`) VALUES
(1, 'Admin', 'Administrator of the system', '2025-10-06 20:32:41', '2025-11-02 01:22:26', 1),
(2, 'Doctor', 'General or specialist doctor', '2025-10-06 20:32:41', '2025-10-13 19:39:50', 1),
(3, 'patient', 'User who receives medical care', '2025-10-06 20:32:41', '2025-10-13 19:39:50', 1),
(4, 'Assistant', 'Assistant role for support and administrative tasks', '2025-10-13 19:28:47', '2025-11-02 12:44:26', 0),
(5, 'Enfermero', 'Personal de enfermería', '2025-11-02 12:26:30', '2025-11-02 12:44:30', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `state_appointment`
--

CREATE TABLE `state_appointment` (
  `id_state` int(11) NOT NULL,
  `state_name` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(4) DEFAULT 1 CHECK (`state` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `state_appointment`
--

INSERT INTO `state_appointment` (`id_state`, `state_name`, `created_at`, `updated_at`, `state`) VALUES
(1, 'Pendiente', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(2, 'Confirmada', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(3, 'Cancelada', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(4, 'Completada', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(5, 'No Asistió', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `type_document`
--

CREATE TABLE `type_document` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(4) DEFAULT 1 CHECK (`state` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `type_document`
--

INSERT INTO `type_document` (`id`, `name`, `created_at`, `updated_at`, `state`) VALUES
(1, 'Cédula de Ciudadanía', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(2, 'Tarjeta de Identidad', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(3, 'Pasaporte', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `user_name` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `genero` enum('M','F','Otro') DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `date_birth` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `id_type_document` int(11) DEFAULT NULL,
  `num_document` int(50) DEFAULT NULL,
  `id_rol` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(4) DEFAULT 1 CHECK (`state` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `user_name`, `password`, `full_name`, `last_name`, `genero`, `email`, `date_birth`, `address`, `phone`, `id_type_document`, `num_document`, `id_rol`, `created_at`, `updated_at`, `state`) VALUES
(1, 'admin1', '1234', 'Laura', 'Gómez', 'F', 'laura@example.com', '1995-05-10', 'Cra 12 #45-10', '3115557890', 1, 1001234567, 1, '2025-10-06 20:32:41', '2025-11-02 12:40:07', 1),
(2, 'doc1', 'abcd', 'Andrés', 'Pérez', 'M', 'andres@example.com', '1990-09-15', 'Cl 80 #20-30', '3209876543', 1, 987654321, 2, '2025-10-06 20:32:41', '2025-11-02 12:40:07', 1),
(3, 'pac1', 'xyz', 'María', 'Ruiz', 'F', 'maria@example.com', '2000-01-22', 'Av 30 #12-15', '3001112233', 2, 11223344, 3, '2025-10-06 20:32:41', '2025-11-02 12:40:07', 1),
(4, 'newtest', 'pass123', 'New Updated', 'Test', 'Otro', 'newtest@example.com', '1990-01-01', '456 New St', '5555555', 1, 12345678, 1, '2025-10-13 19:14:45', '2025-11-02 12:40:07', 1),
(5, 'dr.lopez', 'doc2025', 'Roberto', 'López', 'M', 'roberto.lopez@clinica.com', '1975-04-12', 'Av. Salud 300', '987111222', 1, 99887766, 2, '2025-11-02 12:26:30', '2025-11-02 12:40:07', 1),
(6, 'dr.sanchez', 'doc2025', 'Carmen', 'Sánchez', 'F', 'carmen.sanchez@clinica.com', '1980-08-19', 'Calle Norte 150', '987333444', 1, 55446677, 2, '2025-11-02 12:26:30', '2025-11-02 12:40:07', 1),
(7, 'juan.perez', 'pac2025', 'Juan', 'Pérez', 'M', 'juan.perez@gmail.com', '1992-06-15', 'Jr. Las Flores 200', '3009998888', 1, 77788899, 3, '2025-11-02 12:26:30', '2025-11-02 12:40:07', 1),
(8, 'ana.martin', 'pac2025', 'Ana', 'Martín', 'F', 'ana.martin@gmail.com', '1987-11-03', 'Av. Primavera 500', '3007776666', 2, 22334455, 3, '2025-11-02 12:26:30', '2025-11-02 12:40:07', 1),
(9, 'pedro.gomez', 'pac2025', 'Pedro', 'Gómez', 'M', 'pedro.gomez@gmail.com', '1998-02-28', 'Calle Sol 80', '3005554444', 1, 11223344, 3, '2025-11-02 12:26:30', '2025-11-02 12:40:07', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users_x_attribute`
--

CREATE TABLE `users_x_attribute` (
  `id` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `id_attribute` int(11) DEFAULT NULL,
  `worth` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `state` tinyint(4) DEFAULT 1 CHECK (`state` in (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users_x_attribute`
--

INSERT INTO `users_x_attribute` (`id`, `id_user`, `id_attribute`, `worth`, `created_at`, `updated_at`, `state`) VALUES
(1, 3, 1, '165', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(2, 3, 2, '60', '2025-10-06 20:32:41', '2025-10-06 20:32:41', 1),
(3, 7, 1, '170', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(4, 7, 2, '72', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(5, 8, 1, '162', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(6, 8, 2, '58', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(7, 9, 1, '175', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1),
(8, 9, 2, '80', '2025-11-02 12:26:30', '2025-11-02 12:26:30', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `analysis`
--
ALTER TABLE `analysis`
  ADD PRIMARY KEY (`id_analysis`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `fk_analysis_disease` (`id_disease`),
  ADD KEY `fk_analysis_user_doctor` (`id_user_doctor`);

--
-- Indices de la tabla `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`id_appointment`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_state` (`id_state`),
  ADD KEY `fk_appointment_doctor` (`id_user_doctor`);

--
-- Indices de la tabla `appointment_history`
--
ALTER TABLE `appointment_history`
  ADD PRIMARY KEY (`id_history`),
  ADD KEY `idx_hist_appointment` (`id_appointment`),
  ADD KEY `idx_hist_event_type` (`id_event_type`),
  ADD KEY `idx_hist_user_action` (`id_user_action`);

--
-- Indices de la tabla `attribute`
--
ALTER TABLE `attribute`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `disease_type`
--
ALTER TABLE `disease_type`
  ADD PRIMARY KEY (`id_disease`);

--
-- Indices de la tabla `event_type`
--
ALTER TABLE `event_type`
  ADD PRIMARY KEY (`id_event_type`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indices de la tabla `module`
--
ALTER TABLE `module`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `module_x_rol`
--
ALTER TABLE `module_x_rol`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_rol` (`id_rol`),
  ADD KEY `id_module` (`id_module`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `state_appointment`
--
ALTER TABLE `state_appointment`
  ADD PRIMARY KEY (`id_state`);

--
-- Indices de la tabla `type_document`
--
ALTER TABLE `type_document`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_type_document` (`id_type_document`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `users_x_attribute`
--
ALTER TABLE `users_x_attribute`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_attribute` (`id_attribute`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `analysis`
--
ALTER TABLE `analysis`
  MODIFY `id_analysis` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `appointment`
--
ALTER TABLE `appointment`
  MODIFY `id_appointment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `appointment_history`
--
ALTER TABLE `appointment_history`
  MODIFY `id_history` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `attribute`
--
ALTER TABLE `attribute`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `disease_type`
--
ALTER TABLE `disease_type`
  MODIFY `id_disease` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `event_type`
--
ALTER TABLE `event_type`
  MODIFY `id_event_type` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `module`
--
ALTER TABLE `module`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `module_x_rol`
--
ALTER TABLE `module_x_rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `state_appointment`
--
ALTER TABLE `state_appointment`
  MODIFY `id_state` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `type_document`
--
ALTER TABLE `type_document`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `users_x_attribute`
--
ALTER TABLE `users_x_attribute`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `analysis`
--
ALTER TABLE `analysis`
  ADD CONSTRAINT `analysis_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `fk_analysis_disease` FOREIGN KEY (`id_disease`) REFERENCES `disease_type` (`id_disease`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_analysis_user_doctor` FOREIGN KEY (`id_user_doctor`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `appointment`
--
ALTER TABLE `appointment`
  ADD CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`id_state`) REFERENCES `state_appointment` (`id_state`),
  ADD CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`id_user_doctor`) REFERENCES `user` (`id`);

--
-- Filtros para la tabla `appointment_history`
--
ALTER TABLE `appointment_history`
  ADD CONSTRAINT `fk_history_appointment` FOREIGN KEY (`id_appointment`) REFERENCES `appointment` (`id_appointment`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_history_event_type` FOREIGN KEY (`id_event_type`) REFERENCES `event_type` (`id_event_type`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_history_user_action` FOREIGN KEY (`id_user_action`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `module_x_rol`
--
ALTER TABLE `module_x_rol`
  ADD CONSTRAINT `module_x_rol_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id`),
  ADD CONSTRAINT `module_x_rol_ibfk_2` FOREIGN KEY (`id_module`) REFERENCES `module` (`id`);

--
-- Filtros para la tabla `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`id_type_document`) REFERENCES `type_document` (`id`),
  ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id`);

--
-- Filtros para la tabla `users_x_attribute`
--
ALTER TABLE `users_x_attribute`
  ADD CONSTRAINT `users_x_attribute_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `users_x_attribute_ibfk_2` FOREIGN KEY (`id_attribute`) REFERENCES `attribute` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
