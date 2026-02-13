require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const moment = require('moment');
const fetch = require('node-fetch');
const { testConnection } = require('./config/database');
const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Make moment available to all views
app.locals.moment = moment;

// Make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Import routes
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');

// Use routes
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Room Booking System',
    user: req.session.user
  });
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).render('error', { 
      title: 'Access Denied',
      message: 'You do not have permission to access this page.',
      user: req.session.user
    });
  }
};

// Dashboard route (authenticated users only)
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard',
    user: req.session.user
  });
});

// Rooms route
app.get('/rooms', isAuthenticated, async (req, res) => {
  res.render('rooms', { 
    title: 'Available Rooms',
    user: req.session.user
  });
});

// Room detail route
app.get('/rooms/:id', isAuthenticated, async (req, res) => {
  try {
    const roomId = req.params.id;
    const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/rooms/${roomId}`);

    if (!response.ok) {
      return res.status(404).render('error', { 
        title: 'Room Not Found',
        message: 'The requested room could not be found.',
        user: req.session.user
      });
    }

    const room = await response.json();

    res.render('room-detail', { 
      title: room.name,
      room,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'An error occurred while fetching room details.',
      user: req.session.user
    });
  }
});

// Bookings route
app.get('/bookings', isAuthenticated, (req, res) => {
  res.render('bookings', { 
    title: 'My Bookings',
    user: req.session.user
  });
});

// Profile route
app.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { 
    title: 'My Profile',
    user: req.session.user,
    error: null,
    success: null
  });
});

// Admin routes
app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin-dashboard', { 
    title: 'Admin Dashboard',
    user: req.session.user
  });
});

app.get('/admin/rooms', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin-rooms', { 
    title: 'Manage Rooms',
    user: req.session.user
  });
});

app.get('/admin/users', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin-users', { 
    title: 'Manage Users',
    user: req.session.user
  });
});

app.get('/admin/bookings', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin-bookings', { 
    title: 'Manage Bookings',
    user: req.session.user
  });
});

// Login route
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { 
    title: 'Login',
    error: null
  });
});

// Register route
app.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('register', { 
    title: 'Register',
    error: null
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Test database connection
  await testConnection();
});
