const express = require('express');
const router = express.Router();
const fabricController = require('../controllers/fabricController');
const { protect, restrictTo } = require("../controllers/authController");

// Routes for fabric management with enhanced features

// GET /api/fabrics - Get all fabrics with pagination, search, sort, and filter
router.get('/', fabricController.getFabrics);

// GET /api/fabrics/export - Get all fabrics for export (no pagination)
router.get('/export', fabricController.getAllFabricsForExport);

// GET /api/fabrics/:fabricId - Get single fabric with full details
router.get('/:fabricId', fabricController.getFabricById);

// POST /api/fabrics - Create new fabric with TDS file upload
router.post('/', 
  fabricController.uploadTDS, // Multer middleware for file upload
  fabricController.createOrUpdateFabricWithCompositions
);

// PUT /api/fabrics/:fabricId - Update existing fabric with TDS file upload
router.put('/:fabricId', 
  fabricController.uploadTDS, // Multer middleware for file upload
  fabricController.createOrUpdateFabricWithCompositions
);

// DELETE /api/fabrics/:fabricId - Delete fabric and associated files
// router.delete('/:fabricId', fabricController.deleteFabric);
router.delete(
  "/:fabricId",
  protect,           // Ensures user is logged in
  restrictTo("admin"), // Restricts to admin role
  fabricController.deleteFabric
);

// GET /api/fabrics/:fabricId/download-tds - Download TDS file
router.get('/:fabricId/download-tds', fabricController.downloadTDS);

module.exports = router;