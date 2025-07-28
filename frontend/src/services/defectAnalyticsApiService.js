// src/services/defectAnalyticsApiService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Fetch comprehensive defect analytics data
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Analytics data
 */
export const getDefectAnalytics = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    // Add filters to query parameters if they exist
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.severity) queryParams.append("severity", filters.severity);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.defectType)
      queryParams.append("defectType", filters.defectType);
    if (filters.defectName) queryParams.append("defectName", filters.defectName); // ✅ Add this
    if (filters.productionLine) queryParams.append("productionLine", filters.productionLine); // ✅ And this

    // console.log("Defect analytics query params:", queryParams.toString());

    const response = await axios.get(
      `${API_URL}/api/analytics/analytics?${queryParams}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching defect analytics:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch defect analytics"
    );
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

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.severity) params.append("severity", filters.severity);
    if (filters.status) params.append("status", filters.status);
    if (filters.washType) params.append("washType", filters.washType);

    const response = await axios.get(
      `${API_URL}/api/analytics/wash-recipes?${params.toString()}`
    );
    const apiData = response.data.data;
    // Transform the API data to match the expected format in the frontend
    //return transformWashRecipeData(apiData);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching wash recipe defect analytics:", error);
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch wash recipe defect analytics"
    );
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

    if (filters.comparisonType)
      params.append("comparisonType", filters.comparisonType);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.severity) params.append("severity", filters.severity);
    if (filters.metric) params.append("metric", filters.metric);

    const response = await axios.get(
      `${API_URL}/api/analytics/comparison?${params.toString()}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching comparison data:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch comparison data"
    );
  }
};
