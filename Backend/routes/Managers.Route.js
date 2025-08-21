const express = require("express");
const { managerModel } = require("../models/manager.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const managers = await managerModel.find();
    res.status(200).send(managers);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});


router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const manager = await managerModel.findOne({ email });
    if (manager) {
      return res.send({
        message: "manager already exists",
      });
    }
    let value = new managerModel(req.body);
    await value.save();
    const data = await managerModel.findOne({ email });
    return res.send({ data, message: "Registered" });
  } catch (error) {
    res.send({ message: "error" });
  }
});


router.post("/login", async (req, res) => {
  const { managerID, password } = req.body;
  try {
    const manager = await managerModel.findOne({ managerID, password });

    if (manager) {
      const token = jwt.sign({ foo: "bar" }, process.env.key, {
        expiresIn: "24h",
      });
      res.send({ message: "Successful", user: manager, token: token });
    } else {
      res.send({ message: "Wrong credentials" });
    }
  } catch (error) {
    console.log({ message: "Error" });
    console.log(error);
  }
});

router.patch("/:managerId", async (req, res) => {
  const id = req.params.managerId;
  const payload = req.body;
  try {
    await managerModel.findByIdAndUpdate({ _id: id }, payload);
    const manager = await managerModel.findById(id);
    if (!manager) {
      return res.status(404).send({ message: `manager with id ${id} not found` });
    }
    res.status(200).send({ message: `manager Updated`, user: manager });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});


// Delete all managers
router.delete("/all", async (req, res) => {
  try {
    const result = await managerModel.deleteMany({});
    res.status(200).send({ message: "All manager data deleted", deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting all manager data:", error);
    res.status(500).send({ error: "Failed to delete all manager data" });
  }
});

router.delete("/:managerId", async (req, res) => {
  const id = req.params.managerId;
  try {
    const manager = await managerModel.findByIdAndDelete({ _id: id });
    if (!manager) {
      res.status(404).send({ msg: `manager with id ${id} not found` });
    }
    res.status(200).send(`manager with id ${id} deleted`);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

module.exports = router;
