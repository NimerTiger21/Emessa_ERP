// src/routes/defectAnalyticsRoutes.js
const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/defectAnalyticsController");

// Get comprehensive defect analytics
router.get("/analytics", analyticsController.getDefectAnalytics);

// Get defect rate for a time period
router.get("/wash-recipes?", analyticsController.getWashRecipeDefectAnalytics);

router.get("/comparison?", analyticsController.getComparisonData);

module.exports = router;
