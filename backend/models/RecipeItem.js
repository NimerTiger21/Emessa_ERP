const mongoose = require('mongoose');

// Define the RecipeItem schema
const RecipeItemSchema = new mongoose.Schema({
  washRecipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WashRecipe', // Reference to the WashRecipe model
    required: true,
  },
  stepId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LaundryStep', // Reference to the LaundryStep model
    required: true,
  },
  time: {
    type: Number, // Assuming time is stored in minutes or seconds
    //required: true,
  },
  temp: {
    type: Number, // Assuming temperature is stored in degrees Celsius or Fahrenheit
    //required: true,
  },
  liters: {
    type: Number, // Assuming liters is a decimal value
    //required: true,
  },
  sequence: {
    type: Number, // Sequence of steps, typically an integer
    required: true,
  },
  stepItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StepItem",
    },
  ],
}, { timestamps: true });

// Create and export the RecipeItem model
module.exports = mongoose.model("RecipeItem", RecipeItemSchema);
