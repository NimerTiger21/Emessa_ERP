const mongoose = require('mongoose');

const LaundryProcessSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: { type: String, enum: ["DRY PROCESS", "SPRAY PROCESS"], required: true },
},{ timestamps: true });

module.exports = mongoose.model("LaundryProcess", LaundryProcessSchema);
