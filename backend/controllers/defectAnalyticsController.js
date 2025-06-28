// src/controllers/defectAnalyticsController.js
const analyticsService = require("../services/defectAnalyticsService");

/**
 * Get comprehensive defect analytics data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDefectAnalytics = async (req, res) => {
  try {
    // Extract filters from query parameters
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      severity: req.query.severity,
      status: req.query.status,
      defectType: req.query.defectType, // ✅ now included here
    };

    const analytics = await analyticsService.getDefectAnalytics(filters);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error in getDefectAnalytics controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch defect analytics",
    });
  }
};

/**
 * Get wash recipe defect analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getWashRecipeDefectAnalytics = async (req, res) => {
  try {
    // Extract filters from query parameters
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      severity: req.query.severity,
      status: req.query.status,
      washType: req.query.washType,
    };

    // Validate date range if provided
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Please use YYYY-MM-DD format.",
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date cannot be after end date.",
        });
      }
    }

    // Validate severity if provided
    if (
      filters.severity &&
      !["Low", "Medium", "High"].includes(filters.severity)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity value. Must be Low, Medium, or High.",
      });
    }

    // Validate status if provided
    if (
      filters.status &&
      !["Open", "In Progress", "Resolved"].includes(filters.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Must be Open, In Progress, or Resolved.",
      });
    }

    // Validate washType if provided
    if (
      filters.washType &&
      !["Size set", "SMS", "Proto", "Production", "Fitting Sample"].includes(
        filters.washType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid wash type value.",
      });
    }

    // Get the analytics data from the service
    const analytics = await analyticsService.getWashRecipeDefectAnalytics(
      filters
    );

    // Return success response with data
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error in getWashRecipeDefectAnalytics controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch wash recipe defect analytics",
    });
  }
};

/**
 * Get defect comparison data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getComparisonData = async (req, res) => {
  try {
    // Extract filters from query parameters
    const filters = {
      comparisonType: req.query.comparisonType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      severity: req.query.severity,
      metric: req.query.metric,
    };

    const comparisonData = await analyticsService.getComparisonData(filters);

    res.status(200).json({
      success: true,
      data: comparisonData,
    });
  } catch (error) {
    console.error("Error in getComparisonData controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch comparison data",
    });
  }
};
