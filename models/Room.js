const { pool } = require('../config/database');

class Room {
  // Get all rooms
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM rooms');
      return rows;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }

  // Get a room by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching room with ID ${id}:`, error);
      throw error;
    }
  }

  // Create a new room
  static async create(roomData) {
    try {
      const { name, capacity, location, description } = roomData;
      const [result] = await pool.query(
        'INSERT INTO rooms (name, capacity, location, description) VALUES (?, ?, ?, ?)',
        [name, capacity, location, description]
      );
      return { id: result.insertId, ...roomData };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  // Update a room
  static async update(id, roomData) {
    try {
      const { name, capacity, location, description } = roomData;
      await pool.query(
        'UPDATE rooms SET name = ?, capacity = ?, location = ?, description = ? WHERE id = ?',
        [name, capacity, location, description, id]
      );
      return { id, ...roomData };
    } catch (error) {
      console.error(`Error updating room with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a room
  static async delete(id) {
    try {
      await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting room with ID ${id}:`, error);
      throw error;
    }
  }

  // Get available rooms for a specific time period
  static async getAvailable(startTime, endTime) {
    try {
      const [rows] = await pool.query(`
        SELECT r.* FROM rooms r
        WHERE r.id NOT IN (
          SELECT b.room_id FROM bookings b
          WHERE b.status != 'cancelled'
          AND (
            (? BETWEEN b.start_time AND b.end_time)
            OR (? BETWEEN b.start_time AND b.end_time)
            OR (? <= b.start_time AND ? >= b.end_time)
          )
        )
      `, [startTime, endTime, startTime, endTime]);
      return rows;
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  }
}

module.exports = Room;