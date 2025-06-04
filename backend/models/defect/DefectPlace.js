const mongoose = require("mongoose");

const DefectPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
},{ timestamps: true });

module.exports = mongoose.model("DefectPlace", DefectPlaceSchema);