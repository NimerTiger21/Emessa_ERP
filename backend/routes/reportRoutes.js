// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Route to get aggregated defect data
router.get("/defects", reportController.getDefectTrends);

module.exports = router;
