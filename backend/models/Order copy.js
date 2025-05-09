const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    orderNo: { type: String, required: true, unique: true },
    emessaOrderNo: String,
    keyNo: String,
    season: String,
    line: String,
    style: String,
    styleNo: String,
    fabricArt: String,
    fabricSupplier: String,
    fabricType: String,
    fabricComposition: String,
    orderQty: { type: Number, required: true, min: 1 },
    orderDate: Date,
    customer: String,
    deliveryDate: Date,
    deliveredQty: Number,
    barcode7: String,
    //Missing auto calculated,
    currentStage: { type: String, default: "Fabric Reservation" },
    stageProgress: { type: Number, default: 0 },
    defects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Defect" }],
    washRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "WashRecipe" }],
  },{ timestamps: true }); // Adds createdAt and updatedAt fields

  /*
  // Middleware to handle cascade delete on Order removal
OrderSchema.pre("remove", async function (next) {
  try {
    // Delete all defects associated with this order
    await Defect.deleteMany({ orderId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});
*/

  module.exports = mongoose.model("Order", OrderSchema);
  