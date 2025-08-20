const express = require('express');
const router = express.Router();
const DoctorPayment = require('../models/doctorPayment.model');
const axios = require('axios');
require('dotenv').config();

router.post('/', async (req, res) => {
  try {
    const { doctorName, paymentAmount, dateFilter, customDateRange } = req.body;
    const [appointmentsResponse, testOrdersResponse] = await Promise.all([
      axios.get(`${process.env.API_BASE_URL}/appointments?doctorName=${doctorName}`),
      axios.get(`${process.env.API_BASE_URL}/testorders?doctorName=${doctorName}`),
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
      return res.status(400).json({ message: 'Payment cannot exceed total revenue' });
    }

    let payment = await DoctorPayment.findOne({ doctorName, dateFilter });
    if (payment) {
      payment.paymentAmount = paymentAmount;
      payment.dueAmount = dueAmount;
      payment.totalAmount = totalRevenue; // Store total revenue
      payment.customDateRange = customDateRange;
      payment.createdAt = Date.now();
      await payment.save();
    } else {
      payment = new DoctorPayment({
        doctorName,
        paymentAmount,
        dueAmount,
        totalAmount: totalRevenue,
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