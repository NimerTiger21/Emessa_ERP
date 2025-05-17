// src/services/defectAnalyticsApiService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Fetch comprehensive defect analytics data
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Analytics data
 */
export const getDefectAnalytics = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query parameters if they exist
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.severity) queryParams.append('severity', filters.severity);
    if (filters.status) queryParams.append('status', filters.status);
    
    const response = await axios.get(`${API_URL}/api/analytics/analytics?${queryParams}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching defect analytics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch defect analytics');
  }
};

/**
 * Fetch top defective items by category
 * @param {string} category - Category to analyze (fabric, style, composition)
 * @param {number} limit - Number of items to return
 * @returns {Promise<Array>} Top defective items
 */
export const getTopDefectiveItems = async (category, limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/api/analytics/top/${category}/${limit}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching top defective ${category}:`, error);
    throw new Error(error.response?.data?.message || `Failed to fetch top defective ${category}`);
  }
};

/**
 * Fetch defect rate for a specific time period
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Promise<Object>} Defect rate statistics
 */
export const getDefectRate = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_URL}/analytics/rate`, {
      params: { startDate, endDate }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching defect rate:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch defect rate');
  }
};


/**
 * Get wash recipe defect analytics
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} - Wash recipe analytics data
 */
export const getWashRecipeDefectAnalytics = async (filters = {}) => {
  try {
    // Convert filters to query params
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.status) params.append('status', filters.status);
    if (filters.washType) params.append('washType', filters.washType);
    
    const response = await axios.get(`${API_URL}/api/analytics/wash-recipes?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching wash recipe defect analytics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch wash recipe defect analytics');
  }
};


/**
 * Fetch comparison data for defect analysis
 * @param {Object} filters - Filter parameters (comparisonType, startDate, endDate, severity, etc.)
 * @returns {Promise<Object>} Comparison data for visualization
 */
export const getComparisonData = async (filters = {}) => {
  try {
    // Convert filters to query params
    const params = new URLSearchParams();
    
    if (filters.comparisonType) params.append('comparisonType', filters.comparisonType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.metric) params.append('metric', filters.metric);
    
    const response = await axios.get(`${API_URL}/api/analytics/comparison?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch comparison data');
  }
};