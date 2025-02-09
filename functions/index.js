const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
require('dotenv').config();

admin.initializeApp();

// GST rate constants
const GST_RATE = 0.18; // 18%
const SGST_RATE = 0.09; // 9%
const CGST_RATE = 0.09; // 9%

/**
 * Calculate GST components based on booking amount and state
 * @param {number} amount - Total booking amount
 * @param {boolean} isInterState - Whether the transaction is inter-state
 * @returns {Object} GST components
 */
const calculateGST = (amount, isInterState) => {
  if (isInterState) {
    return {
      igst: amount * GST_RATE,
      sgst: 0,
      cgst: 0,
      totalGST: amount * GST_RATE
    };
  }
  
  const sgst = amount * SGST_RATE;
  const cgst = amount * CGST_RATE;
  
  return {
    igst: 0,
    sgst,
    cgst,
    totalGST: sgst + cgst
  };
};

/**
 * Submit GST details to external API
 * @param {Object} gstData - GST calculation details
 * @returns {Promise} API response
 */
const submitToGSTAPI = async (gstData) => {
  try {
    const response = await axios.post(process.env.GST_API_ENDPOINT, gstData, {
      headers: {
        'Authorization': `Bearer ${process.env.GST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('GST API Error:', error);
    throw error;
  }
};

/**
 * Generate invoice number
 * @returns {string} Unique invoice number
 */
const generateInvoiceNumber = () => {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Cloud Function triggered on booking document status change
exports.processGSTInvoice = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    
    // Only process if status changed to 'finished'
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
        
        // Store invoice in Firestore
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
