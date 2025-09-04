// controllers/masterDataController.js
const Style = require("../models/order/Style");
const CustomAccount = require("../models/order/CustomAccount");
const Fabric = require("../models/fabric/Fabric");
const CompositionItem = require("../models/fabric/CompositionItem");
const FabricComposition = require("../models/fabric/FabricComposition");
const Brand = require("../models/order/Brand");
const DefectType = require("../models/defect/DefectType");
const DefectName = require("../models/defect/DefectName");
const DefectPlace = require("../models/defect/DefectPlace");
const DefectProcess = require("../models/defect/DefectProcess");


const multer = require('multer');
const path = require('path');
const fs = require('fs');

exports.getStyles = async (req, res) => {
  try {
    const styles = await Style.find()
      .select("_id name styleNo brand")
      .populate({
        path: "brand",
        select: "_id name customer",
        populate: {
          path: "customer",
          select: "name",
        },
      });
    res.status(200).json(styles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching styles", error });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await CustomAccount.find({ type: "Customer" }).select(
      "_id name"
    );
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

exports.getFabricSuppliers = async (req, res) => {
  try {
    const suppliers = await CustomAccount.find({ type: "Supplier" })
      .select("_id name")
      .sort({ name: 1 }); // Sort by name in ascending order;
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fabric suppliers", error });
  }
};
//***********!**********************! */
/*
exports.createOrUpdateFabricWithCompositions = async (req, res) => {
  try {
    const { name, code, color, supplier, compositions } = req.body;
    //console.log(req.params.fabricId);
    const fabricId = req.params.fabricId;
    let fabric;

    // 🔹 **Step 1: Check if updating or creating**
    if (fabricId) {
      fabric = await Fabric.findById(fabricId);
      if (!fabric) return res.status(404).json({ message: "Fabric not found" });

      // **🔹 Check if another fabric already uses this code**
      // **🔹 Prevent duplicate fabric codes**
      // const existingFabric = await Fabric.findOne({ code, _id: { $ne: fabricId } });
      // if (existingFabric) {
      //   return res.status(400).json({ message: `Fabric code "${code}" already exists.` });
      // }

      // Update existing fabric fields
      fabric.name = name;
      fabric.code = code;
      fabric.color = color;
      fabric.supplier = supplier;
      await fabric.save();

      // 🔹 **Step 2: Remove old compositions & insert new ones**
      await FabricComposition.deleteMany({ fabric: fabric._id });
    } else {
      // Check if fabric code already exists before creating
      // const existingFabric = await Fabric.findOne({ code });
      // if (existingFabric) {
      //   return res.status(400).json({ message: `Fabric code "${code}" already exists.` });
      // }

      // Create new fabric
      fabric = new Fabric({ name, code, color, supplier });
      await fabric.save();
    }

    // 🔹 **Step 3: Create & Save Fabric Compositions**
    const fabricCompositions = compositions.map((comp) => ({
      fabric: fabric._id,
      compositionItem: comp.compositionCode,
      value: comp.value,
    }));

    await FabricComposition.insertMany(fabricCompositions);

    // 🔹 **Step 4: Return fabric with compositions & supplier**
    const populatedFabric = await Fabric.findById(fabric._id)
      .populate("supplier", "name") // Populate supplier name
      .populate({
        path: "fabricCompositions",
        populate: { path: "compositionItem", select: "name abbrPrefix" },
      });

    res.status(200).json({
      message: fabricId
        ? "Fabric updated successfully"
        : "Fabric created successfully",
      fabric: populatedFabric,
    });
  } catch (error) {
    console.error("Error in createOrUpdateFabricWithCompositions:", error);
    res.status(500).json({ message: "Error creating/updating fabric" });
  }
};

exports.getFabrics = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "name",
      sortOrder = "desc",
      search,
    } = req.query;

    const filter = {};

    if (req.query.supplier) {
      filter.supplier = req.query.supplier; // Filter by supplier if provided
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (page - 1) * limit;

    const fabrics = await Fabric.find(filter)
      // .select("_id name supplier color code")
      .populate("supplier", "name") // Populate Supplier Name
      .populate({
        path: "fabricCompositions",
        populate: { path: "compositionItem", select: "name abbrPrefix" },
      })
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Fabric.countDocuments(filter);

    res.status(200).json({
      data: fabrics,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching styles", error });
  }
};
*/
//********************************! */
/*
exports.createOrUpdateFabricWithCompositions = async (req, res) => {
  try {
    // const { name, code, color, supplier, compositions, technicalSpecs } = req.body;
    const { name, code, color, supplier } = req.body;
    // Parse the JSON strings to objects
    const compositions = req.body.compositions ? JSON.parse(req.body.compositions) : [];
    const technicalSpecs = req.body.technicalSpecs ? JSON.parse(req.body.technicalSpecs) : {};

    console.log("Received data:", { name, code, color, supplier, compositions, technicalSpecs });
    const fabricId = req.params.fabricId;
    let fabric;

    // Handle file upload if exists
    const tdsFile = req.file ? {
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    } : null;

    // 🔹 Step 1: Check if updating or creating
    if (fabricId) {
      fabric = await Fabric.findById(fabricId);
      if (!fabric) return res.status(404).json({ message: "Fabric not found" });

      // Update existing fabric fields
      fabric.name = name;
      fabric.code = code;
      fabric.color = color;
      fabric.supplier = supplier;
      
      // Update technical specs if provided
      if (technicalSpecs) {
        fabric.technicalSpecs = {
          tensileWarp: technicalSpecs.tensileWarp,
          tensileWeft: technicalSpecs.tensileWeft,
          tearWarp: technicalSpecs.tearWarp,
          tearWeft: technicalSpecs.tearWeft,
          weight: technicalSpecs.weight,
          elasticity: technicalSpecs.elasticity
        };
      }
      
      // Update TDS file if uploaded
      if (tdsFile) {
        fabric.tdsFile = tdsFile;
      }

      await fabric.save();

      // 🔹 Step 2: Remove old compositions & insert new ones
      await FabricComposition.deleteMany({ fabric: fabric._id });
    } else {
      // Create new fabric with all fields
      fabric = new Fabric({ 
        name, 
        code, 
        color, 
        supplier,
        technicalSpecs: technicalSpecs ? {
          tensileWarp: technicalSpecs.tensileWarp,
          tensileWeft: technicalSpecs.tensileWeft,
          tearWarp: technicalSpecs.tearWarp,
          tearWeft: technicalSpecs.tearWeft,
          weight: technicalSpecs.weight,
          elasticity: technicalSpecs.elasticity
        } : null,
        tdsFile: tdsFile
      });
      await fabric.save();
    }

    // 🔹 Step 3: Create & Save Fabric Compositions
    const fabricCompositions = compositions.map((comp) => ({
      fabric: fabric._id,
      compositionItem: comp.compositionCode,
      value: comp.value,
    }));

    await FabricComposition.insertMany(fabricCompositions);

    // 🔹 Step 4: Return fabric with compositions & supplier
    const populatedFabric = await Fabric.findById(fabric._id)
      .populate("supplier", "name") // Populate supplier name
      .populate({
        path: "fabricCompositions",
        populate: { path: "compositionItem", select: "name abbrPrefix" },
      });

    res.status(200).json({
      message: fabricId
        ? "Fabric updated successfully"
        : "Fabric created successfully",
      fabric: populatedFabric,
    });
  } catch (error) {
    console.error("Error in createOrUpdateFabricWithCompositions:", error);
    res.status(500).json({ message: "Error creating/updating fabric" });
  }
};

exports.getFabrics = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "name",
      sortOrder = "desc",
      search,
    } = req.query;

    const filter = {};

    if (req.query.supplier) {
      filter.supplier = req.query.supplier;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }
    
    const skip = (page - 1) * limit;

    const fabrics = await Fabric.find(filter)
      .populate("supplier", "name")
      .populate({
        path: "fabricCompositions",
        populate: { path: "compositionItem", select: "name abbrPrefix" },
      })
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Fabric.countDocuments(filter);

    res.status(200).json({
      data: fabrics,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching fabrics", error });
  }
};
*/
//********************************! */

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/tds-files/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter to accept only PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Middleware for handling file upload
exports.uploadTDS = upload.single('tdsFile');

// Enhanced create/update fabric function
exports.createOrUpdateFabricWithCompositions = async (req, res) => {
  try {
    const { name, code, color, supplier, compositions, technicalSpecs } = req.body;
    const fabricId = req.params.fabricId;
    let fabric;

    // Parse JSON strings if they come as strings (FormData sends JSON as strings)
    let parsedCompositions, parsedTechnicalSpecs;
    
    try {
      parsedCompositions = typeof compositions === 'string' ? JSON.parse(compositions) : compositions;
      parsedTechnicalSpecs = typeof technicalSpecs === 'string' ? JSON.parse(technicalSpecs) : technicalSpecs;
    } catch (parseError) {
      return res.status(400).json({ message: "Invalid JSON format in request data" });
    }

    // 🔹 **Step 1: Check if updating or creating**
    if (fabricId) {
      fabric = await Fabric.findById(fabricId);
      if (!fabric) return res.status(404).json({ message: "Fabric not found" });

      // Update existing fabric fields
      fabric.name = name;
      fabric.code = code;
      fabric.color = color;
      fabric.supplier = supplier;
      fabric.technicalSpecs = parsedTechnicalSpecs || {};

      // Handle TDS file upload
      if (req.file) {
        // Delete old file if exists
        if (fabric.tdsFile && fabric.tdsFile.filePath) {
          try {
            fs.unlinkSync(fabric.tdsFile.filePath);
          } catch (err) {
            console.warn('Could not delete old TDS file:', err.message);
          }
        }

        // Set new file info
        fabric.tdsFile = {
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          uploadDate: new Date(),
          mimeType: req.file.mimetype
        };
      }

      await fabric.save();

      // 🔹 **Step 2: Remove old compositions & insert new ones**
      await FabricComposition.deleteMany({ fabric: fabric._id });
    } else {
      // Create new fabric
      const fabricData = {
        name,
        code,
        color,
        supplier,
        technicalSpecs: parsedTechnicalSpecs || {}
      };

      // Handle TDS file upload for new fabric
      if (req.file) {
        fabricData.tdsFile = {
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          uploadDate: new Date(),
          mimeType: req.file.mimetype
        };
      }

      fabric = new Fabric(fabricData);
      await fabric.save();
    }

    // 🔹 **Step 3: Create & Save Fabric Compositions**
    if (parsedCompositions && parsedCompositions.length > 0) {
      const fabricCompositions = parsedCompositions.map((comp) => ({
        fabric: fabric._id,
        compositionItem: comp.compositionCode,
        value: comp.value,
      }));
      await FabricComposition.insertMany(fabricCompositions);
    }

    // 🔹 **Step 4: Return fabric with compositions & supplier**
    const populatedFabric = await Fabric.findById(fabric._id)
      .populate("supplier", "name") // Populate supplier name
      .populate({
        path: "fabricCompositions",
        populate: { path: "compositionItem", select: "name abbrPrefix" },
      });

    res.status(200).json({
      message: fabricId
        ? "Fabric updated successfully"
        : "Fabric created successfully",
      fabric: populatedFabric,
    });
  } catch (error) {
    console.error("Error in createOrUpdateFabricWithCompositions:", error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.warn('Could not delete uploaded file after error:', unlinkError.message);
      }
    }

    res.status(500).json({ 
      message: "Error creating/updating fabric",
      error: error.message 
    });
  }
};

// Enhanced get fabrics function
exports.getFabrics = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortField = "name",
      sortOrder = "desc",
      search,
    } = req.query;
    
    const filter = {};
    
    if (req.query.supplier) {
      filter.supplier = req.query.supplier; // Filter by supplier if provided
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const fabrics = await Fabric.find(filter)
      .populate("supplier", "name") // Populate Supplier Name
      .populate({
        path: "fabricCompositions",
        populate: { path: "compositionItem", select: "name abbrPrefix" },
      })
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Fabric.countDocuments(filter);

    res.status(200).json({
      data: fabrics,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    res.status(500).json({ message: "Error fetching fabrics", error: error.message });
  }
};

// Get single fabric with full details
exports.getFabricById = async (req, res) => {
  try {
    const fabricId = req.params.fabricId;
    
    const fabric = await Fabric.findById(fabricId)
      .populate("supplier", "name email phone") // Populate full supplier details
      .populate({
        path: "fabricCompositions",
        populate: { path: "compositionItem", select: "name abbrPrefix description" },
      });

    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    res.status(200).json({
      message: "Fabric retrieved successfully",
      fabric: fabric,
    });
  } catch (error) {
    console.error('Error fetching fabric:', error);
    res.status(500).json({ message: "Error fetching fabric", error: error.message });
  }
};

// Download TDS file
exports.downloadTDS = async (req, res) => {
  try {
    const fabricId = req.params.fabricId;
    
    const fabric = await Fabric.findById(fabricId);
    
    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    if (!fabric.tdsFile || !fabric.tdsFile.filePath) {
      return res.status(404).json({ message: "TDS file not found for this fabric" });
    }

    const filePath = fabric.tdsFile.filePath;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "TDS file not found on server" });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${fabric.tdsFile.fileName}"`);
    res.setHeader('Content-Type', fabric.tdsFile.mimeType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading TDS file:', error);
    res.status(500).json({ message: "Error downloading TDS file", error: error.message });
  }
};

// Delete fabric (enhanced with file cleanup)
exports.deleteFabric = async (req, res) => {
  try {
    const fabricId = req.params.fabricId;
    
    const fabric = await Fabric.findById(fabricId);
    
    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    // Delete TDS file if exists
    if (fabric.tdsFile && fabric.tdsFile.filePath) {
      try {
        fs.unlinkSync(fabric.tdsFile.filePath);
      } catch (err) {
        console.warn('Could not delete TDS file:', err.message);
      }
    }

    // Delete fabric compositions
    await FabricComposition.deleteMany({ fabric: fabricId });
    
    // Delete fabric
    await Fabric.findByIdAndDelete(fabricId);

    res.status(200).json({
      message: "Fabric deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting fabric:', error);
    res.status(500).json({ message: "Error deleting fabric", error: error.message });
  }
};

// Get all fabrics for export (without pagination)
exports.getAllFabricsForExport = async (req, res) => {
  try {
    const fabrics = await Fabric.find()
      .populate("supplier", "name")
      .populate({
        path: "fabricCompositions",
        populate: { path: "compositionItem", select: "name abbrPrefix" },
      })
      .sort({ name: 1 });

    res.status(200).json({
      message: "All fabrics retrieved successfully",
      data: fabrics,
    });
  } catch (error) {
    console.error('Error fetching all fabrics:', error);
    res.status(500).json({ message: "Error fetching all fabrics", error: error.message });
  }
};
//********************************! */


// New function to handle file upload separately
exports.uploadTdsFile = async (req, res) => {
  try {
    const fabricId = req.params.fabricId;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const tdsFile = {
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype
    };

    const fabric = await Fabric.findByIdAndUpdate(
      fabricId,
      { tdsFile },
      { new: true }
    );

    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    res.status(200).json({
      message: "TDS file uploaded successfully",
      fabric
    });
  } catch (error) {
    console.error("Error uploading TDS file:", error);
    res.status(500).json({ message: "Error uploading TDS file" });
  }
};
//*************! */
exports.deleteFabric = async (req, res) => {
  try {
    const { id } = req.params;
    await FabricComposition.deleteMany({ fabric: id }); // Delete related compositions
    await Fabric.findByIdAndDelete(id);
    res.status(200).json({ message: "Fabric deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting fabric", error });
  }
};

// Fetch all composition items
exports.getAllCompositionItems = async (req, res) => {
  try {
    const compositionItems = await CompositionItem.find().select(
      "_id name abbrPrefix"
    );
    res.json(compositionItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching composition items" });
  }
};

// Create a new fabric with compositions
// exports.createFabricwithCompositions = async (req, res) => {
//   try {
//       const { name, code, color, supplier, compositions } = req.body;
//       //console.log(name, code, color, supplier, compositions);

//       // Step 1: Create the fabric
//       const newFabric = new Fabric({ name, code, color, supplier });
//       await newFabric.save();

//       // Step 2: Create fabric compositions
//       const fabricCompositions = compositions.map(comp => ({
//           fabric: newFabric._id,
//           compositionItem: comp.compositionCode,
//           value: comp.value
//       }));

//       await FabricComposition.insertMany(fabricCompositions);

//       // Step 3: Return fabric along with compositions
//       const populatedFabric = await Fabric.findById(newFabric._id).populate({
//       path: "fabricCompositions",
//       populate: { path: "compositionItem", select: "name abbrPrefix" }
//     });
//       res.status(201).json({ message: "Fabric created successfully", fabric: populatedFabric });
//   } catch (error) {
//       res.status(500).json({ message: "Error creating fabric" });
//   }
// };

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().select("_id name customer");
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Error fetching styles", error });
  }
};
exports.createStyle = async (req, res) => {
  try {
    const { customer, brand, styleName, styleNo } = req.body;

    // Filter out empty strings from styleNo array
    const filteredStyleNo = Array.isArray(styleNo)
      ? styleNo.filter((num) => num && num.trim() !== "")
      : [];

    // Create style
    const newStyle = new Style({
      brand,
      name: styleName,
      styleNo: filteredStyleNo,
    });
    await newStyle.save();

    // Populate the brand information for the response
    // const populatedStyle = await Style.findById(newStyle._id).populate({
    //   path: "brand",
    //   select: "_id name customer",
    //   populate: {
    //     path: "customer",
    //     select: "name",
    //   },
    // });

    res
      .status(201)
      .json({ message: "Style created successfully", style: newStyle });
  } catch (error) {
    res.status(500).json({ message: "Error creating style" });
  }
};

exports.updateStyle = async (req, res) => {
  const { customer, brand, styleName, styleNo } = req.body;
  // console.log("Updating style:", { customer, brand, styleName, styleNo });
  // Filter out empty strings from styleNo array
  const filteredStyleNo = Array.isArray(styleNo)
    ? styleNo.filter((num) => num && num.trim() !== "")
    : [];
  const updatedStyle = await Style.findByIdAndUpdate(
      req.params.id, 
      { 
        customer, 
        brand, 
        name: styleName, 
        styleNo: filteredStyleNo 
      }, 
      { new: true }
    ).populate({
      path: "brand",
      select: "_id name customer",
      populate: {
        path: "customer",
        select: "name"
      }
    });
  if (!updatedStyle) {
      return res.status(404).json({ message: "Style not found" });
    }
  res.status(200).json({
      message: "Style updated successfully",
      style: updatedStyle
    });
};

exports.deleteStyle = async (req, res) => {
  try {
    const deletedStyle = await Style.findByIdAndDelete(req.params.id);
    if (!deletedStyle) {
      return res.status(404).json({ message: "Style not found" });
    }
    res.status(200).json({ message: "Style deleted successfully" });
  } catch (error) {
    console.error("Error deleting style:", error);
    res.status(500).json({ message: "Error deleting style", error: error.message });
  }
};

exports.getDefectTypes = async (req, res) => {
  try {
    const defectType = await DefectType.find().select("_id name");
    res.status(200).json(defectType);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defectType", error });
  }
};

exports.getDefectNames = async (req, res) => {
  try {
    const defectName = await DefectName.find()
      .select("_id name")
      .populate("type", "_id");
    res.status(200).json(defectName);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defectName", error });
  }
};

exports.getDefectPlaces = async (req, res) => {
  try {
    const defectPlace = await DefectPlace.find().select("_id name");
    res.status(200).json(defectPlace);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defectPlace", error });
  }
};

exports.getDefectProcesses = async (req, res) => {
  try {
    const defectProcess = await DefectProcess.find()
      .select("_id name")
      .populate("place", "_id");
    res.status(200).json(defectProcess);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defectProcess", error });
  }
};
