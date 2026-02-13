/**
 * Room Booking System - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize Bootstrap popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function(popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Handle logout form submission
  const logoutForm = document.getElementById('logout-form');
  if (logoutForm) {
    logoutForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        const response = await fetch('/api/users/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          window.location.href = '/';
        } else {
          console.error('Logout failed');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    });
  }

  // Format dates using moment.js
  const dateElements = document.querySelectorAll('.format-date');
  dateElements.forEach(element => {
    const date = element.getAttribute('data-date');
    if (date) {
      element.textContent = moment(date).format('MMMM D, YYYY');
    }
  });

  // Format times using moment.js
  const timeElements = document.querySelectorAll('.format-time');
  timeElements.forEach(element => {
    const time = element.getAttribute('data-time');
    if (time) {
      element.textContent = moment(time).format('h:mm A');
    }
  });

  // Format date-times using moment.js
  const dateTimeElements = document.querySelectorAll('.format-datetime');
  dateTimeElements.forEach(element => {
    const datetime = element.getAttribute('data-datetime');
    if (datetime) {
      element.textContent = moment(datetime).format('MMMM D, YYYY h:mm A');
    }
  });

  // Helper function to get status color
  window.getStatusColor = function(status) {
    switch(status) {
      case 'confirmed':
        return '#28a745'; // green
      case 'pending':
        return '#ffc107'; // yellow
      case 'cancelled':
        return '#dc3545'; // red
      default:
        return '#007bff'; // blue
    }
  };

  // Helper function to get status class
  window.getStatusClass = function(status) {
    switch(status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'primary';
    }
  };

  // Add room-card class to room cards
  document.querySelectorAll('.card').forEach(card => {
    if (card.querySelector('.card-title') && card.querySelector('.card-title').textContent.includes('Room')) {
      card.classList.add('room-card');
    }
  });

  // Confirm delete actions
  document.querySelectorAll('.confirm-delete').forEach(button => {
    button.addEventListener('click', function(e) {
      if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });

  // Handle form validation
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
});