const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  doctorName:  { type: String, required: true, trim: true },
  date:        { type: Date,   required: true },
  time:        { type: String, required: true },
  reason:      { type: String, trim: true, default: "" },
  status:      { type: String, enum: ["Scheduled","Completed","Cancelled"], default: "Scheduled" },
  notes:       { type: String, trim: true, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);
