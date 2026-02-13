const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// GET /rooms - Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.getAll();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /rooms/available - Get available rooms for a specific time period
router.get('/available', isAuthenticated, async (req, res) => {
  try {
    const { start_time, end_time } = req.query;

    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'Start time and end time are required' });
    }

    const rooms = await Room.getAvailable(start_time, end_time);
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /rooms/:id - Get a room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.getById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error(`Error fetching room with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /rooms - Create a new room (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, capacity, location, description } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ error: 'Name and capacity are required' });
    }

    const room = await Room.create({ name, capacity, location, description });
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /rooms/:id - Update a room (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, capacity, location, description } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ error: 'Name and capacity are required' });
    }

    const room = await Room.update(req.params.id, { name, capacity, location, description });
    res.json(room);
  } catch (error) {
    console.error(`Error updating room with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /rooms/:id - Delete a room (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await Room.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting room with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
