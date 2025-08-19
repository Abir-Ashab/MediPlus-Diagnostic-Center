const express = require('express');
const router = express.Router();
const DoctorPayment = require('../models/doctorPayment.model');
const axios = require('axios');

// POST: Save or update payment for a doctor
router.post('/', async (req, res) => {
  try {
    const { doctorName, paymentAmount, dateFilter, customDateRange } = req.body;

    // Fetch records to calculate total revenue
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

    // Find existing payment record
    let payment = await DoctorPayment.findOne({ doctorName, dateFilter });
    let previousPayment = 0;
    
    if (payment) {
      previousPayment = payment.paymentAmount || 0;
    }

    // Calculate new cumulative payment amount
    const newCumulativePayment = paymentAmount;
    const dueAmount = Math.max(totalRevenue - newCumulativePayment, 0);

    // Validate that total cumulative payment doesn't exceed total revenue
    if (newCumulativePayment > totalRevenue) {
      return res.status(400).json({ 
        message: `Payment amount ${newCumulativePayment} cannot exceed total revenue ${totalRevenue}. Current due: ${Math.max(totalRevenue - previousPayment, 0)}` 
      });
    }

    if (payment) {
      payment.paymentAmount = newCumulativePayment;
      payment.dueAmount = dueAmount;
      payment.totalAmount = totalRevenue;
      payment.customDateRange = customDateRange;
      payment.createdAt = Date.now();
      await payment.save();
    } else {
      payment = new DoctorPayment({
        doctorName,
        paymentAmount: newCumulativePayment,
        dueAmount,
        totalAmount: totalRevenue,
        dateFilter,
        customDateRange,
      });
      await payment.save();
    }

    res.status(200).json({
      ...payment.toObject(),
      message: `Payment updated. Previous: ${previousPayment}, New: ${newCumulativePayment}, Due: ${dueAmount}`
    });
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({ message: 'Failed to save payment', error: error.message });
  }
});

// POST: Add additional payment (cumulative)
router.post('/add', async (req, res) => {
  try {
    const { doctorName, additionalPayment, dateFilter, customDateRange } = req.body;

    // Find existing payment record
    let payment = await DoctorPayment.findOne({ doctorName, dateFilter });
    
    if (!payment) {
      return res.status(404).json({ message: 'No existing payment record found. Please create initial payment first.' });
    }

    const previousPayment = payment.paymentAmount || 0;
    const newCumulativePayment = previousPayment + Number(additionalPayment);
    const totalRevenue = payment.totalAmount || 0;
    const dueAmount = Math.max(totalRevenue - newCumulativePayment, 0);

    // Validate that total cumulative payment doesn't exceed total revenue
    if (newCumulativePayment > totalRevenue) {
      return res.status(400).json({ 
        message: `Total payment ${newCumulativePayment} cannot exceed total revenue ${totalRevenue}. Maximum additional payment allowed: ${Math.max(totalRevenue - previousPayment, 0)}` 
      });
    }

    payment.paymentAmount = newCumulativePayment;
    payment.dueAmount = dueAmount;
    payment.customDateRange = customDateRange;
    payment.createdAt = Date.now();
    await payment.save();

    res.status(200).json({
      ...payment.toObject(),
      message: `Additional payment added. Previous: ${previousPayment}, Added: ${additionalPayment}, New Total: ${newCumulativePayment}, Due: ${dueAmount}`
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Failed to add payment', error: error.message });
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

module.exports = router;