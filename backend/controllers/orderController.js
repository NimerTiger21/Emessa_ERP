const Defect = require("../models/defect/Defect");
const Order = require("../models/order/Order");
const Style = require("../models/order/Style");
const { default: mongoose } = require("mongoose");

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const generateBarcode7 = () => {
  // Generate a short alphanumeric reference (e.g., 4dbdf)
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // Short barcode;
};
// **Stage Progress Mapping**
const stageMapping = {
  "Fabric Reservation": 0,
  Cutting: 25,
  Stitching: 50,
  Finishing: 75,
  Completed: 100,
};

// Dynamically set progress based on the stage
const calculateProgress = (currentStage) => stageMapping[currentStage] || 0;

// Add this helper function at the top of your controller file
const parseDateFilter = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// ✅ **Create or Update Order**
exports.createOrUpdateOrder = async (req, res) => {
  try {
    const { orderNo, ...otherFields } = req.body;
    //console.log("Received order data:", req.body);

    // Trim and normalize order number
    const normalizedOrderNo = orderNo.toString().trim();
    const existingOrder = await Order.findOne({ orderNo: normalizedOrderNo });

    if (
      existingOrder &&
      (!req.params.id || req.params.id !== existingOrder._id.toString())
    ) {
      return res.status(400).json({ message: "Order number already exists." });
    }

    let order;
    if (req.params.id) {
      // **Update existing order**
      order = await Order.findByIdAndUpdate(
        req.params.id,
        { orderNo: normalizedOrderNo, ...otherFields },
        {
          new: true,
          runValidators: true,
        }
      );
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
          populate: { path: "compositionItem", select: "name abbrPrefix" },
        },
      });

    populatedOrder.stageProgress = calculateProgress(
      populatedOrder.currentStage
    );
    res
      .status(200)
      .json({ message: "Order Created/Updated Successfully", populatedOrder });
  } catch (error) {
    console.error("Error creating/updating order:", error);
    res.status(500).json({ message: "Error processing order", error });
  }
};

// ✅ **Get All Orders with Pagination, Sorting & Filtering**
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "orderDate",
      sortOrder = "desc",
      search,
      style,
      dateFrom,
      dateTo,
      customer,
      brand,
      season,
      minDefectRate,
      maxDefectRate,
    } = req.query;

    const filter = {};

    if (style) {
      filter.style = style;
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { orderNo: { $regex: safeSearch, $options: "i" } },
        { keyNo: { $regex: safeSearch, $options: "i" } },
        { styleNo: { $regex: safeSearch, $options: "i" } },
        { articleNo: { $regex: safeSearch, $options: "i" } },
      ];
    }
    // If search is provided, filter by orderNo or keyNo
    // if (search) {
    //   filter.$or = [
    //     { orderNo: { $regex: search, $options: "i" } },
    //     { keyNo: { $regex: search, $options: "i" } },
    //   ];
    // }

    // Date range filter
    const fromDate = parseDateFilter(dateFrom);
    const toDate = parseDateFilter(dateTo);
    if (fromDate || toDate) {
      filter.orderDate = {};
      if (fromDate) filter.orderDate.$gte = fromDate;
      if (toDate)
        filter.orderDate.$lte = new Date(toDate.setHours(23, 59, 59, 999));
    }

    // Customer filter
    if (customer) {
      filter.customer = customer;
    }

    // Brand filter
    if (brand) {
      filter.brand = brand;
    }
    // Season filter
    if (season) {
      filter.season = season;
    }

    const skip = (page - 1) * limit;
    let orders = await Order.find(filter)
      .populate("customer", "name")
      .populate("fabricSupplier", "name")
      .populate("style", "name styleNo")
      .populate("fabric", "name color")
      .populate("brand", "name")
      .populate("defects")
      .populate({
        path: "fabric",
        populate: {
          path: "fabricCompositions",
          populate: { path: "compositionItem", select: "name abbrPrefix" },
        },
      })
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    // .cache(false); // Disable caching for this query

    // Calculate defect rates
    orders = orders.map((order) => {
      const totalDefects = order.defects.reduce(
        (sum, defect) => sum + (defect.defectCount || 0),
        0
      );

      const defectRate =
        order.orderQty > 0 ? (totalDefects / order.orderQty) * 100 : 0;

      return {
        ...order.toObject(),
        totalDefectCount: totalDefects,
        defectRate: parseFloat(defectRate.toFixed(2)),
      };
    });

    // Apply defect rate filters after calculation
    if (minDefectRate || maxDefectRate) {
      orders = orders.filter((order) => {
        const rate = order.defectRate;
        return (
          (minDefectRate ? rate >= parseFloat(minDefectRate) : true) &&
          (maxDefectRate ? rate <= parseFloat(maxDefectRate) : true)
        );
      });
    }

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
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

    if (
      existingOrder &&
      (!req.params.id || req.params.id !== existingOrder._id.toString())
    ) {
      return res.status(400).json({ message: "Order number already exists." });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found." });

    updatedOrder.stageProgress = calculateProgress(updatedOrder.currentStage);
    res
      .status(200)
      .json({ message: "Order Updated Successfully", updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

// ✅ **Delete an Order**
exports.deleteOrder = async (req, res) => {
  // try {
  //   await Order.findByIdAndDelete(req.params.id);
  //   res.status(200).json({ message: "Order deleted successfully" });
  // } catch (error) {
  //   res.status(500).json({ message: "Error deleting order", error });
  // }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check for existing defects
    const defectsExist = await mongoose
      .model("Defect")
      .exists({ orderId: order._id });

    if (defectsExist) {
      return res.status(400).json({
        message:
          "Order contains defects. Delete all defects before deleting this order.",
        defectsExist: true,
        orderId: order._id,
      });
    }

    // Proceed with deletion if no defects
    // await order.remove();
    // await Order.deleteOne({ _id: order._id });
    await Order.findByIdAndDelete(order._id); // Triggers the middleware in Order model
    // Usage:
    // const order = await Order.findById(orderId);
    // await order.deleteOne(); // Triggers the middleware

    res.status(200).json({
      message: "Order deleted successfully after checking defects & washRecipe",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting order",
      error: error.message,
    });
  }
};

// ✅ **Add Defect to Order**
exports.addDefectToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const newDefect = new Defect({ ...req.body, orderId });
    const savedDefect = await newDefect.save();

    await Order.findByIdAndUpdate(orderId, {
      $push: { defects: savedDefect._id },
    });

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
    res
      .status(500)
      .json({ message: "Error fetching defects for order", error });
  }
};
//********************************************************************************************************************************* */

// ! Tiger this is not used (Also in the frontend defectService.js => addDefectToOrder) also in routes
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

exports.getOrderStatistics = async (req, res) => {
  try {
    // 1. Build filters from req.query, just like getAllOrders
    const {
      search,
      style,
      dateFrom,
      dateTo,
      customer,
      brand,
      season,
      minDefectRate,
      maxDefectRate
    } = req.query;

    const filter = {};

    // Style filter
    if (style) filter.style = style;

    // Search (can include styleNo, orderNo, articleNo, keyNo)
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { orderNo: { $regex: safeSearch, $options: "i" } },
        { keyNo: { $regex: safeSearch, $options: "i" } },
        { styleNo: { $regex: safeSearch, $options: "i" } },
        { articleNo: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // Date range
    const fromDate = parseDateFilter(dateFrom);
    const toDate = parseDateFilter(dateTo);
    if (fromDate || toDate) {
      filter.orderDate = {};
      if (fromDate) filter.orderDate.$gte = fromDate;
      if (toDate)
        filter.orderDate.$lte = new Date(new Date(toDate).setHours(23, 59, 59, 999));
    }

    // Customer, Brand, Season
    if (customer) filter.customer = customer;
    if (brand) filter.brand = brand;
    if (season) filter.season = season;

    // 2. Fetch orders (with defects)
    let ordersRaw = await Order.find(filter)
      .populate("defects")
      .lean();

    // 3. Add totalDefectCount & defectRate per order
    let orders = ordersRaw.map((order) => {
      const totalDefectCount = (order.defects || []).reduce(
        (sum, defect) => sum + (defect.defectCount || 0),
        0
      );
      const defectRate =
        order.orderQty && order.orderQty > 0
          ? (totalDefectCount / order.orderQty) * 100
          : 0;
      return {
        ...order,
        totalDefectCount,
        defectRate: parseFloat(defectRate.toFixed(2)),
      };
    });

    // 4. Apply server-side defectRate filters (if present)
    if (minDefectRate || maxDefectRate) {
      orders = orders.filter((order) => {
        const rate = order.defectRate ?? 0; // fallback to 0
        return (
          (minDefectRate ? rate >= parseFloat(minDefectRate) : true) &&
          (maxDefectRate ? rate <= parseFloat(maxDefectRate) : true)
        );
      });
    }

    // 5. Calculate statistics on the filtered order list
    const totalOrders = orders.length;
    const totalQuantity = orders.reduce((sum, order) => sum + (order.orderQty || 0), 0);
    const totalDefects = orders.reduce(
      (sum, order) => sum + (order.totalDefectCount || 0),
      0
    );
    const avgDefectRate =
      totalQuantity > 0 ? (totalDefects / totalQuantity) * 100 : 0;

    const highDefectOrders = orders.filter(
      (order) => order.defectRate > 4
    ).length;
    const lowDefectOrders = orders.filter(
      (order) => order.defectRate <= 4
    ).length;

    // Recent orders (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentOrders = orders.filter((order) => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate > weekAgo;
    }).length;

    res.status(200).json({
      totalOrders,
      totalQuantity,
      totalDefects,
      avgDefectRate: parseFloat(avgDefectRate.toFixed(2)),
      highDefectOrders,
      lowDefectOrders,
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({ message: "Error fetching order statistics", error });
  }
};


