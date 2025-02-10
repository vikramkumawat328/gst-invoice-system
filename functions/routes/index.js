const express = require('express');
const router = express.Router();
const bookingRoutes = require('./bookingRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const gstRoutes = require('./gstRoutes');

// API Routes
router.use('/api/v1/bookings', bookingRoutes);
router.use('/api/v1/invoices', invoiceRoutes);
router.use('/api/v1/gst', gstRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle 404 for API routes
router.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = router;
