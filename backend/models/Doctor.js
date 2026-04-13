const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name: String,
  specialization: String
});

module.exports = mongoose.model("Doctor", DoctorSchema);
