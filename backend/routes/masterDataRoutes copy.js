// routes/masterDataRoutes.js
const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/tds-files/' });
const { getStyles, getCustomers, getFabricSuppliers, getFabrics, getAllCompositionItems, getBrands, createStyle, deleteFabric, createOrUpdateFabricWithCompositions, updateStyle, deleteStyle, getDefectTypes, getDefectNames, getDefectPlaces, getDefectProcesses, uploadTdsFile } = require("../controllers/masterDataController");

router.get("/styles", getStyles);
router.get("/customers", getCustomers);
router.get("/fabric-suppliers", getFabricSuppliers);
// router.post("/fabrics", createOrUpdateFabricWithCompositions);
router.post('/fabrics', upload.single('tdsFile'), createOrUpdateFabricWithCompositions);
router.get("/fabrics", getFabrics);
// router.put("/fabrics/:fabricId", createOrUpdateFabricWithCompositions);
router.put('/fabrics/:fabricId', upload.single('tdsFile'), createOrUpdateFabricWithCompositions);
router.post('/fabrics/:fabricId/tds', upload.single('tdsFile'), uploadTdsFile);

router.delete("/fabrics/:id", deleteFabric);
router.get("/composition-items", getAllCompositionItems);
router.get("/brands", getBrands);
router.post("/styles", createStyle);
router.put("/styles/:id", updateStyle);
router.delete("/styles/:id", deleteStyle);

router.get("/defect-types", getDefectTypes);
router.get("/defect-names", getDefectNames);
router.get("/defect-places", getDefectPlaces);
router.get("/defect-processes", getDefectProcesses);

module.exports = router;
