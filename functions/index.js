const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Import routes
const routes = require('./routes');

// Import GST controller for Firestore trigger
const { calculateGST, submitToGSTAPI, generateInvoiceNumber } = require('./controllers/gstController');

require('dotenv').config();


const serviceAccount = require('../assignment-ad9dc-firebase-adminsdk-fbsvc-d6d75f6266.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'assignment-ad9dc'
});


const app = express();

// Global Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Register all routes
app.use('/', routes);

// Export the Express app as Firebase Functions
exports.api = functions.https.onRequest(app);

exports.processGSTInvoice = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();    
    
    if (previousData.status !== 'finished' && newData.status === 'finished') {
      const bookingId = context.params.bookingId;
      
      try {
        // Calculate GST components
        const gstComponents = calculateGST(
          newData.totalBookingAmount,
          newData.isInterState || false
        );
        
        // Generate invoice data
        const invoiceData = {
          invoiceNumber: generateInvoiceNumber(),
          bookingId,
          customerName: newData.name,
          totalAmount: newData.totalBookingAmount,
          ...gstComponents,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Submit to GST API
        const gstApiResponse = await submitToGSTAPI(invoiceData);
        
        
        await admin.firestore()
          .collection('invoices')
          .doc(invoiceData.invoiceNumber)
          .set({
            ...invoiceData,
            gstApiResponse
          });
          
        console.log(`Successfully processed GST invoice for booking ${bookingId}`);
        return true;
      } catch (error) {
        console.error(`Error processing GST for booking ${bookingId}:`, error);
        throw error;
      }
    }
    
    return false;
  });
