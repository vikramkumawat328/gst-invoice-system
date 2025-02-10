const axios = require('axios');

// GST rate constants
const GST_RATE = 0.18; // 18%
const SGST_RATE = 0.09; // 9%
const CGST_RATE = 0.09; // 9%

// Calculate GST components
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

// Submit to GST API
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

// Generate invoice number
const generateInvoiceNumber = () => {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate GST preview
exports.calculateGSTPreview = async (req, res) => {
  try {
    const { amount, isInterState } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const gstComponents = calculateGST(amount, isInterState || false);
    res.json(gstComponents);
  } catch (error) {
    console.error('Calculate GST Error:', error);
    res.status(500).json({ error: 'Failed to calculate GST' });
  }
};

module.exports = {
  calculateGST,
  submitToGSTAPI,
  generateInvoiceNumber,
  calculateGSTPreview
};
