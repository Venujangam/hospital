const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  patientName:   { type: String, required: true, trim: true },
  amount:        { type: Number, required: true, min: 0 },
  paymentType:   { type: String, enum: ["Consultation","Admission","Surgery","Lab Test","Pharmacy","Discharge","Other"], default: "Consultation" },
  paymentMethod: { type: String, enum: ["Cash","Card","UPI","Insurance","Online"], default: "Cash" },
  status:        { type: String, enum: ["Paid","Pending","Partial"], default: "Paid" },
  paidAmount:    { type: Number, default: 0 },
  dueAmount:     { type: Number, default: 0 },
  description:   { type: String, trim: true, default: "" },
  paidAt:        { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
