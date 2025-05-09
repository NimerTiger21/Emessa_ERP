const mongoose = require("mongoose");

const ProcessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  description: { type: String },
},{ timestamps: true });

module.exports = mongoose.model("Process", ProcessSchema);
