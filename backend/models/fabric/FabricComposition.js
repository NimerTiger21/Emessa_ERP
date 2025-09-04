const mongoose = require("mongoose");

const FabricCompositionSchema = new mongoose.Schema({
  fabric: { type: mongoose.Schema.Types.ObjectId, ref: "Fabric" }, // Fabric (many-to-one)
  compositionItem: { type: mongoose.Schema.Types.ObjectId, ref: "CompositionItem" }, // Composition Item (many-to-one)
  value: Number, // Percentage Composition
}, { timestamps: true });

module.exports = mongoose.model("FabricComposition", FabricCompositionSchema);
