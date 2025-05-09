const mongoose = require("mongoose");

const DefectProcessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  place: { type: mongoose.Schema.Types.ObjectId, ref: "DefectPlace" }, // Name belongs to a DefectType
  description: { type: String },
},{ timestamps: true });

module.exports = mongoose.model("DefectProcess", DefectProcessSchema);
