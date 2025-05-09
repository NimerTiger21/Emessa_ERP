const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Brand Name
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "CustomAccount" }, // Brand belongs to a Customer
}, { timestamps: true });

module.exports = mongoose.model("Brand", BrandSchema);
