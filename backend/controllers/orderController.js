const Defect = require("../models/Defect");
const Order = require("../models/Order");
const Style = require("../models/order/Style");

const generateBarcode7 = () => {
  // Generate a short alphanumeric reference (e.g., 4dbdf)
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // Short barcode;
};
// **Stage Progress Mapping**
const stageMapping = {
  "Fabric Reservation": 0,
  "Cutting": 25,
  "Stitching": 50,
  "Finishing": 75,
  "Completed": 100,
};

// Dynamically set progress based on the stage
const calculateProgress = (currentStage) => stageMapping[currentStage] || 0;

// ✅ **Create or Update Order**
exports.createOrUpdateOrder = async (req, res) => {
  try {
    const { orderNo, ...otherFields } = req.body;
    //console.log("Received order data:", req.body);

    // Trim and normalize order number
    const normalizedOrderNo = orderNo.toString().trim();
    const existingOrder = await Order.findOne({ orderNo: normalizedOrderNo });

    if (existingOrder && (!req.params.id || req.params.id !== existingOrder._id.toString())) {
      return res.status(400).json({ message: "Order number already exists." });
    }

    let order;
    if (req.params.id) {
      // **Update existing order**
      order = await Order.findByIdAndUpdate(req.params.id, { orderNo: normalizedOrderNo, ...otherFields }, { 
        new: true, 
        runValidators: true 
      });
      if (!order) return res.status(404).json({ message: "Order not found." });
    } else {
      // **Create new order**
      order = new Order({ orderNo: normalizedOrderNo, ...otherFields });
      //order.barcode7 = generateBarcode7();
      await order.save();
    }

    order.stageProgress = calculateProgress(order.currentStage);

    const populatedOrder = await Order.findById(order._id)
  .populate("customer", "name")
  .populate("fabricSupplier", "name")
  .populate("style", "name styleNo")
  .populate("fabric", "name color")
  .populate("brand", "name")
  .populate({
    path: "fabric",
    populate: {
      path: "fabricCompositions",
      populate: { path: "compositionItem", select: "name abbrPrefix" }
    }
  });
  
  populatedOrder.stageProgress = calculateProgress(populatedOrder.currentStage);
  res.status(200).json({ message: "Order Created/Updated Successfully", populatedOrder });

  } catch (error) {
    console.error("Error creating/updating order:", error);
    res.status(500).json({ message: "Error processing order", error });
  }
};
// ✅ **Get All Orders with Pagination, Sorting & Filtering**
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, sortField = "orderDate", sortOrder = "desc", search, style
    } = req.query;

    const filter = {};
    
    if (style) {
      filter.style = style;
    }
    // Convert Style Name to ObjectId
    // if (style) {
    //   const styleDoc = await Style.findOne({ name: style }); // Find the style ID
    //   if (!styleDoc) {
    //     return res.status(400).json({ message: "Invalid style selected" });
    //   }
    //   filter.style = styleDoc._id; // Use ObjectId for filtering
    // }

    if (search) {
      filter.$or = [
        { orderNo: { $regex: search, $options: "i" } },
        { keyNo: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .populate("customer", "name")
      .populate("fabricSupplier", "name")
      .populate("style", "name styleNo")
      .populate("fabric", "name color")
      .populate("brand", "name")
      .populate({
        path: "fabric",
        populate: {
          path: "fabricCompositions",
          populate: { path: "compositionItem", select: "name abbrPrefix" }
        }
      })
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      //.sort({ createdAt: -1 }) // Sort by createdAt in descending order (most recent first)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);
    //console.log("Fetched Orders: ", orders);

    res.status(200).json({
      data: orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};
// ✅ **Get Single Order by ID**
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name")
      .populate("style", "name")
      .populate("fabric", "name color")
      .populate("defects")
      .populate("washRecipes");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);

  } catch (error) {
    res.status(500).json({ message: "Error fetching order details", error });
  }
};
// ✅ **Update an Order**
exports.updateOrder = async (req, res) => {
  try {
    const { orderNo, ...otherFields } = req.body;
   
    const normalizedOrderNo = orderNo.toString().trim();
    const existingOrder = await Order.findOne({ orderNo: normalizedOrderNo });

    if (existingOrder && (!req.params.id || req.params.id !== existingOrder._id.toString())) {
      return res.status(400).json({ message: "Order number already exists." });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedOrder) return res.status(404).json({ message: "Order not found." });

    updatedOrder.stageProgress = calculateProgress(updatedOrder.currentStage);
    res.status(200).json({ message: "Order Updated Successfully", updatedOrder });

  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

// ✅ **Delete an Order**
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
};

// ✅ **Add Defect to Order**
exports.addDefectToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const newDefect = new Defect({ ...req.body, orderId });
    const savedDefect = await newDefect.save();

    await Order.findByIdAndUpdate(orderId, { $push: { defects: savedDefect._id } });

    res.status(201).json(savedDefect);
  } catch (error) {
    res.status(500).json({ message: "Error adding defect to order", error });
  }
};

// ✅ **Get Defects for an Order**
exports.getDefectsForOrder = async (req, res) => {
  try {
    const defects = await Defect.find({ orderId: req.params.orderId })
    .populate("defectType", "name")
    .populate("defectName", "name")
    .populate("defectPlace", "name")
    .populate("defectProcess", "name");
    res.status(200).json(defects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defects for order", error });
  }
};
//********************************************************************************************************************************* */

  exports.getOrderById = async (req, res) => {
    console.log("Fetching order with ID:", req.params.id);
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order details", error });
    }
  };

  // Tiger this is not used (Also in the frontend defectService.js => addDefectToOrder) also in routes
  // Add a defect to an order
  exports.addDefectToOrder = async (req, res) => {
    try {
      const { orderId } = req.params;
      const newDefect = new Defect({ ...req.body, orderId });
      const savedDefect = await newDefect.save();
  
      // Add defect to order's defects array
      await Order.findByIdAndUpdate(orderId, {
        $push: { defects: savedDefect._id },
      });
  
      res.status(201).json(savedDefect);
    } catch (error) {
      res.status(500).json({ message: "Error adding defect to order", error });
    }
  };