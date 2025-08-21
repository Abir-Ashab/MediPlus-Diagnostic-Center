const express = require("express");
const { AgentModel } = require("../models/Agents.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const router = express.Router();

// Get all agents
router.get("/", async (req, res) => {
  try {
    const agents = await AgentModel.find();
    res.status(200).send(agents);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

// Get agent by ID
router.get("/:id", async (req, res) => {
  try {
    const agent = await AgentModel.findById(req.params.id);
    if (!agent) {
      return res.status(404).send({ message: "Agent not found" });
    }
    res.status(200).send(agent);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

// Register new agent
router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const agent = await AgentModel.findOne({ email });
    if (agent) {
      return res.send({
        message: "Agent already exists",
        id: agent.agentID,
      });
    }
    
    // Generate unique agent ID if not provided
    if (!req.body.agentID) {
      const latestAgent = await AgentModel.findOne().sort({ agentID: -1 });
      req.body.agentID = latestAgent ? latestAgent.agentID + 1 : 1000;
    }
    
    const newAgent = new AgentModel(req.body);
    await newAgent.save();
    res.status(201).send({ 
      message: "Agent registered successfully", 
      agent: newAgent
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong during registration" });
  }
});

// Login route for agents
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const agent = await AgentModel.findOne({ email, password });

    if (agent) {
      const token = jwt.sign({ id: agent._id, userType: "agent" }, process.env.key, {
        expiresIn: "24h",
      });
      res.send({
        message: "Login Successful",
        user: agent,
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

// Update agent information
router.patch("/:agentId", async (req, res) => {
  const id = req.params.agentId;
  const payload = req.body;
  try {
    const updatedAgent = await AgentModel.findByIdAndUpdate(
      id, 
      payload, 
      { new: true } // Return updated document
    );
    
    if (!updatedAgent) {
      return res.status(404).send({ message: `Agent with id ${id} not found` });
    }
    
    res.status(200).send({ 
      message: `Agent with id ${id} updated successfully`,
      agent: updatedAgent 
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to update." });
  }
});

// Delete agent
router.delete("/:agentId", async (req, res) => {
  const id = req.params.agentId;
  try {
    const agent = await AgentModel.findByIdAndDelete(id);
    if (!agent) {
      return res.status(404).send({ message: `Agent with id ${id} not found` });
    }
    res.status(200).send({ message: `Agent with id ${id} deleted successfully` });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to delete." });
  }
});

// Get agent's statistics
router.get("/stats/:agentId", async (req, res) => {
  const id = req.params.agentId;
  try {
    const agent = await AgentModel.findById(id);
    if (!agent) {
      return res.status(404).send({ message: `Agent with id ${id} not found` });
    }
    
    // You could add more complex aggregation here as needed
    const stats = {
      totalReferrals: agent.referrals,
      totalCommission: agent.totalCommission,
      status: agent.status,
      avgCommissionPerReferral: agent.referrals > 0 ? 
        (agent.totalCommission / agent.referrals).toFixed(2) : 0
    };
    
    res.status(200).send(stats);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

module.exports = router;