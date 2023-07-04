const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PatientSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  middlename: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  alternate_mobileNumber: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  abhaId: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
});

const Patient = mongoose.model("Patient", PatientSchema);

module.exports = Patient;
