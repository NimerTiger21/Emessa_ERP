const mongoose = require("mongoose");

const FabricSchema = new mongoose.Schema({
  code: { type: String }, // Not required/Unique Fabric Code
  name: { type: String, required: true }, // Fabric Name
  color: String, // Color
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "CustomAccount" }, // Supplier (one-to-many)
}, { timestamps: true });

// 🛠 Virtual field for compositions (won't store in DB but will be populated dynamically)
FabricSchema.virtual("fabricCompositions", {
  ref: "FabricComposition",
  localField: "_id",
  foreignField: "fabric",
});

// ✅ Computed virtual to generate formatted composition string
FabricSchema.virtual("compositionString").get(function () {
  if (!this.fabricCompositions || this.fabricCompositions.length === 0) return "";

  return this.fabricCompositions
    .map(comp => `${comp.value}%${comp.compositionItem?.abbrPrefix || comp.compositionItem?.name}`)
    .join(" + ");
});

// ✅ Ensure virtuals are included when converting to JSON
FabricSchema.set("toJSON", { virtuals: true });
FabricSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Fabric", FabricSchema);
