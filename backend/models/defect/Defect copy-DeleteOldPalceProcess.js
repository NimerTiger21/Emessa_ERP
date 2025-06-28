const mongoose = require("mongoose");
const Order = require("../order/Order");

const DefectDetailSchema = new mongoose.Schema({
  count: { type: Number, required: true },
  defectPlace: {              // Optional: "Back", "Side"
      type: mongoose.Schema.Types.ObjectId,
      ref: "DefectPlace",
      required: false,
    },
    defectProcess: {        // Optional: "Back rise", etc.
      type: mongoose.Schema.Types.ObjectId,
      ref: "DefectProcess",
      required: false,
    },
}, { _id: false });


const DefectSchema = new mongoose.Schema(
  {
    defectName: { type: mongoose.Schema.Types.ObjectId, ref: "DefectName" },
    defectType: { type: mongoose.Schema.Types.ObjectId, ref: "DefectType" },

    description: { type: String },
    severity: { type: String, enum: ["Low", "Medium", "High"], required: true },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    detectedDate: { type: Date, default: Date.now },
    defectCount: { type: Number, default: 1 },
    holesOrOperation: {
      type: String,
      enum: ["Holes", "Operation"],
      required: true,
    },
    images: [{ type: String, required: false }], // New field to store image path
    productionLine: { type: String }, // New field7
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Reference to the order
    details: [DefectDetailSchema],
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

// Middleware to handle cascade update on delete
DefectSchema.pre("remove", async function (next) {
  try {
    console.log("Deleting defect with ID:", this._id);
    console.log("Associated Order ID:", this.orderId);
    // Ensure `orderId` exists before trying to update the Order model
    if (this.orderId) {
      await Order.findByIdAndUpdate(this.orderId, {
        $pull: { defects: this._id }, // Remove defect from Order's defects array
      });
    }
    if (!this.orderId) {
      console.warn(
        "Defect has no associated Order ID. Skipping cascade delete."
      );
      return next();
    }
    next();
  } catch (error) {
    console.error("Error in pre-remove middleware:", error);
    next(error); // Pass error to the next middleware
  }
});

module.exports = mongoose.model("Defect", DefectSchema);
