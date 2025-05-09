const mongoose = require("mongoose");

const DefectNameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: mongoose.Schema.Types.ObjectId, ref: "DefectType" }, // Name belongs to a DefectType
  description: { type: String },
},{ timestamps: true });

module.exports = mongoose.model("DefectName", DefectNameSchema);
