// src/routes/defectAnalyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/defectAnalyticsController');

// Get comprehensive defect analytics
router.get('/analytics', analyticsController.getDefectAnalytics);

// Get top defective items by category
router.get('/top/:category/:limit?', analyticsController.getTopDefectiveItems);

// Get defect rate for a time period
router.get('/rate', analyticsController.getDefectRate);


// Get defect rate for a time period
router.get('/wash-recipes?', analyticsController.getWashRecipeDefectAnalytics);

// src/routes/analyticsRoutes.js
router.get('/wash-recipes', analyticsController.getWashRecipeDefectAnalytics2);

router.get('/comparison?', analyticsController.getComparisonData);



module.exports = router;