const mongoose = require("mongoose");

const DefectProcessSewingProblemsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: "DefectPlace", required: true },
  description: { type: String },
},{ timestamps: true });

module.exports = mongoose.model("DefectProcessSewingProblems", DefectProcessSewingProblemsSchema);
