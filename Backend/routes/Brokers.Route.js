const express = require("express");
const { BrokerModel } = require("../models/Brokers.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const router = express.Router();

// Get all brokers
router.get("/", async (req, res) => {
  try {
    const brokers = await BrokerModel.find();
    res.status(200).send(brokers);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

// Get broker by ID
router.get("/:id", async (req, res) => {
  try {
    const broker = await BrokerModel.findById(req.params.id);
    if (!broker) {
      return res.status(404).send({ message: "Broker not found" });
    }
    res.status(200).send(broker);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

// Register new broker
router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const broker = await BrokerModel.findOne({ email });
    if (broker) {
      return res.send({
        message: "Broker already exists",
        id: broker.brokerID,
      });
    }
    
    // Generate unique broker ID if not provided
    if (!req.body.brokerID) {
      const latestBroker = await BrokerModel.findOne().sort({ brokerID: -1 });
      req.body.brokerID = latestBroker ? latestBroker.brokerID + 1 : 1000;
    }
    
    const newBroker = new BrokerModel(req.body);
    await newBroker.save();
    res.status(201).send({ 
      message: "Broker registered successfully", 
      broker: newBroker
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong during registration" });
  }
});

// Login route for brokers
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const broker = await BrokerModel.findOne({ email, password });

    if (broker) {
      const token = jwt.sign({ id: broker._id, userType: "broker" }, process.env.key, {
        expiresIn: "24h",
      });
      res.send({
        message: "Login Successful",
        user: broker,
        token: token,
      });
    } else {
      res.status(401).send({ message: "Wrong credentials, Please try again." });
    }
  } catch (error) {
    console.log({ message: "Error occurred, unable to Login." });
    console.log(error);
    res.status(400).send({ error: "Something went wrong during login" });
  }
});

// Update broker information
router.patch("/:brokerId", async (req, res) => {
  const id = req.params.brokerId;
  const payload = req.body;
  try {
    const updatedBroker = await BrokerModel.findByIdAndUpdate(
      id, 
      payload, 
      { new: true } // Return updated document
    );
    
    if (!updatedBroker) {
      return res.status(404).send({ message: `Broker with id ${id} not found` });
    }
    
    res.status(200).send({ 
      message: `Broker with id ${id} updated successfully`,
      broker: updatedBroker 
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to update." });
  }
});

// Delete broker
router.delete("/:brokerId", async (req, res) => {
  const id = req.params.brokerId;
  try {
    const broker = await BrokerModel.findByIdAndDelete(id);
    if (!broker) {
      return res.status(404).send({ message: `Broker with id ${id} not found` });
    }
    res.status(200).send({ message: `Broker with id ${id} deleted successfully` });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to delete." });
  }
});

// Get broker's statistics
router.get("/stats/:brokerId", async (req, res) => {
  const id = req.params.brokerId;
  try {
    const broker = await BrokerModel.findById(id);
    if (!broker) {
      return res.status(404).send({ message: `Broker with id ${id} not found` });
    }
    
    // You could add more complex aggregation here as needed
    const stats = {
      totalReferrals: broker.referrals,
      totalCommission: broker.totalCommission,
      status: broker.status,
      avgCommissionPerReferral: broker.referrals > 0 ? 
        (broker.totalCommission / broker.referrals).toFixed(2) : 0
    };
    
    res.status(200).send(stats);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

module.exports = router;