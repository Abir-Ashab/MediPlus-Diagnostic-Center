const express = require('express');
const router = express.Router();
const DoctorPayment = require('../models/doctorPayment.model');
const axios = require('axios');

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

    // Calculate totalRevenue
    const [appointmentsResponse, testOrdersResponse] = await Promise.all([
      axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments?doctorName=${doctorName}`),
      axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders?doctorName=${doctorName}`),
    ]);

    const doctorTestOrders = testOrdersResponse.data.filter((order) => order.doctorName === doctorName);
    const formattedTestOrders = doctorTestOrders.map((order) => ({
      doctorRevenue: order.doctorRevenue || 0,
    }));

    const formattedAppointments = appointmentsResponse.data.map((appointment) => ({
      doctorRevenue: appointment.doctorRevenue || 0,
    }));

    const combinedRecords = [...formattedAppointments, ...formattedTestOrders];
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
    payment.paymentAmount += paymentAmount; // Accumulate payments
    payment.dueAmount -= paymentAmount; // Subtract from current dueAmount
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

// DELETE: Delete payment for a doctor (optional)
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