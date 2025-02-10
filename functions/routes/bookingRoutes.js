const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  createBooking,
  getAllBookings,
  getBooking,
  updateBookingStatus
} = require('../controllers/bookingController');

// Apply authentication middleware to all booking routes
router.use(authenticateUser);

// Group: Booking Management
router.route('/')
  .post(createBooking)    // Create new booking
  .get(getAllBookings);   // Get all bookings

// Group: Single Booking Operations
router.route('/:bookingId')
  .get(getBooking);      // Get single booking

// Group: Booking Status Management
router.route('/:bookingId/status')
  .patch(updateBookingStatus);  // Update booking status

module.exports = router;
