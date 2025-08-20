const express = require('express');
const router = express.Router();
const BrokerPayment = require('../models/brokerPayment.model');
const TestOrderModel = require('../models/TestOrder');
const axios = require('axios');

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

// PATCH: Initialize broker revenue for existing orders (one-time migration)
router.patch('/initialize-broker-revenue', async (req, res) => {
  try {
    // This route can be called once to initialize brokerRevenue for existing orders
    const testOrders = await TestOrderModel.find({ 
      brokerName: { $exists: true, $ne: null, $ne: "" },
      $or: [
        { brokerRevenue: { $exists: false } },
        { brokerRevenue: null },
        { brokerRevenue: 0 }
      ]
    });

    console.log(`Found ${testOrders.length} orders to initialize`);

    // Commission percentages (same as frontend)
    const commissionPercentages = {
      VACCINATION: 20,
      HORMONE: 20,
      HISTOPATHOLOGY: 50,
      XRAY: 30,
      CARDIAC: 30,
      ULTRASOUND: 20,
      OTHERS: 50,
      HAEMATOLOGY: 50,
      IMMUNOLOGY: 0,
      CANCER_MARKER: 0,
      BIOCHEMICAL: 0,
      MICROBIOLOGY: 0,
      HEPATITIS: 0,
      URINE: 0,
      CARDIOLOGY: 0,
      STOOL: 0
    };

    const getTestCategory = (testName) => {
      if (!testName) return 'HISTOPATHOLOGY';
      const lowerName = testName.toLowerCase();
      if (lowerName.includes('vaccine')) return 'VACCINATION';
      if (lowerName.includes('echo')) return 'CARDIAC';
      if (lowerName.includes('ecg') || lowerName.includes('e.c.g') || lowerName.includes('e.t.t-stress')) return 'CARDIAC';
      if (lowerName.includes('x-ray') || lowerName.includes('p/a view') || lowerName.includes('b/v') || lowerName.includes('lat.') || lowerName.includes('p.n.s.') || lowerName.includes('opg') || lowerName.includes('ba-') || lowerName.includes('ivu') || lowerName.includes('retrograde')) return 'XRAY';
      if (lowerName.includes('usg') || lowerName.includes('kub') || lowerName.includes('abdomen') || lowerName.includes('pelvic') || lowerName.includes('hbs') || lowerName.includes('genito-urinary')) return 'ULTRASOUND';
      if (lowerName.includes('thyroid') || lowerName.includes('t3') || lowerName.includes('t4') || lowerName.includes('ft3') || lowerName.includes('ft4') || lowerName.includes('tsh') || lowerName.includes('prolactin') || lowerName.includes('estradiol') || lowerName.includes('lh') || lowerName.includes('progesterone') || lowerName.includes('fsh') || lowerName.includes('testosterone') || lowerName.includes('cortisol') || lowerName.includes('growth hormone') || lowerName.includes('hba1c') || lowerName.includes('vitamin d') || lowerName.includes('ca-')) return 'HORMONE';
      return 'HISTOPATHOLOGY';
    };

    let updatedCount = 0;
    
    for (const order of testOrders) {
      let brokerRev = 0;
      
      (order.tests || []).forEach(test => {
        const cat = getTestCategory(test.testName);
        const perc = (cat === 'CARDIAC' && ['ECHOCARDIOGRAM-2D & M-MODE', 'Video Endoscopy'].includes(test.testName)) 
          ? 20 
          : commissionPercentages[cat] || 0;
        
        if (perc > 0) {
          brokerRev += (test.testPrice || 0) * (perc / 100);
        }
      });

      if (brokerRev > 0) {
        await TestOrderModel.findByIdAndUpdate(order._id, {
          brokerRevenue: brokerRev,
          hospitalRevenue: (order.totalAmount || 0) - (order.doctorRevenue || 0) - brokerRev
        });
        updatedCount++;
      }
    }

    res.status(200).json({
      message: "Broker revenue initialized successfully",
      totalOrders: testOrders.length,
      updatedOrders: updatedCount
    });

  } catch (error) {
    console.error('Error initializing broker revenue:', error);
    res.status(500).json({ message: 'Failed to initialize broker revenue', error: error.message });
  }
});

module.exports = router;