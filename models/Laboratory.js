const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const LaboratorySchema = new Schema({
  labId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  labName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

LaboratorySchema.pre("save", async function (next) {
  // Hash the password with the cost 12
  this.password = await bcrypt.hash(this.password, 12);
  console.log(this.password);
  next();
});

const Laboratory = mongoose.model("Laboratory", LaboratorySchema);

module.exports = Laboratory;
