const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { calculateGSTPreview } = require('../controllers/gstController');

// Apply authentication middleware to all GST routes
router.use(authenticateUser);

// Group: GST Calculations
router.route('/calculate')
  .post(calculateGSTPreview);  // Calculate GST preview

module.exports = router;
