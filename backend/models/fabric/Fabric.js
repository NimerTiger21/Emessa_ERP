const mongoose = require("mongoose");

const FabricSchema = new mongoose.Schema({
  code: { type: String }, // Not required/Unique Fabric Code
  name: { type: String, required: true }, // Fabric Name
  color: String, // Color
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "CustomAccount" }, // Supplier (one-to-many)
  
  // 🆕 Technical Parameters
  technicalSpecs: {
    tensileWarp: { type: Number }, // Tensile Warp (g)
    tensileWeft: { type: Number }, // Tensile Weft (g)
    tearWarp: { type: Number }, // Tear Warp (g)
    tearWeft: { type: Number }, // Tear Weft (g)
    weight: { type: Number }, // oz/y2
    elasticity: { type: Number }, // Elasticity percentage
  },
  
  // 🆕 Technical Data Sheet (TDS) File
  tdsFile: {
    fileName: String,
    filePath: String,
    fileSize: Number,
    uploadDate: { type: Date, default: Date.now },
    mimeType: String,
  },
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

// ✅ Virtual for technical specs summary
FabricSchema.virtual("techSpecsSummary").get(function () {
  const specs = this.technicalSpecs;
  if (!specs) return "No technical specifications";
  
  return `Tensile: ${specs.tensileWarp || 'N/A'}g(W) ${specs.tensileWeft || 'N/A'}g(Wf) | Tear: ${specs.tearWarp || 'N/A'}g(W) ${specs.tearWeft || 'N/A'}g(Wf) | Weight: ${specs.weight || 'N/A'} oz/y² | Elasticity: ${specs.elasticity || 'N/A'}%`;
});

// ✅ Ensure virtuals are included when converting to JSON
FabricSchema.set("toJSON", { virtuals: true });
FabricSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Fabric", FabricSchema);