-- Base de datos para el ejercicio R3: login OAuth (Google, GitHub, Discord) + ABMLC de tareas
CREATE DATABASE IF NOT EXISTS r5_abmlc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE r5_abmlc;

-- Un usuario por combinación (provider, provider_id) para poder loguearse con distintas cuentas
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(20) NOT NULL,
  provider_id VARCHAR(100) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NULL,
  avatar_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_provider_account (provider, provider_id)
);

-- ABMLC: tareas propias de cada usuario logueado
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  status ENUM('pendiente', 'en_progreso', 'completada') NOT NULL DEFAULT 'pendiente',
  priority ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
  due_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user ON tasks(user_id);
