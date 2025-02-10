const admin = require('firebase-admin');
const db = admin.firestore();

// Get all invoices for authenticated user
exports.getAllInvoices = async (req, res) => {
  try {
    const invoicesSnapshot = await db
      .collection('invoices')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const invoices = [];
    invoicesSnapshot.forEach(doc => {
      invoices.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(invoices);
  } catch (error) {
    console.error('Get Invoices Error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Get a specific invoice
exports.getInvoice = async (req, res) => {
  try {
    const invoiceDoc = await db.collection('invoices').doc(req.params.invoiceId).get();
    
    if (!invoiceDoc.exists) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoiceData = invoiceDoc.data();
    if (invoiceData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access to invoice' });
    }

    res.json({
      id: invoiceDoc.id,
      ...invoiceData
    });
  } catch (error) {
    console.error('Get Invoice Error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};
