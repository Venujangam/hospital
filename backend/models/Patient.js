const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  age:            { type: Number, required: true },
  gender:         { type: String, enum: ["Male", "Female", "Other"], required: true },
  phone:          { type: String, trim: true, default: "" },
  email:          { type: String, trim: true, lowercase: true, default: "" },
  bloodGroup:     { type: String, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-",""], default: "" },
  address:        { type: String, trim: true, default: "" },
  condition:      { type: String, trim: true, default: "" },
  status:         { type: String, enum: ["Active","Admitted","Discharged"], default: "Active" },
  admittedAt:     { type: Date, default: null },
  dischargedAt:   { type: Date, default: null },
  dischargeNote:  { type: String, trim: true, default: "" },
  ward:           { type: String, trim: true, default: "" },
  bedNumber:      { type: String, trim: true, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Patient", PatientSchema);
