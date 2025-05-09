const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
},{ timestamps: true });

module.exports = mongoose.model("Section", SectionSchema);
