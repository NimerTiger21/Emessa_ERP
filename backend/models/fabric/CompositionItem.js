const mongoose = require("mongoose");

const CompositionItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Composition Name
  abbrPrefix: String, // Abbreviation Prefix
}, { timestamps: true });

module.exports = mongoose.model("CompositionItem", CompositionItemSchema);
