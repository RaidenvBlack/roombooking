const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

// POST /users/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, full_name } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }
    
    // Check if username or email already exists
    const existingUser = await User.getByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Create the user with 'user' role
    const user = await User.create({ username, password, email, full_name, role: 'user' });
    
    // Set user session
    req.session.user = user;
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /users/login - Login a user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Authenticate the user
    const user = await User.authenticate(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set user session
    req.session.user = user;
    
    res.json(user);
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /users/logout - Logout a user
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// GET /users/profile - Get current user's profile
router.get('/profile', isAuthenticated, (req, res) => {
  res.json(req.session.user);
});

// PUT /users/profile - Update current user's profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { username, password, email, full_name } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }
    
    // Check if username already exists (if changing username)
    if (username !== req.session.user.username) {
      const existingUser = await User.getByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }
    }
    
    // Update the user
    const user = await User.update(req.session.user.id, { 
      username, 
      password, // If password is not provided, it won't be updated
      email, 
      full_name,
      role: req.session.user.role // Preserve the current role
    });
    
    // Update session
    req.session.user = user;
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users - Get all users (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/:id - Get a user by ID (admin only)
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(`Error fetching user with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /users - Create a new user (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { username, password, email, full_name, role } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }
    
    // Check if username already exists
    const existingUser = await User.getByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Create the user
    const user = await User.create({ username, password, email, full_name, role });
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /users/:id - Update a user (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { username, password, email, full_name, role } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }
    
    // Get the user to check if it exists
    const existingUser = await User.getById(req.params.id);
    
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if username already exists (if changing username)
    if (username !== existingUser.username) {
      const userWithSameUsername = await User.getByUsername(username);
      if (userWithSameUsername) {
        return res.status(409).json({ error: 'Username already exists' });
      }
    }
    
    // Update the user
    const user = await User.update(req.params.id, { username, password, email, full_name, role });
    
    res.json(user);
  } catch (error) {
    console.error(`Error updating user with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /users/:id - Delete a user (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    // Get the user to check if it exists
    const existingUser = await User.getById(req.params.id);
    
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting the last admin
    if (existingUser.role === 'admin') {
      const users = await User.getAll();
      const adminCount = users.filter(user => user.role === 'admin').length;
      
      if (adminCount <= 1) {
        return res.status(409).json({ error: 'Cannot delete the last admin user' });
      }
    }
    
    await User.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting user with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;