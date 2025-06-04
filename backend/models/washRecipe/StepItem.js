const mongoose = require('mongoose');

// Define the RecipeItem schema
const StepItemSchema = new mongoose.Schema({
  recipeItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecipeItem',
    required: true,
  },
  chemicalItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChemicalItems',
    required: true,
  },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("StepItem", StepItemSchema);
