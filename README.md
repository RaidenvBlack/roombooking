# Room Booking Web Application

A web-based room booking system with calendar interface that allows users to view, book, and manage room reservations.

## Features

- User authentication (register, login, profile management)
- Room listing and detailed view
- Interactive calendar interface for booking visualization
- Room availability checking
- Booking management (create, view, update, cancel)
- Admin panel for managing rooms, users, and bookings
- Responsive design for desktop and mobile devices

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **View Engine**: EJS (Embedded JavaScript)
- **Database**: MySQL
- **Authentication**: Session-based with bcrypt password hashing
- **Calendar**: FullCalendar.js
- **Date/Time Handling**: Moment.js

## Prerequisites

### For Docker Installation
- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

### For Manual Installation
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm (v6 or higher)

## Database Connection

### Connecting to MySQL Database

This application uses MySQL as its database. pgAdmin 4 is specifically designed for PostgreSQL databases and cannot be used to connect to MySQL databases. Instead, you should use one of the following tools:

#### Option 1: MySQL Workbench (Recommended)
1. Download and install [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
2. Open MySQL Workbench and click on the "+" icon to add a new connection
3. Configure the connection with these details:
   - Connection Name: RoomBooking
   - Connection Method: Standard (TCP/IP)
   - Hostname: localhost (or the Docker container IP if using Docker)
   - Port: 3306
   - Username: roombooking_user
   - Password: roombooking_password
4. Click "Test Connection" to verify it works
5. Save and connect to your database

#### Option 2: phpMyAdmin
1. Install phpMyAdmin on your server or use a pre-packaged solution like XAMPP/MAMP
2. Access phpMyAdmin through your web browser
3. Log in with the database credentials:
   - Server: localhost (or the Docker container IP)
   - Username: roombooking_user
   - Password: roombooking_password
4. You should now see the "roombooking" database in the left sidebar

#### Option 3: Command Line
1. Open a terminal/command prompt
2. Connect to MySQL using:
   ```
   mysql -h localhost -u roombooking_user -p roombooking
   ```
3. Enter the password when prompted: `roombooking_password`

#### Docker Environment Connection
If you're using Docker, you can connect to the MySQL container directly:
```
docker exec -it roombooking-mysql mysql -u roombooking_user -p roombooking
```
Enter the password when prompted: `roombooking_password`

## Installation

### Option 1: Using Docker (Recommended)

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/roombooking.git
   cd roombooking
   ```

2. Start the application and database with Docker Compose:
   ```
   docker-compose up -d --build
   ```

   This will:
   - Build the application container
   - Start a MySQL container
   - Initialize the database with the schema
   - Connect the application to the database

3. Access the application at `http://localhost:3000`

4. If you need to rebuild the containers (e.g., after code changes or if you encounter issues with dependencies):
   ```
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

   Alternatively, you can use the provided script:
   ```
   chmod +x scripts/rebuild-docker.sh
   ./scripts/rebuild-docker.sh
   ```

   To completely reset the database (removing all data including users):
   ```
   ./scripts/rebuild-docker.sh --reset-db
   ```
   or
   ```
   ./scripts/rebuild-docker.sh -r
   ```

   **Note**: If you encounter issues with database tables not being created, the application now includes an automatic database initialization script that will check if the required tables exist and create them if necessary.

5. To stop the containers:
   ```
   docker-compose down
   ```

   To stop the containers and remove the volumes (this will delete all data):
   ```
   docker-compose down -v
   ```

   Alternatively, you can use the provided script to quickly reset the database without rebuilding the containers:
   ```
   chmod +x scripts/reset-db.sh
   ./scripts/reset-db.sh
   ```

### Important Note About Database Persistence

When using Docker, the database data is stored in a Docker volume (`mysql_data`), which persists even when containers are stopped or removed. This means that your database data (including user accounts) will remain intact across container restarts and rebuilds.

If you want to completely reset your database to its initial state (removing all data including users), you need to remove the volume using one of the methods described above:
- `docker-compose down -v`
- `./scripts/reset-db.sh`
- `./scripts/rebuild-docker.sh --reset-db` or `./scripts/rebuild-docker.sh -r`

### Docker Database Management

#### Accessing the MySQL Database

To access the MySQL database running in Docker:

```
docker exec -it roombooking-mysql mysql -uroombooking_user -proombooking_password roombooking
```

#### Backing Up the Database

To create a backup of the database:

```
docker exec roombooking-mysql sh -c 'exec mysqldump -uroombooking_user -proombooking_password roombooking' > backup.sql
```

#### Restoring the Database

To restore the database from a backup:

```
cat backup.sql | docker exec -i roombooking-mysql mysql -uroombooking_user -proombooking_password roombooking
```

### Option 2: Manual Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/roombooking.git
   cd roombooking
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=roombooking

   # Server Configuration
   PORT=3000
   SESSION_SECRET=your_secret_key_here

   # Environment
   NODE_ENV=development
   ```

4. Set up the database:
   - Create a MySQL database named `roombooking`
   - Import the schema from `config/schema.sql`:
     ```
     mysql -u your_mysql_username -p roombooking < config/schema.sql
     ```

5. Start the application:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## Database Documentation

### Raumbuchungssystem: Verwaltung von Räumen und Reservierungen

Fokus: Relationale Modellierung eines Raumbuchungssystems mit Integritätsbedingungen zur Vermeidung von Doppelbuchungen.

• Abbildung von Räumen mit Eigenschaften (Kapazität, Standort), Benutzern mit verschiedenen Berechtigungsstufen und zeitbasierten Raumbuchungen.
• Beispielabfragen:
  – Welche Räume sind in einem bestimmten Zeitraum verfügbar?
  – Welche Buchungen hat ein bestimmter Benutzer vorgenommen?
  – Analyse der Raumauslastung: Welcher Raum wurde im letzten Monat am häufigsten gebucht?

### Database Schema Design

The database uses a relational model with three main entities:

#### Entity-Relationship Diagram

```
+----------------+       +----------------+       +----------------+
|     ROOMS      |       |    BOOKINGS    |       |     USERS      |
+----------------+       +----------------+       +----------------+
| PK id          |<----->| PK id          |<----->| PK id          |
| name           |       | FK room_id     |       | username       |
| capacity       |       | FK user_id     |       | password       |
| location       |       | title          |       | email          |
| description    |       | description    |       | full_name      |
| created_at     |       | start_time     |       | role           |
| updated_at     |       | end_time       |       | created_at     |
|                |       | status         |       | updated_at     |
|                |       | created_at     |       |                |
|                |       | updated_at     |       |                |
+----------------+       +----------------+       +----------------+
```

#### Tables Description

- **rooms**: Stores information about available rooms
  - Primary key: id
  - Fields: name, capacity, location, description, created_at, updated_at

- **users**: Stores user account information
  - Primary key: id
  - Fields: username, password (hashed), email, full_name, role, created_at, updated_at

- **bookings**: Stores room booking information
  - Primary key: id
  - Foreign keys: room_id (references rooms.id), user_id (references users.id)
  - Fields: title, description, start_time, end_time, status, created_at, updated_at

### SQL Implementation

#### Database Schema Creation

```sql
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
```

#### Stored Procedures and Triggers

```sql
-- Add a stored procedure to check for booking conflicts
DELIMITER //
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
CREATE TRIGGER prevent_double_booking BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
  IF booking_conflicts_exist(NEW.room_id, NULL, NEW.start_time, NEW.end_time) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room is already booked for this time period';
  END IF;
END//

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
```

#### Example Data

```sql
-- Insert sample rooms
INSERT INTO rooms (name, capacity, location, description) VALUES
('Conference Room A', 20, 'Building 1, Floor 2', 'Large conference room with projector and whiteboard'),
('Meeting Room B', 8, 'Building 1, Floor 3', 'Small meeting room with TV'),
('Auditorium', 100, 'Building 2, Floor 1', 'Large auditorium with stage and AV equipment');

-- Insert a sample admin user (password: admin123)
INSERT INTO users (username, password, email, full_name, role) VALUES
('admin', '$2a$10$JNrXYFvhBOXH5rAtI1mKEejQ4ORQeSctZoY38J5C0WKGRbiS5ktx2', 'admin@example.com', 'Admin User', 'admin');

-- Insert sample regular users
INSERT INTO users (username, password, email, full_name, role) VALUES
('user1', '$2a$10$JNrXYFvhBOXH5rAtI1mKEejQ4ORQeSctZoY38J5C0WKGRbiS5ktx2', 'user1@example.com', 'Regular User 1', 'user'),
('user2', '$2a$10$JNrXYFvhBOXH5rAtI1mKEejQ4ORQeSctZoY38J5C0WKGRbiS5ktx2', 'user2@example.com', 'Regular User 2', 'user');

-- Insert sample bookings
INSERT INTO bookings (room_id, user_id, title, description, start_time, end_time, status) VALUES
(1, 2, 'Team Meeting', 'Weekly team sync-up', '2023-06-01 10:00:00', '2023-06-01 11:00:00', 'confirmed'),
(2, 3, 'Client Call', 'Discussion with new client', '2023-06-02 14:00:00', '2023-06-02 15:00:00', 'confirmed'),
(3, 2, 'Company Presentation', 'Quarterly results presentation', '2023-06-03 13:00:00', '2023-06-03 15:00:00', 'confirmed');
```

## Default Admin Account

The schema includes a default admin user:
- Username: admin
- Password: admin123

### Accessing the Admin Panel

To access the admin panel:
1. Log in with the admin account (username: admin, password: admin123)
2. After logging in, you'll see an "Admin Panel" section on your dashboard
3. Click on "Go to Admin Dashboard" to access the admin features
4. Alternatively, you can directly navigate to `/admin` after logging in

The admin panel provides access to:
- System statistics
- Room management (add, edit, delete rooms)
- User management (add, edit, delete users)
- Booking management (add, edit, delete bookings)

## API Endpoints

### Rooms

- `GET /api/rooms`: Get all rooms
- `GET /api/rooms/:id`: Get a specific room
- `GET /api/rooms/available`: Get available rooms for a time period
- `POST /api/rooms`: Create a new room (admin only)
- `PUT /api/rooms/:id`: Update a room (admin only)
- `DELETE /api/rooms/:id`: Delete a room (admin only)

### Bookings

- `GET /api/bookings`: Get user's bookings or all bookings (admin)
- `GET /api/bookings/:id`: Get a specific booking
- `GET /api/bookings/room/:roomId`: Get bookings for a specific room
- `GET /api/bookings/time-range`: Get bookings for a specific time period
- `POST /api/bookings`: Create a new booking
- `PUT /api/bookings/:id`: Update a booking
- `DELETE /api/bookings/:id`: Delete a booking

### Users

- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: Login a user
- `POST /api/users/logout`: Logout a user
- `GET /api/users/profile`: Get current user's profile
- `PUT /api/users/profile`: Update current user's profile
- `GET /api/users`: Get all users (admin only)
- `GET /api/users/:id`: Get a specific user (admin only)
- `POST /api/users`: Create a new user (admin only)
- `PUT /api/users/:id`: Update a user (admin only)
- `DELETE /api/users/:id`: Delete a user (admin only)

## Pages

### User Pages
- `/`: Home page
- `/login`: Login page
- `/register`: Registration page
- `/dashboard`: User dashboard
- `/rooms`: Room listing
- `/rooms/:id`: Room detail and booking
- `/bookings`: User's bookings
- `/profile`: User profile management

### Admin Pages
- `/admin`: Admin dashboard with system statistics
- `/admin/rooms`: Room management (add, edit, delete rooms)
- `/admin/users`: User management (add, edit, delete users)
- `/admin/bookings`: Booking management (add, edit, delete bookings)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [Bootstrap](https://getbootstrap.com/)
- [FullCalendar](https://fullcalendar.io/)
- [Moment.js](https://momentjs.com/)
