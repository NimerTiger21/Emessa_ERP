// src/controllers/defectAnalyticsController.js
const analyticsService = require('../services/defectAnalyticsService');

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
      status: req.query.status
    };
    
    const analytics = await analyticsService.getDefectAnalytics(filters);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error in getDefectAnalytics controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch defect analytics'
    });
  }
};

/**
 * Get top defective items by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTopDefectiveItems = async (req, res) => {
  try {
    const { category, limit } = req.params;
    
    const topItems = await analyticsService.getTopDefectiveItems(
      category,
      parseInt(limit) || 5
    );
    
    res.status(200).json({
      success: true,
      data: topItems
    });
  } catch (error) {
    console.error('Error in defectAnalyticsController getTopDefectiveItems controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch top defective items'
    });
  }
};

/**
 * Get defect rate for a time period
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDefectRate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const defectRate = await analyticsService.getDefectRate(
      new Date(startDate),
      new Date(endDate)
    );
    
    res.status(200).json({
      success: true,
      data: defectRate
    });
  } catch (error) {
    console.error('Error in getDefectRate controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate defect rate'
    });
  }
};