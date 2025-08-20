const express = require('express');
const router = express.Router();
const BrokerPayment = require('../models/brokerPayment.model');
const TestOrderModel = require('../models/TestOrder');
const axios = require('axios');

// POST: Save or update payment for a broker and reduce broker revenue from test orders
router.post('/', async (req, res) => {
  try {
    const { brokerName, paymentAmount, dateFilter, customDateRange } = req.body;

    if (!brokerName || paymentAmount === undefined) {
      return res.status(400).json({ message: "Broker name and payment amount are required" });
    }

    if (paymentAmount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than 0" });
    }

    // Build date query based on filter
    let dateQuery = {};
    const now = new Date();
    
    switch (dateFilter) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        dateQuery.createdAt = { $gte: weekStart, $lte: weekEnd };
        break;
        
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        dateQuery.createdAt = { $gte: monthStart, $lte: monthEnd };
        break;
        
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        dateQuery.createdAt = { $gte: yearStart, $lte: yearEnd };
        break;
        
      case 'custom':
        if (customDateRange && customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          dateQuery.createdAt = { $gte: startDate, $lte: endDate };
        }
        break;
        
      default: // 'all' or any other value
        // No date filter
        break;
    }

    // Find test orders for this broker within the date range
    const query = { 
      brokerName: brokerName,
      brokerRevenue: { $gt: 0 }, // Only orders with pending revenue
      ...dateQuery 
    };

    const testOrders = await TestOrderModel.find(query).sort({ createdAt: 1 });

    if (testOrders.length === 0) {
      return res.status(404).json({ message: "No pending revenue found for this broker in the specified period" });
    }

    // Calculate total pending revenue
    const totalPendingRevenue = testOrders.reduce((sum, order) => sum + (order.brokerRevenue || 0), 0);
    
    if (paymentAmount > totalPendingRevenue) {
      return res.status(400).json({ 
        message: `Payment amount (${paymentAmount}) exceeds pending revenue (${totalPendingRevenue.toFixed(2)})` 
      });
    }

    // Distribute the payment across orders proportionally
    let remainingPayment = paymentAmount;
    const updatedOrders = [];

    for (const order of testOrders) {
      if (remainingPayment <= 0) break;

      const orderRevenue = order.brokerRevenue || 0;
      const paymentForThisOrder = Math.min(remainingPayment, orderRevenue);
      
      const newBrokerRevenue = orderRevenue - paymentForThisOrder;
      const newHospitalRevenue = (order.hospitalRevenue || 0) + paymentForThisOrder;

      // Update the order with payment tracking
      const updatedOrder = await TestOrderModel.findByIdAndUpdate(
        order._id,
        {
          brokerRevenue: newBrokerRevenue,
          hospitalRevenue: newHospitalRevenue,
          lastBrokerPaymentDate: new Date(),
          lastBrokerPaymentAmount: paymentForThisOrder,
          totalBrokerPaymentsMade: (order.totalBrokerPaymentsMade || 0) + paymentForThisOrder,
          $push: {
            brokerPaymentHistory: {
              paymentDate: new Date(),
              paymentAmount: paymentForThisOrder,
              previousRevenue: orderRevenue,
              newRevenue: newBrokerRevenue
            }
          }
        },
        { new: true }
      );

      updatedOrders.push(updatedOrder);
      remainingPayment -= paymentForThisOrder;
    }

    // Calculate final totals for broker payment record
    const finalTotalRevenue = testOrders.reduce((sum, order) => {
      const updatedOrder = updatedOrders.find(u => u._id.toString() === order._id.toString());
      return sum + (updatedOrder ? updatedOrder.brokerRevenue : order.brokerRevenue || 0);
    }, 0);

    const dueAmount = finalTotalRevenue;

    // Save or update broker payment record
    let payment = await BrokerPayment.findOne({ brokerName, dateFilter });
    if (payment) {
      payment.paymentAmount = (payment.paymentAmount || 0) + paymentAmount;
      payment.dueAmount = dueAmount;
      payment.totalAmount = finalTotalRevenue + payment.paymentAmount;
      payment.customDateRange = customDateRange;
      payment.updatedAt = new Date();
      await payment.save();
    } else {
      payment = new BrokerPayment({
        brokerName,
        paymentAmount,
        dueAmount,
        totalAmount: finalTotalRevenue + paymentAmount,
        dateFilter,
        customDateRange,
      });
      await payment.save();
    }

    res.status(200).json({
      message: "Broker payment processed and revenue updated successfully",
      paymentProcessed: paymentAmount,
      ordersUpdated: updatedOrders.length,
      remainingPayment: remainingPayment,
      payment: payment,
      updatedOrders: updatedOrders.map(order => ({
        orderId: order._id,
        patientName: order.patientName,
        previousRevenue: testOrders.find(o => o._id.toString() === order._id.toString())?.brokerRevenue || 0,
        newRevenue: order.brokerRevenue,
        paymentApplied: (testOrders.find(o => o._id.toString() === order._id.toString())?.brokerRevenue || 0) - order.brokerRevenue
      }))
    });

  } catch (error) {
    console.error('Error processing broker payment:', error);
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
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

// GET: Get broker revenue summary
router.get('/summary/:brokerName', async (req, res) => {
  try {
    const { brokerName } = req.params;
    const { dateFilter, customDateRange } = req.query;

    // Build date query
    let dateQuery = {};
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      
      switch (dateFilter) {
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          dateQuery.createdAt = { $gte: weekStart, $lte: weekEnd };
          break;
          
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          dateQuery.createdAt = { $gte: monthStart, $lte: monthEnd };
          break;
          
        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          const yearEnd = new Date(now.getFullYear(), 11, 31);
          yearEnd.setHours(23, 59, 59, 999);
          dateQuery.createdAt = { $gte: yearStart, $lte: yearEnd };
          break;
          
        case 'custom':
          if (customDateRange) {
            const parsedRange = JSON.parse(customDateRange);
            if (parsedRange.start && parsedRange.end) {
              const startDate = new Date(parsedRange.start);
              startDate.setHours(0, 0, 0, 0);
              const endDate = new Date(parsedRange.end);
              endDate.setHours(23, 59, 59, 999);
              dateQuery.createdAt = { $gte: startDate, $lte: endDate };
            }
          }
          break;
      }
    }

    const testOrders = await TestOrderModel.find({ 
      brokerName: brokerName,
      ...dateQuery 
    });

    const totalRevenue = testOrders.reduce((sum, order) => sum + (order.brokerRevenue || 0), 0);
    const totalPayments = testOrders.reduce((sum, order) => sum + (order.totalBrokerPaymentsMade || 0), 0);
    const dueAmount = totalRevenue;

    res.status(200).json({
      brokerName,
      totalRevenue: totalRevenue + totalPayments, // Original total
      totalPayments,
      dueAmount,
      ordersCount: testOrders.length
    });

  } catch (error) {
    console.error('Error fetching broker summary:', error);
    res.status(500).json({ message: 'Failed to fetch broker summary' });
  }
});

module.exports = router;