const express = require('express');
const router = express.Router();
const DoctorPayment = require('../models/doctorPayment.model');

// POST: Save or update payment for a doctor
router.post('/', async (req, res) => {
  try {
    const { doctorName, paymentAmount, totalAmount, dateFilter, customDateRange } = req.body;
    const dueAmount = totalAmount - paymentAmount;

    // Find existing payment for the doctor and date filter
    let payment = await DoctorPayment.findOne({ doctorName, dateFilter });

    if (payment) {
      // Update existing payment
      payment.paymentAmount = paymentAmount;
      payment.dueAmount = dueAmount;
      payment.totalAmount = totalAmount;
      payment.customDateRange = customDateRange;
      payment.createdAt = Date.now();
      await payment.save();
    } else {
      // Create new payment
      payment = new DoctorPayment({
        doctorName,
        paymentAmount,
        dueAmount,
        totalAmount,
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