const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

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

// GET /bookings - Get all bookings (admin) or user's bookings (user)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let bookings;
    
    // Admin can see all bookings, users can only see their own
    if (req.session.user.role === 'admin') {
      bookings = await Booking.getAll();
    } else {
      bookings = await Booking.getByUserId(req.session.user.id);
    }
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /bookings/:id - Get a booking by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.getById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user is authorized to view this booking
    if (req.session.user.role !== 'admin' && booking.user_id !== req.session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error(`Error fetching booking with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /bookings/room/:roomId - Get bookings for a specific room
router.get('/room/:roomId', isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.getByRoomId(req.params.roomId);
    res.json(bookings);
  } catch (error) {
    console.error(`Error fetching bookings for room ID ${req.params.roomId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /bookings/user/:userId - Get bookings for a specific user (admin only)
router.get('/user/:userId', isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.getByUserId(req.params.userId);
    res.json(bookings);
  } catch (error) {
    console.error(`Error fetching bookings for user ID ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /bookings/time-range - Get bookings for a specific time period
router.get('/time-range', isAuthenticated, async (req, res) => {
  try {
    const { start_time, end_time } = req.query;
    
    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'Start time and end time are required' });
    }
    
    const bookings = await Booking.getByTimeRange(start_time, end_time);
    
    // Filter bookings for non-admin users
    if (req.session.user.role !== 'admin') {
      const filteredBookings = bookings.filter(booking => booking.user_id === req.session.user.id);
      return res.json(filteredBookings);
    }
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings by time range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /bookings - Create a new booking
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { room_id, title, description, start_time, end_time, status } = req.body;
    
    if (!room_id || !title || !start_time || !end_time) {
      return res.status(400).json({ error: 'Room ID, title, start time, and end time are required' });
    }
    
    // Set user_id to the current user's ID
    const user_id = req.session.user.id;
    
    const booking = await Booking.create({ 
      room_id, 
      user_id, 
      title, 
      description, 
      start_time, 
      end_time, 
      status 
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error.message === 'Room is not available for the requested time period') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /bookings/:id - Update a booking
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { room_id, title, description, start_time, end_time, status } = req.body;
    
    if (!room_id || !title || !start_time || !end_time) {
      return res.status(400).json({ error: 'Room ID, title, start time, and end time are required' });
    }
    
    // Get the booking to check ownership
    const existingBooking = await Booking.getById(req.params.id);
    
    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user is authorized to update this booking
    if (req.session.user.role !== 'admin' && existingBooking.user_id !== req.session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Use the existing user_id
    const user_id = existingBooking.user_id;
    
    const booking = await Booking.update(req.params.id, { 
      room_id, 
      user_id, 
      title, 
      description, 
      start_time, 
      end_time, 
      status 
    });
    
    res.json(booking);
  } catch (error) {
    console.error(`Error updating booking with ID ${req.params.id}:`, error);
    
    if (error.message === 'Room is not available for the requested time period') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /bookings/:id - Delete a booking
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    // Get the booking to check ownership
    const existingBooking = await Booking.getById(req.params.id);
    
    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user is authorized to delete this booking
    if (req.session.user.role !== 'admin' && existingBooking.user_id !== req.session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await Booking.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting booking with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;