const mongoose = require("mongoose");

const WashRecipeSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  date: { type: Date, default: Date.now },
  washCode:{type: String, trim: true, index: true, unique: true, sparse: true},
  washType: { type: String, enum: ["Size set", "SMS", "Proto", "Production", "Fitting Sample"], required: true },
  //recipeProcessId: { type: mongoose.Schema.Types.ObjectId, ref: "RecipeProcess", required: true },
  recipeProcessId: [{ type: mongoose.Schema.Types.ObjectId, ref: "RecipeProcess" }],
  //steps: { type: mongoose.Schema.Types.ObjectId, ref: "RecipeItem", required: true },
  steps: [{ type: mongoose.Schema.Types.ObjectId, ref: "RecipeItem" }], // Allow multiple RecipeItem references
  /*processParameters: {
    steps: { type: String, required: true },
    time: { type: Number, required: true },
    temp: { type: Number, required: true },
    litters: { type: Number, required: true },
    quantity: { type: Number, required: true },
    un: { type: String, required: true },
    chemicals: { type: [String], required: true }, // Array of chemical names or IDs
  },*/
}, { timestamps: true });

module.exports = mongoose.model("WashRecipe", WashRecipeSchema);
