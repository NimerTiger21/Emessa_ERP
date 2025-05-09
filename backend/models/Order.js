const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    orderNo: { type: String, required: true, unique: true }, // Unique Order Number
    //emessaOrderNo: String, // Internal Order Number
    keyNo: String, // Key Number
    season: String, // Season
    orderQty: { type: Number, required: true, min: 1 }, // Quantity
    orderDate: { type: Date, required: true }, // Order Date
    //deliveryDate: Date, // Expected Delivery Date
    deliveredQty: Number, // Delivered Quantity
    
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" }, // Brand (one-to-many) | Linked Brand
    style: { type: mongoose.Schema.Types.ObjectId, ref: "Style" }, // Style (one-to-many) | Linked Style
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "CustomAccount" }, // Customer (one-to-many) | Linked Customer
    fabricSupplier: { type: mongoose.Schema.Types.ObjectId, ref: "CustomAccount" }, // fabricSupplier (one-to-many) | Linked Fabric Supplier
    fabric: { type: mongoose.Schema.Types.ObjectId, ref: "Fabric" }, // Fabric (one-to-many) | Linked Fabric
    styleNo: String, // Style Number
    articleNo: String, // Style Number
    
    //barcode7: String, // Barcode

    // Workflow Tracking
    currentStage: { type: String, default: "Fabric Reservation" },
    stageProgress: { type: Number, default: 0 },

    // Relationships with other processes
    defects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Defect" }], // Track defects
    washRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "WashRecipe" }], // Linked wash recipes
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

module.exports = mongoose.model("Order", OrderSchema);

/**Added Cascade Deletion (Optional):
 * If an Order is deleted, you may automatically delete defects & wash recipes.
 * OrderSchema.pre("remove", async function (next) {
  try {
    await Defect.deleteMany({ orderId: this._id });
    await WashRecipe.deleteMany({ orderId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});
 */
