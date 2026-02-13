const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Get all users
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT id, username, email, full_name, role, created_at, updated_at FROM users');
      return rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get a user by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id, username, email, full_name, role, created_at, updated_at FROM users WHERE id = ?', 
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  }

  // Get a user by username
  static async getByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching user with username ${username}:`, error);
      throw error;
    }
  }

  // Create a new user
  static async create(userData) {
    try {
      const { username, password, email, full_name, role = 'user' } = userData;

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const [result] = await pool.query(
        'INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, email, full_name, role]
      );

      return { 
        id: result.insertId, 
        username, 
        email, 
        full_name, 
        role 
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update a user
  static async update(id, userData) {
    try {
      const { username, password, email, full_name, role } = userData;

      // If password is provided, hash it
      if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await pool.query(
          'UPDATE users SET username = ?, password = ?, email = ?, full_name = ?, role = ? WHERE id = ?',
          [username, hashedPassword, email, full_name, role, id]
        );
      } else {
        await pool.query(
          'UPDATE users SET username = ?, email = ?, full_name = ?, role = ? WHERE id = ?',
          [username, email, full_name, role, id]
        );
      }

      return { 
        id, 
        username, 
        email, 
        full_name, 
        role 
      };
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a user
  static async delete(id) {
    try {
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }

  // Authenticate a user
  static async authenticate(username, password) {
    try {
      const user = await this.getByUsername(username);

      if (!user) {
        return null;
      }

      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Don't return the password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }

      return null;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }
}

module.exports = User;
