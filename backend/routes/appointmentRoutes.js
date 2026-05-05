const express     = require("express");
const Appointment = require("../models/Appointment");
const router      = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    res.status(500).json({ message: "Failed to book appointment", error: err.message });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments", error: err.message });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointment", error: err.message });
  }
});

// UPDATE (e.g. change status)
router.put("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json({ message: "Appointment updated", appointment });
  } catch (err) {
    res.status(500).json({ message: "Failed to update appointment", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete appointment", error: err.message });
  }
});

module.exports = router;
