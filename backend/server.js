require('dotenv').config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// MongoDB connection — uses local in-memory DB if no MONGO_URI is set
async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    console.log("No MONGO_URI found — starting local in-memory MongoDB...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log("In-memory MongoDB URI:", uri);
  }

  await mongoose.connect(uri);
  console.log("MongoDB Connected ✅");
}

connectDB().catch((err) => console.error("MongoDB connection error:", err));

// Use shared models from the models directory
const Patient = require("./models/Patient");

/* ===============================
   ROUTES
================================ */

// 👉 ADD PATIENT
app.post("/patients", async (req, res) => {
  try {
    const { name, age, gender } = req.body;
    if (!name || typeof name !== "string")
      return res.status(400).json({ error: "Name is required and must be a string" });
    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || ageNum <= 0)
      return res.status(400).json({ error: "Age must be a positive number" });

    const patient = new Patient({ ...req.body, age: ageNum });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 👉 GET ALL PATIENTS
app.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 GET ONE PATIENT
app.get("/patients/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 UPDATE PATIENT
app.put("/patients/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json({ message: "Patient updated", patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 DELETE PATIENT
app.delete("/patients/:id", async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 DISCHARGE PATIENT
app.post("/patients/:id/discharge", async (req, res) => {
  try {
    const { dischargeNote } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (patient.status === "Discharged")
      return res.status(400).json({ error: "Patient is already discharged" });

    patient.status       = "Discharged";
    patient.dischargedAt = new Date();
    patient.dischargeNote = dischargeNote || "";
    await patient.save();

    res.json({ message: "Patient discharged successfully", patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 ADMIT PATIENT
app.post("/patients/:id/admit", async (req, res) => {
  try {
    const { ward, bedNumber } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    patient.status     = "Admitted";
    patient.admittedAt = new Date();
    patient.ward       = ward      || "";
    patient.bedNumber  = bedNumber || "";
    patient.dischargedAt  = null;
    patient.dischargeNote = "";
    await patient.save();

    res.json({ message: "Patient admitted successfully", patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mount other route modules
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes      = require("./routes/doctorRoutes");
const authRoutes        = require("./routes/authRoutes");
const paymentRoutes     = require("./routes/paymentRoutes");
app.use("/appointments", appointmentRoutes);
app.use("/doctors",      doctorRoutes);
app.use("/auth",         authRoutes);
app.use("/payments",     paymentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
