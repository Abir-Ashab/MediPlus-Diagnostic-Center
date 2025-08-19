const express = require('express');
const router = express.Router();
const DoctorPayment = require('../models/doctorPayment.model');
const axios = require('axios');

// POST: Save or update payment for a doctor
router.post('/', async (req, res) => {
  try {
    const { doctorName, paymentAmount, dateFilter, customDateRange } = req.body;

    // Validate input
    if (!doctorName || !dateFilter || paymentAmount < 0) {
      return res.status(400).json({ message: 'Invalid input: doctorName, dateFilter, and non-negative paymentAmount are required' });
    }

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
    const initialTotalRevenue = combinedRecords.reduce((sum, record) => sum + Number(record.doctorRevenue), 0);

    // Find existing payment record
    let payment = await DoctorPayment.findOne({ doctorName, dateFilter });

    if (payment) {
      // Accumulate payment
      const newPaymentAmount = payment.paymentAmount + Number(paymentAmount);
      const dueAmount = initialTotalRevenue - newPaymentAmount;

      if (dueAmount < 0) {
        return res.status(400).json({ message: 'Total payment cannot exceed initial total revenue' });
      }

      // Update existing record
      payment.paymentAmount = newPaymentAmount;
      payment.dueAmount = dueAmount;
      payment.totalAmount = dueAmount; // Store due amount as totalAmount
      payment.customDateRange = customDateRange || payment.customDateRange;
      payment.createdAt = Date.now();
      await payment.save();
    } else {
      // Create new record
      const dueAmount = initialTotalRevenue - paymentAmount;

      if (dueAmount < 0) {
        return res.status(400).json({ message: 'Payment cannot exceed initial total revenue' });
      }

      payment = new DoctorPayment({
        doctorName,
        paymentAmount,
        dueAmount,
        totalAmount: dueAmount, // Store due amount as totalAmount
        dateFilter,
        customDateRange,
      });
      await payment.save();
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({ message: 'Failed to save payment' });
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