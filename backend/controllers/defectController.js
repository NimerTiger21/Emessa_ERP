// controllers/defectController.js
const Defect = require("../models/Defect");
const Order = require("../models/Order");
const fs = require('fs'); // Add this import at the top
const path = require('path'); // Add this line

// Log a new defect // Create a defect and associate it with an order
exports.createDefect = async (req, res) => {
  try {
    //console.log("Received defect data:", req.body); // Log submitted data for debugging

    const { orderId, defectType, defectName, description, severity, defectCount, productionLine } = req.body;
    //const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null; // Get image path if uploaded

    
// if (req.files && req.files.images) {
//   req.files.images.forEach(file => {
//     imagePaths.push(file.path.replace(/\\/g, "/"));
//   });
// }

// // For existing images (edit case)
// const existingImages = req.body.existingImages 
//   ? JSON.parse(req.body.existingImages) 
//   : [];

// Process new files
// Process new uploaded files
const imagePaths = [];
if (req.files && req.files.length > 0) {
  req.files.forEach(file => {
    imagePaths.push(file.path.replace(/\\/g, "/"));
    //imagePaths.push(`uploads/${file.filename}`);
  });
}

// Process existing images (for edit case)
const existingImages = req.body.existingImages 
  ? JSON.parse(req.body.existingImages) 
  : [];

    //console.log("Image path:", imagePath);  // Log the image path for debugging | Image path: uploads\1731320027611-test.jpg
     // Check if an image file was uploaded
     /**
      * The issue is likely due to the fact that Windows systems use backslashes (\) as the default path separator,
      *  while URLs require forward slashes (/). When multer saves the file path on a Windows machine, it may use backslashes,
      *  which can cause issues when you try to display the image in a web application.
      */
    //  if (req.file) {
    //   imagePath = req.file.path.replace(/\\/g, "/"); // Convert backslashes to forward slashes
    // }

    // const newDefect = new Defect({
    //   orderId,
    //   defectType,
    //   defectName,
    //   description,
    //   severity,
    //   defectCount,
    //   detectedDate,
    //   //image: imagePath, // Save the image path in the database
    //   images: [...existingImages, ...imagePaths],
    //   month, // New field
    //   productionLine, // New field
    // });

    // Create new defect with images
    const newDefect = new Defect({
      ...req.body,
      images: [...existingImages, ...imagePaths]
      //images: imagePaths
    });

    // Create a new defect
    //const newDefect = new Defect(defectData);
    const savedDefect = await newDefect.save();

    // Associate the defect with the order
    await Order.findByIdAndUpdate(newDefect.orderId, {
      $push: { defects: savedDefect._id },
    });

    // Populate the orderId field with orderNo
    const populatedDefect = await Defect.findById(savedDefect._id)
    .populate("defectName", "name")
    .populate("defectType", "name")
    .populate("orderId", "orderNo");

    res.status(201).json({ message: "Backend: Defect created and associated with order", populatedDefect });
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
        { description: { $regex: search, $options: 'i' } },
        // Add more searchable fields as needed
      ];
      
      // Also search in related order's orderNo
      const orders = await Order.find({ 
        orderNo: { $regex: search, $options: 'i' } 
      }).select('_id');
      
      const orderIds = orders.map(order => order._id);
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
    
    // Add filter by month if provided
    // if (detectedDate) {
    //   filters.detectedDate = new Date(detectedDate).toLocaleString("default", { month: "long" });
    // }
    
    
    // Create sort object
    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    
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
        select: "name"
      })
      .populate({
        path: "defectType",
        select: "name"
      })
      .populate({
        path: "defectProcess",
        select: "name"
      });
      
    // Create pagination object
    const pagination = {
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalItems: totalDocuments
    };
    
    res.status(200).json({ data: defects, pagination });
  } catch (error) {
    console.error("Error retrieving defects:", error);
    res.status(400).json({ message: "Error retrieving defects", error });
  }
};

// Update defect status
exports.updateDefectStatus = async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;

  try {
    const defect = await Defect.findById(id);
    if (!defect) return res.status(404).json({ message: "Defect not found" });

    defect.status = status;
    defect.assignedTo = assignedTo || defect.assignedTo;
    
    // Set resolved date if status is resolved
    if (status === "Resolved") defect.resolvedDate = new Date();

    await defect.save();
    res.status(200).json(defect);
  } catch (error) {
    res.status(500).json({ message: "Error updating defect status", error });
  }
};

// Add resolution details
exports.addResolution = async (req, res) => {
  const { id } = req.params;
  const { actionTaken, verifiedBy } = req.body;

  try {
    const defect = await Defect.findById(id);
    if (!defect) return res.status(404).json({ message: "Defect not found" });

    defect.resolution = {
      actionTaken,
      verifiedBy,
      resolutionDate: new Date()
    };
    defect.status = "Resolved";
    defect.resolvedDate = new Date();

    await defect.save();
    res.status(200).json(defect);
  } catch (error) {
    res.status(500).json({ message: "Error adding resolution", error });
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
      select: "orderNo season",
      populate: [
        { path: "style", select: "styleNo" },
        { path: "fabric", select: "name color" }
      ]
    })    
    .populate({
      path: "defectName",
      select: "name"
    })
    .populate({
      path: "defectType",
      select: "name"
    })
    .populate({
      path: "defectPlace",
      select: "name"
    })    
    .populate({
      path: "defectProcess",
      select: "name"
    })    
    .exec();
    if (!defect) return res.status(404).json({ message: "Defect not found" });
    res.status(200).json(defect);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defect details", error });
  }
};
// // Update an existing defect
exports.updateDefect = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Extract relevant data from request
    const updates = { ...req.body };
    
    // Process existing images that should be kept
    const existingImages = JSON.parse(req.body.existingImages || '[]')
      .map(filename => `uploads/${filename}`);
    
    // Process images that should be permanently deleted
    const imagesToDelete = JSON.parse(req.body.imagesToDelete || '[]');
    
    // Find the existing defect
    const existingDefect = await Defect.findById(id);
    if (!existingDefect) {
      return res.status(404).json({ message: "Defect not found" });
    }
    
    // Delete files that are marked for deletion
    imagesToDelete.forEach(filename => {
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filename}`);
      }
    });
    
    // Process newly uploaded files
    const newImagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
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
        images: [...existingImages, ...newImagePaths]
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
      defectToDelete.images.forEach(imagePath => {
        const filename = imagePath.split('/').pop();
        const filePath = path.join(__dirname, '../uploads', filename);
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

    res.status(200).json({ message: "Defect and associated images deleted successfully" });
  } catch (error) {
    console.error("Error deleting defect:", error);
    res.status(500).json({ message: "Error deleting defect", error });
  }

    // try {
    //   const defect = await Defect.findById(req.params.id);
    //   console.error("req.params.id: ", req.params.id);
    //   console.error("deleting defect:", defect);
    //   if (!defect) {
    //     console.error("Inside If:");
    //     return res.status(404).json({ message: "Defect not found" });
    //   }
    //   console.error("before defect.remove():");
    //   await defect.remove(); // Triggers the middleware
    //   console.error("After defect.remove():");
    //   res.status(200).json({ message: "Defect deleted successfully" });
    // } catch (error) {
    //   res.status(500).json({ message: "Error deleting defect", error });
    // }
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

// In defectController.js
exports.deleteDefectImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    console.log("Frontend requested image deletion:", imageUrl);
    //Deleting image: /uploads/1745146002911-475869920_3891648604438047_7496538017901830525_n.jpg

    // For now, we just return success - actual deletion happens during form submission
    // This approach allows for "undo" functionality
    
/*
    // 1. Remove the physical file
    const filename = imageUrl.split('/').pop();
    console.log("filename: ", filename);
    // filename:  1745146002911-475869920_3891648604438047_7496538017901830525_n.jpg
    
    const filePath = path.join(__dirname, '../uploads', filename);
    // filePath:  C:\2024.03.21\Web\2024.10.30_emessa\emessa - Copy\backend\uploads\1745146002911-475869920_3891648604438047_7496538017901830525_n.jpg 
    console.log("filePath: ", filePath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // 2. Update the defect document to remove the image reference
    const updatedDefect = await Defect.findByIdAndUpdate(
      id,
      { $pull: { images: imageUrl } },
      { new: true }
    );
    
*/
    if (!updatedDefect) {
      return res.status(404).json({ message: "Defect not found" });
    }
    
    res.status(200).json({ message: "Image marked for deletion", imageUrl });
  } catch (error) {
    console.error("Error marking image for deletion:", error);
    res.status(500).json({ message: "Error processing image deletion request", error });
  }
};


exports.getDefectAnalytics = async (req, res) => {
  try {
    const { defectId } = req.params;

    // Get base defect data
    const baseDefect = await Defect.findById(defectId).populate("defectName").populate("defectPlace");
    if (!baseDefect) return res.status(404).json({ message: "Defect not found" });

    // Check if defectPlace exists before accessing its _id
    const defectPlaceId = baseDefect.defectPlace ? baseDefect.defectPlace._id : null;

    const similarDefects = await Defect.find({
      defectName: baseDefect.defectName._id,
      //defectPlace: baseDefect.defectPlace._id,
      defectPlace: defectPlaceId, // Use the conditional value here
    })
    .populate("defectType", "name")
    .populate("defectPlace", "name")
    .populate("orderId", "orderNo style")
    .sort({ detectedDate: -1 });

    // Group for trend chart (monthly)
    const trendMap = {};
    similarDefects.forEach((defect) => {
      const month = new Date(defect.detectedDate).toLocaleString("default", { month: "short" });
      trendMap[month] = (trendMap[month] || 0) + 1;
    });

    const trendData = Object.entries(trendMap).map(([month, count]) => ({ month, count }));

    // Group for severity
    const severityData = {};
    similarDefects.forEach((d) => {
      severityData[d.severity] = (severityData[d.severity] || 0) + 1;
    });

    const severityArr = Object.entries(severityData).map(([name, value]) => ({ name, value }));

    // Group for location/component
    const locationData = {};
    similarDefects.forEach((d) => {
      //const key = d.defectPlace.name || "Unknown";
      // Check if d.defectPlace exists before accessing its name
      const key = d.defectPlace ? d.defectPlace.name : "Unknown";
      locationData[key] = (locationData[key] || 0) + 1;
    });

    const locationArr = Object.entries(locationData).map(([location, count]) => ({ location, count }));

    // Format similar defects list
    const similarFormatted = similarDefects.map((d) => ({
      //id: d._id,
      id: d.orderId.orderNo,
      defectName: baseDefect.defectName.name,
      status: d.status || "Open",
      severity: d.severity,
      component: d.component,
      date: new Date(d.detectedDate).toLocaleDateString(),
    }));

    res.json({
      trendData,
      severityData: severityArr,
      locationData: locationArr,
      similarDefects: similarFormatted,
    });
  } catch (err) {
    console.error("Error in getDefectAnalytics", err);
    res.status(500).json({ message: "Error loading analytics" });
  }
};

