const express = require("express");
const Doctor  = require("../models/Doctor");
const router  = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({ message: "Doctor added successfully", doctor });
  } catch (err) {
    res.status(500).json({ message: "Failed to add doctor", error: err.message });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctors", error: err.message });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctor", error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ message: "Doctor updated", doctor });
  } catch (err) {
    res.status(500).json({ message: "Failed to update doctor", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete doctor", error: err.message });
  }
});

module.exports = router;
