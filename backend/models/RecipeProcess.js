const mongoose = require('mongoose');

const RecipeProcessSchema = new mongoose.Schema({
  washRecipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WashRecipe',
    required: true,
  },
  laundryProcessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LaundryProcess',
    required: true,
  },
  sequence: {
    type: Number,
    required: true 
  },
  remark: {
    type: String,
  },
  recipeProcessType: { type: String, enum: ["DRY PROCESS", "SPRAY PROCESS"], required: true }, // New field
}, { timestamps: true });

module.exports = mongoose.model("RecipeProcess", RecipeProcessSchema);
