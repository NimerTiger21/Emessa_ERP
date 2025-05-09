// src/services/defectAnalyticsService.js
const Defect = require('../models/Defect');
const Order = require('../models/Order');
const Fabric = require('../models/order/Fabric');
const Style = require('../models/order/Style');
const FabricComposition = require('../models/order/FabricComposition');
const CompositionItem = require('../models/order/CompositionItem');

/**
 * Get comprehensive defect analytics data
 * @param {Object} filters - Optional filters (date range, etc.)
 * @returns {Promise<Object>} Analytics data
 */
exports.getDefectAnalytics = async (filters = {}) => {
  try {
    // Build query based on filters
    const query = {};
    
    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query.detectedDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    // Apply other filters
    if (filters.severity) query.severity = filters.severity;
    if (filters.status) query.status = filters.status;
    
    // Get all defects with populated references
    const defects = await Defect.find(query)
      .populate({
        path: 'orderId',
        populate: [
          { path: 'fabric', populate: {path: 'fabricCompositions', populate: { path:'compositionItem'} }},
          { path: 'style' },
          { path: 'brand' }
        ]
      })
      .populate('defectName')
      .populate('defectType')
      .populate('defectPlace')
      .populate('defectProcess')
      .lean();
    
    // Get total count for percentage calculations
    //const totalDefects = defects.length; // counts the number of defect documents.
    //Each defect document has a defectCount field indicating how many defects it represents.
    // Using .reduce() sums all defectCount values, giving the true total defect count.

    // Sum defectCount from all defects
      const totalDefects = defects.reduce((sum, defect) => sum + (defect.defectCount || 1), 0);

    // Initialize result object
    const result = {
      summary: {
        totalProducedItems: 0,
        defectRatio: 0,
        totalDefects,
        defectsByStatus: {},
        defectsBySeverity: {}
      },
      byFabric: [],
      byStyle: [],
      byComposition: [],
      byDefectType: [],
      byDefectPlace: [],
      trendData: [],
      monthlyData: []
    };
    
    // Process status and severity distribution
    const statusCounts = {};
    const severityCounts = {};
    
    // Track unique fabrics, styles, and compositions for grouping
    const fabricMap = {};
    const styleMap = {};
    const compositionItemMap = {};
    const defectTypeMap = {};
    const defectPlaceMap = {};
    
    // Process monthly trend data
    const monthlyData = {};
    
    // TODO: Increment by defect.defectCount instead of just 1
    // Process each defect
    defects.forEach(defect => {
      // Status counts
      statusCounts[defect.status] = (statusCounts[defect.status] || 0) + 1;
      
      // Severity counts
      //severityCounts[defect.severity] = (severityCounts[defect.severity] || 0) + 1;

      const count = defect.defectCount || 1;
      severityCounts[defect.severity] = (severityCounts[defect.severity] || 0) + count;
      
      // Process fabric data
      if (defect.orderId && defect.orderId.fabric) {
        const fabricId = defect.orderId.fabric._id.toString();
        if (!fabricMap[fabricId]) {
          fabricMap[fabricId] = {
            id: fabricId,
            name: defect.orderId.fabric.name || 'Unknown Fabric',
            code: defect.orderId.fabric.code || 'N/A',
            count: 0,
            percentage: 0
          };
        }
        //fabricMap[fabricId].count += 1;
        fabricMap[fabricId].count += defect.defectCount || 1; // <-- Add the effect value
      }
      
      // Process style data
      if (defect.orderId && defect.orderId.style) {
        const styleId = defect.orderId.style._id.toString();
        if (!styleMap[styleId]) {
          styleMap[styleId] = {
            id: styleId,
            name: defect.orderId.style.name || 'Unknown Style',
            styleNo: defect.orderId.style.styleNo || 'N/A',
            count: 0,
            percentage: 0
          };
        }
        //styleMap[styleId].count += 1;
        styleMap[styleId].count += defect.defectCount || 1; // <-- Add the effect value
      }
      
      // Process defect type data
      if (defect.defectType) {
        const typeId = defect.defectType._id.toString();
        if (!defectTypeMap[typeId]) {
          defectTypeMap[typeId] = {
            id: typeId,
            name: defect.defectType.name || 'Unknown Type',
            count: 0,
            percentage: 0
          };
        }
        //defectTypeMap[typeId].count += 1;
        defectTypeMap[typeId].count += defect.defectCount || 1; // <-- Add the effect value
      }
      
      // Process defect place data
      if (defect.defectPlace) {
        const placeId = defect.defectPlace._id.toString();
        if (!defectPlaceMap[placeId]) {
          defectPlaceMap[placeId] = {
            id: placeId,
            name: defect.defectPlace.name || 'Unknown Location',
            count: 0,
            percentage: 0
          };
        }
        //defectPlaceMap[placeId].count += 1;
        defectPlaceMap[placeId].count += defect.defectCount || 1; // <-- Add the effect value
      }
      
      // Process composition data if available
      if (defect.orderId && defect.orderId.fabric && defect.orderId.fabric.fabricCompositions) {
        defect.orderId.fabric.fabricCompositions.forEach(comp => {
          if (comp.compositionItem) {
            const compId = comp.compositionItem._id.toString();
            if (!compositionItemMap[compId]) {
              compositionItemMap[compId] = {
                id: compId,
                name: comp.compositionItem.name || 'Unknown Composition',
                count: 0,
                percentage: 0
              };
            }
            //compositionItemMap[compId].count += 1;
            compositionItemMap[compId].count += defect.defectCount || 1; // <-- Add the effect value
          }
        });
      }
      
      // Process monthly trend data
      const defectDate = new Date(defect.detectedDate);
      const monthYear = `${defectDate.getFullYear()}-${String(defectDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          count: 0
        };
      }
      //monthlyData[monthYear].count += 1;
      monthlyData[monthYear].count += defect.defectCount || 1; // <-- Add the effect value
    });
    
    // Convert to percentages and sort
    result.summary.defectsByStatus = Object.keys(statusCounts).map(status => ({
      name: status,
      count: statusCounts[status],
      percentage: (statusCounts[status] / totalDefects * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
    
    result.summary.defectsBySeverity = Object.keys(severityCounts).map(severity => ({
      name: severity,
      count: severityCounts[severity],
      percentage: (severityCounts[severity] / totalDefects * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
    
    // Convert maps to arrays and calculate percentages
    result.byFabric = Object.values(fabricMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    result.byStyle = Object.values(styleMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    result.byComposition = Object.values(compositionItemMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    result.byDefectType = Object.values(defectTypeMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    result.byDefectPlace = Object.values(defectPlaceMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    // Convert monthly data to sorted array
    result.trendData = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month));



      // Get all unique order IDs from defects
const uniqueOrderIds = new Set(defects.map(d => d.orderId?._id?.toString()).filter(Boolean));

// Fetch those orders and sum their orderQty
const orders = await Order.find({ _id: { $in: Array.from(uniqueOrderIds) } }, { orderQty: 1 });
const totalProducedItems = orders.reduce((sum, order) => sum + (order.orderQty || 0), 0);

// Calculate defect ratio
const defectRatio = totalProducedItems > 0
  ? ((totalDefects / totalProducedItems) * 100).toFixed(2)
  : "0.00";

// Add to summary
result.summary.defectRatio = defectRatio;
result.summary.totalProducedItems = totalProducedItems;
    
    return result;
  } catch (error) {
    console.error('Error fetching defect analytics:', error);
    throw new Error('Failed to fetch defect analytics');
  }
};

/**
 * Get top defective items by category
 * @param {string} category - Category to analyze (fabric, style, composition)
 * @param {number} limit - Number of items to return
 * @returns {Promise<Array>} Top defective items
 */
exports.getTopDefectiveItems = async (category, limit = 5) => {
  try {
    const analytics = await exports.getDefectAnalytics();
    
    switch (category) {
      case 'fabric':
        return analytics.byFabric.slice(0, limit);
      case 'style':
        return analytics.byStyle.slice(0, limit);
      case 'composition':
        return analytics.byComposition.slice(0, limit);
      default:
        throw new Error('Invalid category specified');
    }
  } catch (error) {
    console.error(`Error fetching top defective ${category}:`, error);
    throw new Error(`Failed to fetch top defective ${category}`);
  }
};

/**
 * Calculate defect rate for a specific time period
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Defect rate statistics
 */
// exports.getDefectRate = async (startDate, endDate) => {
//   try {

//     const result = await Defect.aggregate([
//       {
//         $match: {
//           detectedDate: { $gte: startDate, $lte: endDate }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalDefectCount: { $sum: "$defectCount" }
//         }
//       }
//     ]);

//     const defectCount = result[0]?.totalDefectCount || 0;
//     // const defectCount = await Defect.countDocuments({
//     //   detectedDate: { $gte: startDate, $lte: endDate }
//     // });
    
//     const ordersInPeriod = await Order.find({
//       createdAt: { $gte: startDate, $lte: endDate }
//     });
    
//     const totalOrderQty = ordersInPeriod.reduce((sum, order) => sum + (order.orderQty || 0), 0);
    
//     return {
//       totalDefects: defectCount,
//       totalOrderQuantity: totalOrderQty,
//       defectRate: totalOrderQty > 0 ? (defectCount / totalOrderQty * 100).toFixed(2) : 0,
//       period: {
//         start: startDate,
//         end: endDate
//       }
//     };
//   } catch (error) {
//     console.error('Error calculating defect rate:', error);
//     throw new Error('Failed to calculate defect rate');
//   }
// };