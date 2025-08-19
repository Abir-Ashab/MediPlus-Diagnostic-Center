const express = require('express');
const router = express.Router();
const DoctorPayment = require('../models/doctorPayment.model');
const axios = require('axios');

// Function to get start and end dates for filter
const getDateRange = (dateFilter, customDateRange) => {
  const now = new Date();
  let start, end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // End of today

  switch (dateFilter) {
    case 'all':
      start = new Date(0);
      break;
    case 'week':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6); // Start of 7 days ago
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      if (!customDateRange || !customDateRange.start || !customDateRange.end) {
        throw new Error('Custom date range required for custom filter');
      }
      start = new Date(customDateRange.start);
      end = new Date(customDateRange.end);
      end.setHours(23, 59, 59, 999); // End of day
      break;
    default:
      throw new Error('Invalid dateFilter');
  }

  return { start, end };
};

// POST: Create a new payment for a doctor
router.post('/', async (req, res) => {
  try {
    const { doctorName, paymentAmount, dateFilter, customDateRange } = req.body;

    // Validate input
    if (!doctorName || !dateFilter || paymentAmount === undefined) {
      return res.status(400).json({ message: 'Missing required fields: doctorName, dateFilter, or paymentAmount' });
    }

    // Check if payment already exists
    const existingPayment = await DoctorPayment.findOne({ doctorName, dateFilter });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment record already exists. Use PATCH to update.' });
    }

    // Get date range for filtering
    const { start, end } = getDateRange(dateFilter, customDateRange);

    // Fetch records
    const [appointmentsResponse, testOrdersResponse] = await Promise.all([
      axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments?doctorName=${doctorName}`),
      axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders?doctorName=${doctorName}`),
    ]);

    const formattedAppointments = appointmentsResponse.data.map((appointment) => ({
      doctorRevenue: appointment.doctorRevenue || 0,
      date: appointment.date,
    }));

    const formattedTestOrders = testOrdersResponse.data.map((order) => ({
      doctorRevenue: order.doctorRevenue || 0,
      date: order.date,
    }));

    const combinedRecords = [...formattedAppointments, ...formattedTestOrders].filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= start && recordDate <= end;
    });

    const totalRevenue = combinedRecords.reduce((sum, record) => sum + Number(record.doctorRevenue), 0);
    const dueAmount = totalRevenue - paymentAmount;

    if (paymentAmount > totalRevenue) {
      return res.status(400).json({ message: `Payment (${paymentAmount} Taka) cannot exceed total revenue (${totalRevenue} Taka)` });
    }

    const payment = new DoctorPayment({
      doctorName,
      paymentAmount,
      dueAmount,
      totalAmount: totalRevenue,
      dateFilter,
      customDateRange,
    });
    await payment.save();

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Failed to create payment' });
  }
});

// PATCH: Update payment for a doctor
router.patch('/:doctorName', async (req, res) => {
  try {
    const { doctorName } = req.params;
    const { paymentAmount, dateFilter, customDateRange } = req.body;

    // Validate input
    if (!doctorName || !dateFilter || paymentAmount === undefined) {
      return res.status(400).json({ message: 'Missing required fields: doctorName, dateFilter, or paymentAmount' });
    }

    // Fetch existing payment record
    const payment = await DoctorPayment.findOne({ doctorName, dateFilter });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found. Use POST to create.' });
    }

    // Validate payment against current dueAmount
    if (paymentAmount > payment.dueAmount) {
      return res.status(400).json({ message: `Payment (${paymentAmount} Taka) cannot exceed due amount (${payment.dueAmount} Taka)` });
    }

    // Update payment
    payment.paymentAmount += paymentAmount;
    payment.dueAmount -= paymentAmount;
    payment.customDateRange = customDateRange || payment.customDateRange;
    payment.createdAt = Date.now();
    await payment.save();

    res.status(200).json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Failed to update payment' });
  }
});

// GET: Retrieve payments for a doctor
router.get('/:doctorName', async (req, res) => {
  try {
    const { doctorName } = req.params;
    const { dateFilter } = req.query;
    const query = { doctorName };
    if (dateFilter) query.dateFilter = dateFilter;

    const payments = await DoctorPayment.find(query);
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// DELETE: Delete payment for a doctor
router.delete('/:doctorName', async (req, res) => {
  try {
    const { doctorName } = req.params;
    const { dateFilter } = req.query;
    const query = { doctorName };
    if (dateFilter) query.dateFilter = dateFilter;

    const result = await DoctorPayment.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.status(200).json({ message: 'Payment record deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Failed to delete payment' });
  }
});

module.exports = router;