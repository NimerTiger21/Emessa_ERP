// controllers/masterDataController.js
const Style = require("../models/order/Style");
const CustomAccount = require("../models/order/CustomAccount");
const Fabric = require("../models/fabric/Fabric");
const CompositionItem = require("../models/fabric/CompositionItem");
const Brand = require("../models/order/Brand");
const DefectType = require("../models/defect/DefectType");
const DefectName = require("../models/defect/DefectName");
const DefectPlace = require("../models/defect/DefectPlace");
const DefectProcess = require("../models/defect/DefectProcess");


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
