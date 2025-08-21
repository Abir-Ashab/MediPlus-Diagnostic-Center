const express = require("express");
const { AppointmentModel } = require("../models/Appointment.model");

const router = express.Router();

router.get("/", async (req, res) => {
  let query = req.query;
  try {
    const appointments = await AppointmentModel.find(query);
    res.status(200).send(appointments);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

// Create a new appointment
router.post("/create", async (req, res) => {
  const payload = req.body;
  try {
    // Validate that tests array exists and has at least one test
    if (!payload.tests || !Array.isArray(payload.tests) || payload.tests.length === 0) {
      return res.status(400).send({ error: "At least one test must be selected" });
    }
    
    // Validate that totalAmount is provided
    if (!payload.totalAmount) {
      return res.status(400).send({ error: "Total amount is required" });
    }

    // Calculate revenue distribution
    let hospitalRevenue, doctorRevenue = 0, agentRevenue = 0;
    
    if (payload.agentName) {
      // If agent exists: 90% hospital, 5% doctor, 5% agent
      hospitalRevenue = payload.totalAmount * 0.9;
      doctorRevenue = payload.doctorName ? payload.totalAmount * 0.05 : 0;
      agentRevenue = payload.totalAmount * 0.05;
    } else {
      // If no agent: 95% hospital, 5% doctor
      hospitalRevenue = payload.totalAmount * 0.95;
      doctorRevenue = payload.doctorName ? payload.totalAmount * 0.05 : 0;
    }

    const appointmentData = {
      ...payload,
      hospitalRevenue,
      doctorRevenue,
      agentRevenue
    };

    const appointment = new AppointmentModel(appointmentData);
    await appointment.save();
    return res.status(201).send({ 
      message: "Appointment successfully booked.",
      appointment: appointment
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: "Failed to book appointment" });
  }
});

// Get hospital revenue statistics
router.get("/revenue/hospital", async (req, res) => {
  try {
    const result = await AppointmentModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$hospitalRevenue" },
          appointments: { $sum: 1 }
        }
      }
    ]);
    
    // Get monthly data
    const monthlyData = await AppointmentModel.aggregate([
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] }, // Group by year-month
          revenue: { $sum: "$hospitalRevenue" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).send({
      summary: result[0] || { totalRevenue: 0, appointments: 0 },
      monthly: monthlyData
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Failed to fetch hospital revenue" });
  }
});

// Get doctor revenue statistics
router.get("/revenue/doctor", async (req, res) => {
  try {
    // Get doctor-wise revenue
    const doctorRevenue = await AppointmentModel.aggregate([
      { $match: { doctorName: { $ne: null, $ne: "" } } },
      {
        $group: {
          _id: "$doctorName",
          totalRevenue: { $sum: "$doctorRevenue" },
          appointments: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Get overall total
    const totalResult = await AppointmentModel.aggregate([
      {
        $group: {
          _id: null,
          totalDoctorRevenue: { $sum: "$doctorRevenue" },
          totalAppointments: { $sum: { $cond: [{ $ne: ["$doctorName", ""] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).send({
      doctors: doctorRevenue,
      summary: totalResult[0] || { totalDoctorRevenue: 0, totalAppointments: 0 }
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Failed to fetch doctor revenue" });
  }
});

// Get agent revenue statistics
router.get("/revenue/agent", async (req, res) => {
  try {
    // Get agent-wise revenue
    const agentRevenue = await AppointmentModel.aggregate([
      { $match: { agentName: { $ne: null, $ne: "" } } },
      {
        $group: {
          _id: "$agentName",
          totalRevenue: { $sum: "$agentRevenue" },
          appointments: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Get overall total
    const totalResult = await AppointmentModel.aggregate([
      {
        $group: {
          _id: null,
          totalAgentRevenue: { $sum: "$agentRevenue" },
          totalAppointments: { $sum: { $cond: [{ $ne: ["$agentName", ""] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).send({
      agents: agentRevenue,
      summary: totalResult[0] || { totalAgentRevenue: 0, totalAppointments: 0 }
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Failed to fetch agent revenue" });
  }
});

// Update an appointment by ID
router.patch("/:appointmentId", async (req, res) => {
  const id = req.params.appointmentId;
  const payload = req.body;
  try {
    // If total amount is being updated, recalculate revenue distribution
    if (payload.totalAmount !== undefined) {
      const appointment = await AppointmentModel.findById(id);
      if (!appointment) {
        return res.status(404).send({ msg: `Appointment with id ${id} not found` });
      }

      // Use existing agent and doctor data if not provided in update
      const agentName = payload.agentName !== undefined ? payload.agentName : appointment.agentName;
      const doctorName = payload.doctorName !== undefined ? payload.doctorName : appointment.doctorName;

      let hospitalRevenue, doctorRevenue = 0, agentRevenue = 0;
      
      if (agentName) {
        // If agent exists: 90% hospital, 5% doctor, 5% agent
        hospitalRevenue = payload.totalAmount * 0.9;
        doctorRevenue = doctorName ? payload.totalAmount * 0.05 : 0;
        agentRevenue = payload.totalAmount * 0.05;
      } else {
        // If no agent: 95% hospital, 5% doctor
        hospitalRevenue = payload.totalAmount * 0.95;
        doctorRevenue = doctorName ? payload.totalAmount * 0.05 : 0;
      }

      payload.hospitalRevenue = hospitalRevenue;
      payload.doctorRevenue = doctorRevenue;
      payload.agentRevenue = agentRevenue;
    }

    const updatedAppointment = await AppointmentModel.findByIdAndUpdate({ _id: id }, payload, { new: true });
    if (!updatedAppointment) {
      return res.status(404).send({ msg: `Appointment with id ${id} not found` });
    }
    return res.status(200).send({
      message: `Appointment with id ${id} updated`,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

// Delete an appointment by ID
router.delete("/:appointmentId", async (req, res) => {
  const id = req.params.appointmentId;
  try {
    const appointment = await AppointmentModel.findByIdAndDelete({ _id: id });
    if (!appointment) {
      return res.status(404).send({ msg: `Appointment with id ${id} not found` });
    }
    return res.status(200).send({ message: `Appointment with id ${id} deleted` });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

module.exports = router;