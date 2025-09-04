// routes/masterDataRoutes.js
const express = require("express");
const router = express.Router();
const { getStyles, getCustomers, getFabricSuppliers, getAllCompositionItems, getBrands, createStyle, updateStyle, deleteStyle, getDefectTypes, getDefectNames, getDefectPlaces, getDefectProcesses } = require("../controllers/masterDataController");
const { protect, restrictTo } = require("../controllers/authController");
router.get("/styles", getStyles);
router.get("/customers", getCustomers);
router.get("/fabric-suppliers", getFabricSuppliers);

router.get("/composition-items", getAllCompositionItems);
router.get("/brands", getBrands);
router.post("/styles", createStyle);
router.put("/styles/:id", updateStyle);
// router.delete("/styles/:id", deleteStyle);
router.delete(
  "/styles/:id",
  protect,           // Ensures user is logged in
  restrictTo("admin"), // Restricts to admin role
  deleteStyle
);

router.get("/defect-types", getDefectTypes);
router.get("/defect-names", getDefectNames);
router.get("/defect-places", getDefectPlaces);
router.get("/defect-processes", getDefectProcesses);

module.exports = router;
