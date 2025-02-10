const admin = require('firebase-admin');
const db = admin.firestore();

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { name, totalBookingAmount, isInterState, items } = req.body;

    if (!name || !totalBookingAmount || !items) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bookingData = {
      name,
      totalBookingAmount,
      isInterState: isInterState || false,
      items,
      status: 'pending',
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const bookingRef = await db.collection('bookings').add(bookingData);
    
    res.status(201).json({
      id: bookingRef.id,
      ...bookingData
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Get all bookings for authenticated user
exports.getAllBookings = async (req, res) => {
  try {
    const bookingsSnapshot = await db
      .collection('bookings')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(bookings);
  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get a specific booking
exports.getBooking = async (req, res) => {
  try {
    const bookingDoc = await db.collection('bookings').doc(req.params.bookingId).get();
    
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = bookingDoc.data();
    if (bookingData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access to booking' });
    }

    res.json({
      id: bookingDoc.id,
      ...bookingData
    });
  } catch (error) {
    console.error('Get Booking Error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const bookingRef = db.collection('bookings').doc(req.params.bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (bookingDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access to booking' });
    }

    await bookingRef.update({ status });
    
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};
