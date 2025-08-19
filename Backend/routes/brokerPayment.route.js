const express = require('express');
const router = express.Router();
const BrokerPayment = require('../models/brokerPayment.model')
const axios = require('axios');

// POST: Save or update payment for a broker
router.post('/', async (req, res) => {
  try {
    const { brokerName, paymentAmount, dateFilter, customDateRange } = req.body;

    // Fetch records to calculate total revenue
    const testOrdersResponse = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders`);

    const brokerTestOrders = testOrdersResponse.data.filter((order) => order.brokerName === brokerName);
    const formattedTestOrders = brokerTestOrders.map((order) => ({
      brokerRevenue: order.brokerRevenue || 0,
    }));

    const totalRevenue = formattedTestOrders.reduce((sum, record) => sum + Number(record.brokerRevenue), 0);
    const dueAmount = totalRevenue - paymentAmount;

    if (paymentAmount > totalRevenue) {
      return res.status(400).json({ message: 'Payment cannot exceed total revenue' });
    }

    let payment = await BrokerPayment.findOne({ brokerName, dateFilter });
    if (payment) {
      payment.paymentAmount = paymentAmount;
      payment.dueAmount = dueAmount;
      payment.totalAmount = totalRevenue;
      payment.customDateRange = customDateRange;
      payment.createdAt = Date.now();
      await payment.save();
    } else {
      payment = new BrokerPayment({
        brokerName,
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

// GET: Retrieve payments for a broker
router.get('/:brokerName', async (req, res) => {
  try {
    const { brokerName } = req.params;
    const { dateFilter } = req.query;
    const query = { brokerName };
    if (dateFilter) query.dateFilter = dateFilter;

    const payments = await BrokerPayment.find(query);
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

module.exports = router;