const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getAllInvoices,
  getInvoice
} = require('../controllers/invoiceController');


router.use(authenticateUser);


router.route('/')
  .get(getAllInvoices);   // Get all invoices


router.route('/:invoiceId')
  .get(getInvoice);      // Get single invoice

module.exports = router;
