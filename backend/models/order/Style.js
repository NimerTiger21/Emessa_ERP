const mongoose = require("mongoose");

const StyleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Style Name
    // styleNo: [{ type: String, required: true }], // ⬅️ Change here from single styleNo to array
    styleNo: [{ type: String }], // Array of Style Numbers - Changed from single string to array
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" }, // ✅ Linked to Brand
  },
  { timestamps: true }
);

module.exports = mongoose.model("Style", StyleSchema);
