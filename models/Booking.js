const { pool } = require('../config/database');

class Booking {
  // Get all bookings
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT b.*, r.name as room_name, u.username as user_username
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN users u ON b.user_id = u.id
        ORDER BY b.start_time
      `);
      return rows;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  // Get a booking by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT b.*, r.name as room_name, u.username as user_username
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      throw error;
    }
  }

  // Get bookings for a specific room
  static async getByRoomId(roomId) {
    try {
      const [rows] = await pool.query(`
        SELECT b.*, r.name as room_name, u.username as user_username
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN users u ON b.user_id = u.id
        WHERE b.room_id = ?
        ORDER BY b.start_time
      `, [roomId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching bookings for room ID ${roomId}:`, error);
      throw error;
    }
  }

  // Get bookings for a specific user
  static async getByUserId(userId) {
    try {
      const [rows] = await pool.query(`
        SELECT b.*, r.name as room_name, u.username as user_username
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN users u ON b.user_id = u.id
        WHERE b.user_id = ?
        ORDER BY b.start_time
      `, [userId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching bookings for user ID ${userId}:`, error);
      throw error;
    }
  }

  // Get bookings for a specific time period
  static async getByTimeRange(startTime, endTime) {
    try {
      const [rows] = await pool.query(`
        SELECT b.*, r.name as room_name, u.username as user_username
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN users u ON b.user_id = u.id
        WHERE 
          (b.start_time BETWEEN ? AND ?)
          OR (b.end_time BETWEEN ? AND ?)
          OR (b.start_time <= ? AND b.end_time >= ?)
        ORDER BY b.start_time
      `, [startTime, endTime, startTime, endTime, startTime, endTime]);
      return rows;
    } catch (error) {
      console.error('Error fetching bookings by time range:', error);
      throw error;
    }
  }

  // Create a new booking
  static async create(bookingData) {
    try {
      const { room_id, user_id, title, description, start_time, end_time, status = 'pending' } = bookingData;

      // Check if the room is available for the requested time
      const isAvailable = await this.isRoomAvailable(room_id, start_time, end_time);

      if (!isAvailable) {
        throw new Error('Room is not available for the requested time period');
      }

      // Format datetime values to MySQL format (YYYY-MM-DD HH:MM:SS)
      const formattedStartTime = new Date(start_time).toISOString().slice(0, 19).replace('T', ' ');
      const formattedEndTime = new Date(end_time).toISOString().slice(0, 19).replace('T', ' ');

      const [result] = await pool.query(
        'INSERT INTO bookings (room_id, user_id, title, description, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [room_id, user_id, title, description, formattedStartTime, formattedEndTime, status]
      );

      return { id: result.insertId, ...bookingData };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Update a booking
  static async update(id, bookingData) {
    try {
      const { room_id, user_id, title, description, start_time, end_time, status } = bookingData;

      // If changing time or room, check availability
      if (room_id && (start_time || end_time)) {
        const currentBooking = await this.getById(id);
        const checkStartTime = start_time || currentBooking.start_time;
        const checkEndTime = end_time || currentBooking.end_time;
        const checkRoomId = room_id || currentBooking.room_id;

        // Only check availability if different from current booking
        if (checkRoomId !== currentBooking.room_id || 
            checkStartTime !== currentBooking.start_time || 
            checkEndTime !== currentBooking.end_time) {
          const isAvailable = await this.isRoomAvailable(checkRoomId, checkStartTime, checkEndTime, id);

          if (!isAvailable) {
            throw new Error('Room is not available for the requested time period');
          }
        }
      }

      // Format datetime values to MySQL format (YYYY-MM-DD HH:MM:SS)
      let formattedStartTime = start_time;
      let formattedEndTime = end_time;

      if (start_time) {
        formattedStartTime = new Date(start_time).toISOString().slice(0, 19).replace('T', ' ');
      }

      if (end_time) {
        formattedEndTime = new Date(end_time).toISOString().slice(0, 19).replace('T', ' ');
      }

      await pool.query(
        'UPDATE bookings SET room_id = ?, user_id = ?, title = ?, description = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?',
        [room_id, user_id, title, description, formattedStartTime, formattedEndTime, status, id]
      );

      return { id, ...bookingData };
    } catch (error) {
      console.error(`Error updating booking with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a booking
  static async delete(id) {
    try {
      await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting booking with ID ${id}:`, error);
      throw error;
    }
  }

  // Check if a room is available for a specific time period
  static async isRoomAvailable(roomId, startTime, endTime, excludeBookingId = null) {
    try {
      // Format datetime values to MySQL format (YYYY-MM-DD HH:MM:SS)
      const formattedStartTime = new Date(startTime).toISOString().slice(0, 19).replace('T', ' ');
      const formattedEndTime = new Date(endTime).toISOString().slice(0, 19).replace('T', ' ');

      let query = `
        SELECT COUNT(*) as count
        FROM bookings
        WHERE room_id = ?
        AND status != 'cancelled'
        AND (
          (? BETWEEN start_time AND end_time)
          OR (? BETWEEN start_time AND end_time)
          OR (? <= start_time AND ? >= end_time)
        )
      `;

      const params = [roomId, formattedStartTime, formattedEndTime, formattedStartTime, formattedEndTime];

      // Exclude the current booking if updating
      if (excludeBookingId) {
        query += ' AND id != ?';
        params.push(excludeBookingId);
      }

      const [rows] = await pool.query(query, params);
      return rows[0].count === 0;
    } catch (error) {
      console.error('Error checking room availability:', error);
      throw error;
    }
  }
}

module.exports = Booking;
