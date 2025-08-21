const express = require("express");
const { AdminModel } = require("../models/Admin.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { managerModel } = require("../models/Manager.model");
const { DoctorModel } = require("../models/Doctor.model");
const { PatientModel } = require("../models/Patient.model");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const admins = await AdminModel.find();
    res.status(200).send(admins);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await AdminModel.findOne({ email });
    if (admin) {
      return res.send({
        message: "Admin already exists",
      });
    }
    let value = new AdminModel(req.body);
    await value.save();
    const data = await AdminModel.findOne({ email });
    return res.send({ data, message: "Registered" });
  } catch (error) {
    res.send({ message: "error" });
  }
});

router.post("/login", async (req, res) => {
  const { adminID, password } = req.body;
  try {
    const admin = await AdminModel.findOne({ adminID, password });

    if (admin) {
      const token = jwt.sign({ foo: "bar" }, process.env.key, {
        expiresIn: "24h",
      });
      res.send({ message: "Successful", user: admin, token: token });
    } else {
      res.send({ message: "Wrong credentials" });
    }
  } catch (error) {
    console.log({ message: "Error" });
    console.log(error);
  }
});

router.patch("/:adminId", async (req, res) => {
  const id = req.params.adminId;
  const payload = req.body;
  try {
    const admin = await AdminModel.findByIdAndUpdate({ _id: id }, payload);
    if (!admin) {
      res.status(404).send({ msg: `Admin with id ${id} not found` });
    }
    res.status(200).send(`Admin with id ${id} updated`);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

router.delete("/:adminId", async (req, res) => {
  const id = req.params.adminId;
  try {
    const admin = await AdminModel.findByIdAndDelete({ _id: id });
    if (!admin) {
      res.status(404).send({ msg: `Admin with id ${id} not found` });
    }
    res.status(200).send(`Admin with id ${id} deleted`);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

router.post("/password", async (req, res) => {
  const { email, userId, password } = req.body;
  console.log("email", email);
  console.log("userId", userId);
  
  try {
    if (!email || !userId || !password) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    // Fixed: Create the message object correctly for SendGrid
    const msg = {
      to: email,
      from: 'abiir.ashhab@gmail.com', // Must be verified in SendGrid
      subject: "Account ID and Password",
      text: `Your User ID: ${userId}\nPassword: ${password}`,
    };
    
    console.log(msg);
    
    // Fixed: Pass the message object directly, not wrapped in another object
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
        res.send({ message: "Password email sent successfully" });
      })
      .catch((error) => {
        console.error('Email error:', error);
        res.status(500).send({ message: "Failed to send email" });
      });

  } catch (error) {
    console.error("Internal error in /password route:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/forgot", async (req, res) => {
  const { email, type } = req.body;
  let user, userId, password;

  try {
    if (type === "manager") {
      user = await managerModel.find({ email });
      userId = user[0]?.managerID;
      password = user[0]?.password;
    } else if (type === "patient") {
      user = await PatientModel.find({ email });
      userId = user[0]?.patientID;
      password = user[0]?.password;
    } else if (type === "admin") {
      user = await AdminModel.find({ email });
      userId = user[0]?.adminID;
      password = user[0]?.password;
    } else if (type === "doctor") {
      user = await DoctorModel.find({ email });
      userId = user[0]?.docID;
      password = user[0]?.password;
    }

    if (!user || user.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abiir.ashhab@gmail.com",
        pass: "zfik mxqh ueqq fgvj", // consider moving to process.env
      },
    });

    const mailOptions = {
      from: "abiir.ashhab@gmail.com",
      to: email,
      subject: "Account ID and Password",
      text: `Your User ID: ${userId}\nPassword: ${password}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Mail send error:", error);
        return res.status(500).send({ message: "Failed to send email" });
      }
      res.send({ message: "Password reset email sent" });
    });

  } catch (error) {
    console.error("Forgot route error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
