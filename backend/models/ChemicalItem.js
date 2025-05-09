const mongoose = require('mongoose');

const ChemicalItemsSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  supplier: {
    type: String,
    //required: true,
  },
  unit: {
    type: String,
    //required: true,
  },
}, { timestamps: true });

// Create and export the RecipeItem model
const ChemicalItems = mongoose.model('ChemicalItems', ChemicalItemsSchema);
module.exports = ChemicalItems;
