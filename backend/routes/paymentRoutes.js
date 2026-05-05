const express = require("express");
const Payment = require("../models/Payment");
const Patient = require("../models/Patient");
const router  = express.Router();

// CREATE payment
router.post("/", async (req, res) => {
  try {
    const { patientId, patientName, amount, paymentType, paymentMethod, status, paidAmount, description } = req.body;

    if (!patientId || !patientName || !amount)
      return res.status(400).json({ message: "patientId, patientName and amount are required" });

    const paid   = Number(paidAmount ?? amount);
    const due    = Number(amount) - paid;

    const payment = await Payment.create({
      patientId, patientName,
      amount:        Number(amount),
      paymentType:   paymentType   || "Consultation",
      paymentMethod: paymentMethod || "Cash",
      status:        status        || (due > 0 ? "Partial" : "Paid"),
      paidAmount:    paid,
      dueAmount:     due < 0 ? 0 : due,
      description:   description   || "",
    });

    res.status(201).json({ message: "Payment recorded", payment });
  } catch (err) {
    res.status(500).json({ message: "Failed to record payment", error: err.message });
  }
});

// GET ALL payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments", error: err.message });
  }
});

// GET payments for a specific patient
router.get("/patient/:patientId", async (req, res) => {
  try {
    const payments = await Payment.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments", error: err.message });
  }
});

// GET one payment
router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment", error: err.message });
  }
});

// UPDATE payment
router.put("/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment updated", payment });
  } catch (err) {
    res.status(500).json({ message: "Failed to update payment", error: err.message });
  }
});

// DELETE payment
router.delete("/:id", async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete payment", error: err.message });
  }
});

// SUMMARY — total collected, pending, by type
router.get("/summary/stats", async (req, res) => {
  try {
    const payments = await Payment.find();
    const totalCollected = payments.reduce((s, p) => s + p.paidAmount, 0);
    const totalDue       = payments.reduce((s, p) => s + p.dueAmount,  0);
    const totalBilled    = payments.reduce((s, p) => s + p.amount,     0);
    const byType = {};
    payments.forEach(p => {
      byType[p.paymentType] = (byType[p.paymentType] || 0) + p.paidAmount;
    });
    res.json({ totalBilled, totalCollected, totalDue, byType, count: payments.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to get summary", error: err.message });
  }
});

module.exports = router;
