const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  specialization: { type: String, required: true, trim: true },
  phone:          { type: String, trim: true, default: "" },
  email:          { type: String, trim: true, lowercase: true, default: "" },
  experience:     { type: Number, default: 0 },
  qualification:  { type: String, trim: true, default: "" },
  availability:   { type: String, trim: true, default: "" },
  status:         { type: String, enum: ["Active","On Leave","Inactive"], default: "Active" },
}, { timestamps: true });

module.exports = mongoose.model("Doctor", DoctorSchema);
