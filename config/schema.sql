-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS roombooking;
CREATE DATABASE roombooking;
USE roombooking;

-- Create rooms table
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add a stored procedure to check for booking conflicts
DELIMITER //
DROP PROCEDURE IF EXISTS check_booking_conflicts//
CREATE PROCEDURE check_booking_conflicts(
  IN p_room_id INT,
  IN p_booking_id INT,
  IN p_start_time DATETIME,
  IN p_end_time DATETIME,
  OUT p_conflict_exists BOOLEAN
)
BEGIN
  DECLARE conflict_count INT;

  SELECT COUNT(*) INTO conflict_count FROM bookings b 
  WHERE b.room_id = p_room_id 
  AND (b.id != p_booking_id OR p_booking_id IS NULL)
  AND b.status != 'cancelled'
  AND (
    (p_start_time BETWEEN b.start_time AND b.end_time)
    OR (p_end_time BETWEEN b.start_time AND b.end_time)
    OR (p_start_time <= b.start_time AND p_end_time >= b.end_time)
  );

  SET p_conflict_exists = (conflict_count > 0);
END//
DELIMITER ;

-- Create a function to check booking conflicts
DELIMITER //
DROP FUNCTION IF EXISTS booking_conflicts_exist//
CREATE FUNCTION booking_conflicts_exist(
  p_room_id INT,
  p_booking_id INT,
  p_start_time DATETIME,
  p_end_time DATETIME
) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
  DECLARE conflict_exists BOOLEAN;
  CALL check_booking_conflicts(p_room_id, p_booking_id, p_start_time, p_end_time, conflict_exists);
  RETURN conflict_exists;
END//
DELIMITER ;

-- Create triggers to prevent double bookings
DELIMITER //
DROP TRIGGER IF EXISTS prevent_double_booking//
CREATE TRIGGER prevent_double_booking BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
  IF booking_conflicts_exist(NEW.room_id, NULL, NEW.start_time, NEW.end_time) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room is already booked for this time period';
  END IF;
END//

DROP TRIGGER IF EXISTS prevent_double_booking_update//
CREATE TRIGGER prevent_double_booking_update BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF NEW.status != 'cancelled' AND 
     (OLD.room_id != NEW.room_id OR 
      OLD.start_time != NEW.start_time OR 
      OLD.end_time != NEW.end_time) AND
     booking_conflicts_exist(NEW.room_id, NEW.id, NEW.start_time, NEW.end_time) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room is already booked for this time period';
  END IF;
END//
DELIMITER ;

-- Insert some sample data
INSERT INTO rooms (name, capacity, location, description) VALUES
('Conference Room A', 20, 'Building 1, Floor 2', 'Large conference room with projector and whiteboard'),
('Meeting Room B', 8, 'Building 1, Floor 3', 'Small meeting room with TV'),
('Auditorium', 100, 'Building 2, Floor 1', 'Large auditorium with stage and AV equipment');

-- Insert a sample admin user (password: admin123)
INSERT INTO users (username, password, email, full_name, role) VALUES
('admin', '$2a$10$JNrXYFvhBOXH5rAtI1mKEejQ4ORQeSctZoY38J5C0WKGRbiS5ktx2', 'admin@example.com', 'Admin User', 'admin');
