const mongoose = require("mongoose");

const CustomAccountSchema = new mongoose.Schema({
  type: { type: String, enum: ["Customer", "Supplier"], required: true }, // Define type
  code: { type: String, required: true, unique: true }, // Unique code
  name: { type: String, required: true }, // Name
  address: String, 
  contactEmail: String, // Fixed spelling mistake
}, { timestamps: true });

module.exports = mongoose.model("CustomAccount", CustomAccountSchema);
