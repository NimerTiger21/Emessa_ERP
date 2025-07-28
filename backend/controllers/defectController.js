// controllers/defectController.js
const Defect = require("../models/defect/Defect");
const Order = require("../models/order/Order");
const fs = require("fs"); // Add this import at the top
const path = require("path"); // Add this line

// Log a new defect // Create a defect and associate it with an order
exports.createDefect = async (req, res) => {
  try {
    //console.log("Received defect data:", req.body); // Log submitted data for debugging
    //const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null; // Get image path if uploaded

    // In your controller or route handler
    let { details } = req.body;

    if (typeof details === "string") {
      try {
        details = JSON.parse(details);
      } catch (err) {
        return res.status(400).json({ error: "Invalid details format" });
      }
    }

    // Process new files
    // Process new uploaded files
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        imagePaths.push(file.path.replace(/\\/g, "/"));
        //imagePaths.push(`uploads/${file.filename}`);
      });
    }

    // Process existing images (for edit case)
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    // Create new defect with images
    const newDefect = new Defect({
      ...req.body,
      images: [...existingImages, ...imagePaths],
      //images: imagePaths
      details,
    });

    const savedDefect = await newDefect.save();

    // Associate the defect with the order
    // Double-check ID exists before update
    const orderExists = await Order.exists({ _id: savedDefect.orderId });
    if (orderExists) {
      await Order.findByIdAndUpdate(savedDefect.orderId, {
        $push: { defects: savedDefect._id },
      });
    } else {
      console.warn("Linked order does not exist");
    }

    // Populate the orderId field with orderNo
    const populatedDefect = await Defect.findById(savedDefect._id)
      .populate("defectName", "name")
      .populate("defectType", "name")
      .populate("orderId", "orderNo");

    res.status(201).json({
      message: "Backend: Defect created and associated with order",
      populatedDefect,
    });
  } catch (error) {
    res.status(400).json({ message: "Backend: Error logging defect", error });
  }
};

// Retrieve all defects with pagination, search, and sorting
exports.getDefects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "detectedDate",
      sortOrder = "desc",
      severity = "",
      defectType = "",
      defectName,
      productionLine,
      dateFrom,
      dateTo,
      //month = ""
      //detectedDate = ""
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    let filters = {};

    // Add search functionality
    if (search) {
      filters.$or = [
        { description: { $regex: search, $options: "i" } },
        // Add more searchable fields as needed
      ];

      // Also search in related order's orderNo
      const orders = await Order.find({
        orderNo: { $regex: search, $options: "i" },
      }).select("_id");

      const orderIds = orders.map((order) => order._id);
      if (orderIds.length > 0) {
        filters.$or.push({ orderId: { $in: orderIds } });
      }
    }

    // Add filter by severity if provided
    if (severity) {
      filters.severity = severity;
    }

    // Add filter by defectType if provided
    if (defectType) {
      filters.defectType = defectType;
    }

    if (defectName) filters.defectName = defectName;
    if (productionLine) filters.productionLine = productionLine;

    if (dateFrom && dateTo) {
      filters.detectedDate = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    // Add filter by month if provided
    // if (detectedDate) {
    //   filters.detectedDate = new Date(detectedDate).toLocaleString("default", { month: "long" });
    // }

    // Create sort object
    const sort = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Count total documents
    const totalDocuments = await Defect.countDocuments(filters);
    const totalPages = Math.ceil(totalDocuments / limitNum);

    // Fetch defects with pagination, filters, and sorting
    const defects = await Defect.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("orderId", "orderNo") // Populate orderId with only orderNo field
      .populate({
        path: "defectName",
        select: "name",
      })
      .populate({
        path: "defectType",
        select: "name",
      })
      .populate({
        path: "defectProcess",
        select: "name",
      });

    // Create pagination object
    const pagination = {
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalItems: totalDocuments,
    };

    res.status(200).json({ data: defects, pagination });
  } catch (error) {
    console.error("Error retrieving defects:", error);
    res.status(400).json({ message: "Error retrieving defects", error });
  }
};

// Retrieve a specific defect by ID
exports.getDefectById = async (req, res) => {
  //console.log("Fetching defect with ID:", req.params.id);
  try {
    const defect = await Defect.findById(req.params.id)
      //.populate("orderId", "orderNo") // Populate orderId with only orderNo field;
      .populate({
        path: "orderId",
        select: "orderNo season styleNo",
        populate: [
          { path: "style", select: "styleNo" },
          { path: "fabric", select: "name color" },
        ],
      })
      .populate({
        path: "defectName",
        select: "name",
      })
      .populate({
        path: "defectType",
        select: "name",
      })
      .populate({
        path: "defectPlace",
        select: "name",
      })
      .populate({
        path: "defectProcess",
        select: "name",
      })
      .populate({
        path: "details.defectPlace",
        select: "name",
      })
      .populate({
        path: "details.defectProcess",
        select: "name",
      })
      .exec();
    if (!defect) return res.status(404).json({ message: "Defect not found" });
    res.status(200).json(defect);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defect details", error });
  }
};

exports.updateDefect = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract relevant data from request
    const updates = { ...req.body };

    let { details } = updates;

    if (Array.isArray(details)) {
      // Filter out empty strings
      details = details.filter((item) => item && item.trim() !== "");

      // Parse any JSON strings inside
      details = details.flatMap((item) => {
        if (typeof item === "string") {
          try {
            const parsed = JSON.parse(item);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If parsing fails, ignore or handle error
            return [];
          }
        }
        // If already an object, return as is
        return [item];
      });
    } else if (typeof details === "string") {
      // If details is a single string (not array), parse it
      try {
        details = JSON.parse(details);
      } catch {
        details = [];
      }
    } else {
      // If details is undefined or invalid, set empty array
      details = [];
    }

    // Assign normalized details back to updates
    updates.details = details;

    // Process existing images that should be kept
    const existingImages = JSON.parse(req.body.existingImages || "[]").map(
      (filename) => `uploads/${filename}`
    );

    // Process images that should be permanently deleted
    const imagesToDelete = JSON.parse(req.body.imagesToDelete || "[]");

    // Find the existing defect
    const existingDefect = await Defect.findById(id);
    if (!existingDefect) {
      return res.status(404).json({ message: "Defect not found" });
    }

    // Delete files that are marked for deletion
    imagesToDelete.forEach((filename) => {
      const filePath = path.join(__dirname, "../uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filename}`);
      }
    });

    // Process newly uploaded files
    const newImagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        newImagePaths.push(`uploads/${file.filename}`);
      });
    }

    // Check for order ID change
    const orderChanged = existingDefect.orderId.toString() !== updates.orderId;

    // Update the defect with new data and combined image paths
    const updatedDefect = await Defect.findByIdAndUpdate(
      id,
      {
        ...updates,
        images: [...existingImages, ...newImagePaths],
      },
      { new: true, runValidators: true }
    );

    // Handle order association changes if needed
    if (orderChanged) {
      // Remove defect from old order
      await Order.findByIdAndUpdate(existingDefect.orderId, {
        $pull: { defects: existingDefect._id },
      });

      // Add defect to new order
      await Order.findByIdAndUpdate(updates.orderId, {
        $push: { defects: updatedDefect._id },
      });
    }

    // Return populated defect data
    const populatedDefect = await Defect.findById(updatedDefect._id)
      .populate("orderId", "orderNo")
      .populate("defectName", "name")
      .populate("defectType", "name")
      .populate("defectPlace", "name")
      .populate("defectProcess", "name");

    res.status(200).json(populatedDefect);
  } catch (error) {
    console.error("Error updating defect:", error);
    res.status(500).json({ message: "Error updating defect", error });
  }
};

exports.deleteDefect = async (req, res) => {
  try {
    const { id } = req.params;
    console.error("deleting Defect id:", id);

    // Find the defect by ID and delete it
    //const defectToDelete = await Defect.findByIdAndDelete(id);

    // Find the defect to delete
    const defectToDelete = await Defect.findById(id);
    if (!defectToDelete) {
      return res.status(404).json({ message: "Defect not found" });
    }

    // Delete all associated image files
    if (defectToDelete.images && defectToDelete.images.length > 0) {
      defectToDelete.images.forEach((imagePath) => {
        const filename = imagePath.split("/").pop();
        const filePath = path.join(__dirname, "../uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Remove defect from order's defects array
    if (defectToDelete && defectToDelete.orderId) {
      await Order.findByIdAndUpdate(defectToDelete.orderId, {
        $pull: { defects: defectToDelete._id },
      });
    }

    // Delete the defect record
    await Defect.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Defect and associated images deleted successfully" });
  } catch (error) {
    console.error("Error deleting defect:", error);
    res.status(500).json({ message: "Error deleting defect", error });
  }
};

exports.resolvedDefect = async (req, res) => {
  try {
    const defect = await Defect.findByIdAndUpdate(
      req.params.id,
      { status: "Resolved", resolvedDate: Date.now() },
      { new: true }
    );

    if (!defect) {
      return res.status(404).json({ message: "Defect not found" });
    }

    res.status(200).json({ message: "Defect resolved", defect });
  } catch (error) {
    res.status(500).json({ message: "Error resolving defect", error });
  }
};

// exports.getDefectAnalytics = async (req, res) => {
//   try {
//     const { defectId } = req.params;

//     // Get base defect data
//     const baseDefect = await Defect.findById(defectId)
//       .populate("defectName")
//       .populate("defectPlace");
//     if (!baseDefect)
//       return res.status(404).json({ message: "Defect not found" });

//     // Check if defectPlace exists before accessing its _id
//     const defectPlaceId = baseDefect.defectPlace
//       ? baseDefect.defectPlace._id
//       : null;

//     const similarDefects = await Defect.find({
//       defectName: baseDefect.defectName._id,
//       //defectPlace: baseDefect.defectPlace._id,
//       defectPlace: defectPlaceId, // Use the conditional value here
//     })
//       .populate("defectType", "name")
//       .populate("defectPlace", "name")
//       .populate("orderId", "orderNo style")
//       .sort({ detectedDate: -1 });

//     // Group for trend chart (monthly)
//     const trendMap = {};
//     similarDefects.forEach((defect) => {
//       const month = new Date(defect.detectedDate).toLocaleString("default", {
//         month: "short",
//       });
//       trendMap[month] = (trendMap[month] || 0) + 1;
//     });

//     const trendData = Object.entries(trendMap).map(([month, count]) => ({
//       month,
//       count,
//     }));

//     // Group for severity
//     const severityData = {};
//     similarDefects.forEach((d) => {
//       severityData[d.severity] = (severityData[d.severity] || 0) + 1;
//     });

//     const severityArr = Object.entries(severityData).map(([name, value]) => ({
//       name,
//       value,
//     }));

//     // Group for location/component
//     const locationData = {};
//     similarDefects.forEach((d) => {
//       //const key = d.defectPlace.name || "Unknown";
//       // Check if d.defectPlace exists before accessing its name
//       const key = d.defectPlace ? d.defectPlace.name : "Unknown";
//       locationData[key] = (locationData[key] || 0) + 1;
//     });

//     const locationArr = Object.entries(locationData).map(
//       ([location, count]) => ({ location, count })
//     );

//     // Format similar defects list
//     const similarFormatted = similarDefects.map((d) => ({
//       //id: d._id,
//       id: d.orderId.orderNo,
//       defectName: baseDefect.defectName.name,
//       status: d.status || "Open",
//       severity: d.severity,
//       component: d.component,
//       date: new Date(d.detectedDate).toLocaleDateString(),
//     }));

//     res.json({
//       trendData,
//       severityData: severityArr,
//       locationData: locationArr,
//       similarDefects: similarFormatted,
//     });
//   } catch (err) {
//     console.error("Error in getDefectAnalytics", err);
//     res.status(500).json({ message: "Error loading analytics" });
//   }
// };


exports.getDefectAnalytics = async (req, res) => {
  try {
    const { defectId } = req.params;

    const baseDefect = await Defect.findById(defectId)
      .populate("defectName")
      .populate("details.defectPlace")
      .populate("details.defectProcess");

    if (!baseDefect)
      return res.status(404).json({ message: "Defect not found" });

    // Find similar defects by defectName ONLY
    const similarDefects = await Defect.find({
      defectName: baseDefect.defectName._id,
    })
      .populate("defectType", "name")
      .populate("details.defectPlace", "name")
      .populate("details.defectProcess", "name")
      .populate("orderId", "orderNo style")
      .sort({ detectedDate: -1 });

    // 🔹 Monthly trend
    const trendMap = {};
    similarDefects.forEach((d) => {
      const month = new Date(d.detectedDate).toLocaleString("default", { month: "short" });
      // trendMap[month] = (trendMap[month] || 0) + 1;
      trendMap[month] = (trendMap[month] || 0) + (d.defectCount || 1); // <-- Add the effect value
    });

    const trendData = Object.entries(trendMap).map(([month, count]) => ({ month, count }));

    // 🔸 Severity grouping
    const severityData = {};
    similarDefects.forEach((d) => {
      // severityData[d.severity] = (severityData[d.severity] || 0) + 1;
      severityData[d.severity] = (severityData[d.severity] || 0) + (d.defectCount || 1); // <-- Add the effect value
    });

    const severityArr = Object.entries(severityData).map(([name, value]) => ({ name, value }));

    // 🔹 Location/component analysis (from details array)
    const locationData = {};
    const processData = {};

    similarDefects.forEach((defect) => {
      defect.details.forEach((detail) => {
        const place = detail.defectPlace?.name || "Unknown";
        locationData[place] = (locationData[place] || 0) + detail.count;

        const process = detail.defectProcess?.name || "Unknown";
        processData[process] = (processData[process] || 0) + detail.count;
      });
    });

    const locationArr = Object.entries(locationData).map(([location, count]) => ({ location, count }));
    const processArr = Object.entries(processData).map(([process, count]) => ({ process, count }));

    // 🔸 Format defect list
    const similarFormatted = similarDefects.map((d) => ({
      id: d.orderId?.orderNo || "Unknown",
      defectName: baseDefect.defectName.name,
      status: d.status || "Open",
      severity: d.severity,
      date: new Date(d.detectedDate).toLocaleDateString(),
    }));

    // 🧾 Final response
    res.json({
      trendData,
      severityData: severityArr,
      locationData: locationArr,
      processData: processArr,
      similarDefects: similarFormatted,
    });
  } catch (err) {
    console.error("Error in getDefectAnalytics", err);
    res.status(500).json({ message: "Error loading analytics" });
  }
};
