require('dotenv').config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());                // ⭐ ADD THIS
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(
  "/ui-assets",
  express.static(
    "C:\\Users\\Medha Trust\\.cursor\\projects\\c-Users-Medha-Trust-Downloads-hospital-management-main-1-hospital-management-main\\assets"
  )
);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI ||
  "mongodb+srv://venu:venu%40123@cluster0.91umh0d.mongodb.net/myDatabase?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Use shared models from the models directory
const Patient = require("./models/Patient");

/* ===============================
   ROUTES
================================ */

// 👉 ADD PATIENT
app.post("/patients", async (req, res) => {
  try {
    const { name, age, gender } = req.body;

    // Basic validation
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Name is required and must be a string" });
    }
    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || ageNum <= 0) {
      return res.status(400).json({ error: "Age is required and must be a positive number" });
    }

    const patient = new Patient({ name, age: ageNum, gender });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 👉 GET ALL PATIENTS
app.get("/patients", async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

// Mount other route modules
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
app.use("/appointments", appointmentRoutes);
app.use("/doctors", doctorRoutes);
app.use("/auth", authRoutes);

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
