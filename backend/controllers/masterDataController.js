// controllers/masterDataController.js
const Style = require("../models/order/Style");
const CustomAccount = require("../models/order/CustomAccount");
const Fabric = require("../models/order/Fabric");
const CompositionItem = require("../models/order/CompositionItem");
const FabricComposition = require("../models/order/FabricComposition");
const Brand = require("../models/order/Brand");
const DefectType = require("../models/DefectType");
const DefectName = require("../models/DefectName");
const DefectPlace = require("../models/DefectPlace");
const DefectProcess = require("../models/DefectProcess");

exports.getStyles = async (req, res) => {
  try {
    const styles = await Style.find()
  .select("_id name styleNo brand")
  .populate({
    path: "brand",
    select: "_id name customer",
    populate: {
      path: "customer",
      select: "name"
    }
  });
    res.status(200).json(styles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching styles", error });
  }
};

// exports.getStyles = async (req, res) => {
//   try {
//     const { brand } = req.query;
//     let query = Style.find();
    
//     if (brand) {
//       query = query.where('brand').equals(brand);
//     }
    
//     const styles = await query
//       .select("_id name styleNo brand")
//       .populate({
//         path: "brand",
//         select: "name customer",
//         populate: {
//           path: "customer",
//           select: "name"
//         }
//       });
      
//     res.status(200).json(styles);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching styles", error });
//   }
// };

exports.getCustomers = async (req, res) => {
  try {
    const customers = await CustomAccount.find({ type: "Customer" }).select("_id name");
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

exports.getFabricSuppliers = async (req, res) => {
  try {
    const suppliers = await CustomAccount.find({ type: "Supplier" }).select("_id name").sort({ name: 1 }); // Sort by name in ascending order;
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fabric suppliers", error });
  }
};
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
    const fabricCompositions = compositions.map(comp => ({
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
        populate: { path: "compositionItem", select: "name abbrPrefix" }
      });

    res.status(200).json({
      message: fabricId ? "Fabric updated successfully" : "Fabric created successfully",
      fabric: populatedFabric
    });

  } catch (error) {
    console.error("Error in createOrUpdateFabricWithCompositions:", error);
    res.status(500).json({ message: "Error creating/updating fabric" });
  }
};
exports.getFabrics = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, sortField = "name", sortOrder = "desc", search
    } = req.query;

    const filter = {};

    // if (supplier) {
    //   filter.supplier = supplier;
    // }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } }
      ];
    }
    const skip = (page - 1) * limit;

    const fabrics = await Fabric.find(filter)
    // .select("_id name supplier color code")
    .populate("supplier", "name") // Populate Supplier Name
    .populate({
      path: "fabricCompositions",
      populate: { path: "compositionItem", select: "name abbrPrefix" }
    })
    .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

    const total = await Fabric.countDocuments(filter);

    res.status(200).json({
      data: fabrics,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
  });
  } catch (error) {
    res.status(500).json({ message: "Error fetching styles", error });
  }
};
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
      const compositionItems = await CompositionItem.find().select("_id name abbrPrefix");
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
      //console.log(customer, brand, styleName, styleNo);

      // Create style
      const newStyle = new Style({ brand, name: styleName, styleNo });
      await newStyle.save();

      res.status(201).json({ message: "Style created successfully", style: newStyle });
  } catch (error) {
      res.status(500).json({ message: "Error creating style" });
  }
};

exports.updateStyle = async (req, res) => {
  const { customer, brand, styleName, styleNo } = req.body;
  const style = await Style.findByIdAndUpdate(req.params.id, { customer, brand, name: styleName, styleNo }, { new: true });
  res.status(200).json(style);
};

exports.deleteStyle = async (req, res) => {
  await Style.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Style deleted successfully" });
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
    const defectName = await DefectName.find().select("_id name")
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
    const defectProcess = await DefectProcess.find().select("_id name")
    .populate("place", "_id");
    res.status(200).json(defectProcess);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defectProcess", error });
  }
};

