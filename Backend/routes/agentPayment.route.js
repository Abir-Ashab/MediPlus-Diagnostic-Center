const express = require('express');
const router = express.Router();
const AgentPayment = require('../models/agentPayment.model');
const axios = require('axios');

// POST: Save or update payment for a agent
router.post('/', async (req, res) => {
  try {
    const { agentName, paymentAmount, dateFilter, customDateRange } = req.body;

    // Fetch records to calculate total revenue
    const testOrdersResponse = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders?agentName=${agentName}`);

    const agentTestOrders = testOrdersResponse.data.filter((order) => order.agentName === agentName);
    const formattedTestOrders = agentTestOrders.map((order) => ({
      agentRevenue: order.agentRevenue || 0,
    }));

    const totalRevenue = formattedTestOrders.reduce((sum, record) => sum + Number(record.agentRevenue), 0);
    const dueAmount = totalRevenue - paymentAmount;

    if (paymentAmount > totalRevenue) {
      return res.status(400).json({ message: 'Payment cannot exceed total revenue' });
    }

    let payment = await AgentPayment.findOne({ agentName, dateFilter });
    if (payment) {
      payment.paymentAmount = paymentAmount;
      payment.dueAmount = dueAmount;
      payment.totalAmount = totalRevenue;
      payment.customDateRange = customDateRange;
      payment.createdAt = Date.now();
      await payment.save();
    } else {
      payment = new AgentPayment({
        agentName,
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

// GET: Retrieve payments for a agent
router.get('/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { dateFilter } = req.query;
    const query = { agentName };
    if (dateFilter) query.dateFilter = dateFilter;

    const payments = await AgentPayment.find(query);
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

module.exports = router;