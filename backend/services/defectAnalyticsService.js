// src/services/defectAnalyticsService.js
const Defect = require("../models/defect/Defect");
const Order = require("../models/order/Order");
const WashRecipe = require("../models/washRecipe/WashRecipe");
const Fabric = require("../models/order/Fabric");
const Style = require("../models/order/Style");
const FabricComposition = require("../models/order/FabricComposition");
const CompositionItem = require("../models/order/CompositionItem");
const DefectType = require("../models/defect/DefectType");
const mongoose = require("mongoose");

/**
 * Get comprehensive defect analytics data
 * @param {Object} filters - Optional filters (date range, etc.)
 * @returns {Promise<Object>} Analytics data
 */
exports.getDefectAnalytics = async (filters = {}) => {
  try {
    // Build query based on filters
    const query = {};
    //console.log("Received filters:", filters);

    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query.detectedDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    // Apply other filters
    if (filters.severity) query.severity = filters.severity;
    if (filters.status) query.status = filters.status;

    if (filters.defectType) query.defectType = filters.defectType;

    // const { defectType } = filters;
    // if (defectType && mongoose.Types.ObjectId.isValid(defectType)) {
    //   query.defectType = new mongoose.Types.ObjectId(defectType);
    // }

    // Get all defects with populated references
    const defects = await Defect.find(query)
      .populate({
        path: "orderId",
        populate: [
          {
            path: "fabric",
            populate: {
              path: "fabricCompositions",
              populate: { path: "compositionItem" },
            },
          },
          { path: "style" },
          { path: "brand" },
        ],
      })
      .populate("defectName")
      .populate("defectType")
      .populate("defectPlace")
      .populate("defectProcess")
      .lean();

    // Get total count for percentage calculations
    //const totalDefects = defects.length; // counts the number of defect documents.
    //Each defect document has a defectCount field indicating how many defects it represents.
    // Using .reduce() sums all defectCount values, giving the true total defect count.

    // Sum defectCount from all defects
    const totalDefects = defects.reduce(
      (sum, defect) => sum + (defect.defectCount || 1),
      0
    );

    // Initialize result object
    const result = {
      summary: {
        totalProducedItems: 0,
        defectRatio: 0,
        totalDefects,
        defectsByStatus: {},
        defectsBySeverity: {},
      },
      byFabric: [],
      byStyle: [],
      byComposition: [],
      byDefectType: [],
      byDefectPlace: [],
      trendData: [],
      monthlyData: [],
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
    const lineMap = {};

    // Process monthly trend data
    const monthlyData = {};

    // TODO: Increment by defect.defectCount instead of just 1
    // Process each defect
    defects.forEach((defect) => {
      // Status counts
      statusCounts[defect.status] = (statusCounts[defect.status] || 0) + 1;

      // Severity counts
      //severityCounts[defect.severity] = (severityCounts[defect.severity] || 0) + 1;

      const count = defect.defectCount || 1;
      severityCounts[defect.severity] =
        (severityCounts[defect.severity] || 0) + count;

      if (defect.productionLine) {
        // Assuming you have a productionLine field
        // const productionLine = defect.productionLine._id.toString();
        const productionLine = defect.productionLine.toString();
        if (!lineMap[productionLine]) {
          lineMap[productionLine] = {
            // id: productionLine,
            // name: defect.productionLine.name || "Unknown Line",
            name: defect.productionLine || "Unknown Line",
            // lineNumber: defect.productionLine.lineNumber || "N/A",
            count: 0,
            percentage: 0,
            efficiency: defect.productionLine.efficiency || 0,
            totalProduced: 0,
          };
        }
        lineMap[productionLine].count += defect.defectCount || 1;
        lineMap[productionLine].totalProduced += defect.orderId.orderQty || 0;
      }

      // Process fabric data
      if (defect.orderId && defect.orderId.fabric) {
        const fabricId = defect.orderId.fabric._id.toString();
        if (!fabricMap[fabricId]) {
          fabricMap[fabricId] = {
            id: fabricId,
            name: defect.orderId.fabric.name || "Unknown Fabric",
            code: defect.orderId.fabric.code || "N/A",
            count: 0,
            percentage: 0,
            composition:
              defect.orderId.fabric.fabricCompositions
                ?.map((fc) => {
                  const name = fc.compositionItem?.name || "Unknown";
                  const ratio = fc.value != null ? `${fc.value}%` : "";
                  return ratio ? `${ratio} ${name}` : name;
                })
                .join(", ") || "N/A",

            totalProduced: 0,
          };
        }
        //fabricMap[fabricId].count += 1;
        fabricMap[fabricId].count += defect.defectCount || 1; // <-- Add the effect value
        fabricMap[fabricId].totalProduced += defect.orderId.orderQty || 0;
      }

      // Process style data
      if (defect.orderId && defect.orderId.style) {
        const styleId = defect.orderId.style._id.toString();
        if (!styleMap[styleId]) {
          styleMap[styleId] = {
            id: styleId,
            name: defect.orderId.style.name || "Unknown Style",
            styleNo: defect.orderId.style.styleNo || "N/A",
            count: 0,
            percentage: 0,
            orders: {}, // <-- Nested key breakdown
          };
        }
        const keyNo = defect.orderId.keyNo || "Unknown KeyNo";
        if (!styleMap[styleId].orders[keyNo]) {
          styleMap[styleId].orders[keyNo] = {
            keyNo,
            count: 0,
          };
        }
        //styleMap[styleId].count += 1;
        styleMap[styleId].count += defect.defectCount || 1; // <-- Add the effect value
        styleMap[styleId].orders[keyNo].count += defect.defectCount;
      }

      // Process defect type data
      if (defect.defectType) {
        const typeId = defect.defectType._id.toString();
        if (!defectTypeMap[typeId]) {
          defectTypeMap[typeId] = {
            id: typeId,
            name: defect.defectType.name || "Unknown Type",
            count: 0,
            percentage: 0,
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
            name: defect.defectPlace.name || "Unknown Location",
            count: 0,
            percentage: 0,
          };
        }
        //defectPlaceMap[placeId].count += 1;
        defectPlaceMap[placeId].count += defect.defectCount || 1; // <-- Add the effect value
      }

      // Process composition data if available
      if (
        defect.orderId &&
        defect.orderId.fabric &&
        defect.orderId.fabric.fabricCompositions
      ) {
        defect.orderId.fabric.fabricCompositions.forEach((comp) => {
          if (comp.compositionItem) {
            const compId = comp.compositionItem._id.toString();
            if (!compositionItemMap[compId]) {
              compositionItemMap[compId] = {
                id: compId,
                name: comp.compositionItem.name || "Unknown Composition",
                count: 0,
                percentage: 0,
              };
            }
            //compositionItemMap[compId].count += 1;
            compositionItemMap[compId].count += defect.defectCount || 1; // <-- Add the effect value
          }
        });
      }

      // Process monthly trend data
      const defectDate = new Date(defect.detectedDate);
      const monthYear = `${defectDate.getFullYear()}-${String(
        defectDate.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          count: 0,
        };
      }
      //monthlyData[monthYear].count += 1;
      monthlyData[monthYear].count += defect.defectCount || 1; // <-- Add the effect value
    });

    // Convert to percentages and sort
    result.summary.defectsByStatus = Object.keys(statusCounts)
      .map((status) => ({
        name: status,
        count: statusCounts[status],
        percentage: ((statusCounts[status] / totalDefects) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    result.summary.defectsBySeverity = Object.keys(severityCounts)
      .map((severity) => ({
        name: severity,
        count: severityCounts[severity],
        percentage: ((severityCounts[severity] / totalDefects) * 100).toFixed(
          1
        ),
      }))
      .sort((a, b) => b.count - a.count);

    // Convert maps to arrays and calculate percentages

    // Then add to your result object:
    result.byLine = Object.values(lineMap)
      .map((item) => ({
        ...item,
        percentage: ((item.count / totalDefects) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    result.byFabric = Object.values(fabricMap)
      .map((item) => ({
        ...item,
        percentage: ((item.count / totalDefects) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    result.byStyle = Object.values(styleMap)
      .map((item) => ({
        ...item,
        percentage: ((item.count / totalDefects) * 100).toFixed(1),
        orders: Object.values(item.orders).sort((a, b) => b.count - a.count), // Convert nested object to sorted array
      }))
      .sort((a, b) => b.count - a.count);

    result.byComposition = Object.values(compositionItemMap)
      .map((item) => ({
        ...item,
        percentage: ((item.count / totalDefects) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    result.byDefectType = Object.values(defectTypeMap)
      .map((item) => ({
        ...item,
        percentage: ((item.count / totalDefects) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    result.byDefectPlace = Object.values(defectPlaceMap)
      .map((item) => ({
        ...item,
        percentage: ((item.count / totalDefects) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    // Convert monthly data to sorted array
    result.trendData = Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Get all unique order IDs from defects
    const uniqueOrderIds = new Set(
      defects.map((d) => d.orderId?._id?.toString()).filter(Boolean)
    );

    // Fetch those orders and sum their orderQty
    const orders = await Order.find(
      { _id: { $in: Array.from(uniqueOrderIds) } },
      { orderQty: 1 }
    );
    const totalProducedItems = orders.reduce(
      (sum, order) => sum + (order.orderQty || 0),
      0
    );

    // Calculate defect ratio
    const defectRatio =
      totalProducedItems > 0
        ? ((totalDefects / totalProducedItems) * 100).toFixed(2)
        : "0.00";

    // Add to summary
    result.summary.defectRatio = defectRatio;
    result.summary.totalProducedItems = totalProducedItems;

    return result;
  } catch (error) {
    console.error("Error fetching defect analytics:", error);
    throw new Error("Failed to fetch defect analytics");
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
      case "fabric":
        return analytics.byFabric.slice(0, limit);
      case "style":
        return analytics.byStyle.slice(0, limit);
      case "composition":
        return analytics.byComposition.slice(0, limit);
      default:
        throw new Error("Invalid category specified");
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

//************************************************************************************************************************* */

/**
 * Get wash recipe defect analytics
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} - Wash recipe analytics data
 */
exports.getWashRecipeDefectAnalytics = async (filters = {}) => {
  try {
    // Build query for defects based on filters
    const defectQuery = {};

    // Date range filtering
    if (filters.startDate || filters.endDate) {
      defectQuery.detectedDate = {};
      if (filters.startDate) {
        defectQuery.detectedDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        defectQuery.detectedDate.$lte = new Date(
          `${filters.endDate}T23:59:59.999Z`
        );
      }
    }

    // Other filters
    if (filters.severity) {
      defectQuery.severity = filters.severity;
    }

    if (filters.status) {
      defectQuery.status = filters.status;
    }

    // First find the defectType document by name
    const defectTypeDoc = await DefectType.findOne({ name: "laundry Defects" });
    if (!defectTypeDoc) {
      throw new Error("Defect type 'laundry Defects' not found");
    }
    // Find all defects associated with orders that have wash recipes
    const defects = await Defect.find({
      ...defectQuery,
      defectType: defectTypeDoc._id, // Assuming this field exists to identify wash recipe related defects
    })
      .populate({
        path: "orderId",
        select: "orderNo orderQty washRecipes",
        populate: {
          path: "washRecipes",
          select: "washType date washCode",
        },
      })
      .lean();

    // Filter defects to only include those associated with wash recipes
    const washRecipeDefects = defects.filter(
      (defect) =>
        defect.orderId &&
        defect.orderId.washRecipes &&
        defect.orderId.washRecipes.length > 0
    );

    // If washType filter is applied, further filter the defects
    let filteredWashRecipeDefects = washRecipeDefects;
    if (filters.washType) {
      filteredWashRecipeDefects = washRecipeDefects.filter((defect) =>
        defect.orderId.washRecipes.some(
          (recipe) => recipe.washType === filters.washType
        )
      );
    }

    // Get all wash recipes with their detailed information for analytics
    const washRecipes = await WashRecipe.find({})
      .populate({
        path: "orderId",
        select: "orderNo orderQty defects articleNo",
      })
      .populate({
        path: "recipeProcessId",
        populate: {
          path: "laundryProcessId",
          model: "LaundryProcess",
        },
      })
      .populate({
        path: "steps",
        populate: [
          {
            path: "stepId",
            model: "LaundryStep",
          },
          {
            path: "stepItems",
            populate: {
              path: "chemicalItemId",
              model: "ChemicalItems",
            },
          },
        ],
      })
      .lean();

    // Apply filter by washType if provided
    const filteredWashRecipes = filters.washType
      ? washRecipes.filter((recipe) => recipe.washType === filters.washType)
      : washRecipes;

    // Calculate defect counts and percentages by recipe
    const recipeDefectMap = new Map();
    filteredWashRecipeDefects.forEach((defect) => {
      defect.orderId.washRecipes.forEach((recipe) => {
        const recipeId = recipe._id.toString();
        if (!recipeDefectMap.has(recipeId)) {
          recipeDefectMap.set(recipeId, {
            recipeId,
            defectCount: 0,
            recipes: [],
          });
        }

        const entry = recipeDefectMap.get(recipeId);
        entry.defectCount += defect.defectCount || 1;

        // Add recipe details if not already added
        if (
          !entry.recipes.some((r) => r._id.toString() === recipe._id.toString())
        ) {
          entry.recipes.push(recipe);
        }
      });
    });

    // Process the data for analytics

    // 1. Calculate total defects related to wash recipes
    const totalWashRecipeDefects = filteredWashRecipeDefects.reduce(
      (sum, defect) => sum + (defect.defectCount || 1),
      0
    );

    const totalDefects = defects.reduce(
      (sum, defect) => sum + (defect.defectCount || 1),
      0
    );

    const washRecipeDefectRatio =
      totalDefects > 0
        ? ((totalWashRecipeDefects / totalDefects) * 100).toFixed(2)
        : 0;

    // 2. Analysis by wash type
    const washTypeMap = new Map();

    filteredWashRecipeDefects.forEach((defect) => {
      defect.orderId.washRecipes.forEach((recipe) => {
        const washType = recipe.washType;
        if (!washTypeMap.has(washType)) {
          washTypeMap.set(washType, 0);
        }
        washTypeMap.set(
          washType,
          washTypeMap.get(washType) + (defect.defectCount || 1)
        );
      });
    });

    const byWashType = Array.from(washTypeMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalWashRecipeDefects > 0
            ? ((count / totalWashRecipeDefects) * 100).toFixed(2)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 3. Analysis by chemical
    const chemicalDefectMap = new Map();

    // Get all chemicals used in recipes with defects
    const recipeIds = Array.from(recipeDefectMap.keys());

    // Find all step items for these recipes to get chemicals
    for (const recipe of filteredWashRecipes) {
      if (!recipeIds.includes(recipe._id.toString())) continue;

      const defectCount = recipeDefectMap.has(recipe._id.toString())
        ? recipeDefectMap.get(recipe._id.toString()).defectCount
        : 0;

      if (defectCount === 0) continue;

      // Process each step in the recipe
      for (const step of recipe.steps || []) {
        // Process each chemical in the step
        for (const stepItem of step.stepItems || []) {
          if (stepItem.chemicalItemId) {
            const chemicalName = stepItem.chemicalItemId.name;
            if (!chemicalDefectMap.has(chemicalName)) {
              chemicalDefectMap.set(chemicalName, 0);
            }
            chemicalDefectMap.set(
              chemicalName,
              chemicalDefectMap.get(chemicalName) + defectCount
            );
          }
        }
      }
    }

    const byChemical = Array.from(chemicalDefectMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalWashRecipeDefects > 0
            ? ((count / totalWashRecipeDefects) * 100).toFixed(2)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 4. Analysis by process
    const processDefectMap = new Map();

    for (const recipe of filteredWashRecipes) {
      if (!recipeIds.includes(recipe._id.toString())) continue;

      const defectCount = recipeDefectMap.has(recipe._id.toString())
        ? recipeDefectMap.get(recipe._id.toString()).defectCount
        : 0;

      if (defectCount === 0) continue;

      // Process each laundry process in the recipe
      for (const process of recipe.recipeProcessId || []) {
        if (process.laundryProcessId) {
          const processName = process.laundryProcessId.name;
          if (!processDefectMap.has(processName)) {
            processDefectMap.set(processName, 0);
          }
          processDefectMap.set(
            processName,
            processDefectMap.get(processName) + defectCount
          );
        }
      }
    }

    const byProcess = Array.from(processDefectMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalWashRecipeDefects > 0
            ? ((count / totalWashRecipeDefects) * 100).toFixed(2)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 5. Analysis by temperature range
    const temperatureRanges = [
      { min: 0, max: 30, name: "0-30°C" },
      { min: 31, max: 50, name: "31-50°C" },
      { min: 51, max: 70, name: "51-70°C" },
      { min: 71, max: 90, name: "71-90°C" },
      { min: 91, max: Number.POSITIVE_INFINITY, name: "91°C+" },
    ];

    // const temperatureDefectMap = new Map(
    //   temperatureRanges.map((range) => [range.name, 0])
    // );

    // for (const recipe of filteredWashRecipes) {
    //   if (!recipeIds.includes(recipe._id.toString())) continue;

    //   const defectCount = recipeDefectMap.has(recipe._id.toString())
    //     ? recipeDefectMap.get(recipe._id.toString()).defectCount
    //     : 0;

    //   if (defectCount === 0) continue;

    //   // Process each step in the recipe to get temperature data
    //   for (const step of recipe.steps || []) {
    //     if (step.temp) {
    //       const temp = Number(step.temp);
    //       if (!isNaN(temp)) {
    //         const tempRange = temperatureRanges.find(
    //           (range) => temp >= range.min && temp <= range.max
    //         );

    //         if (tempRange) {
    //           temperatureDefectMap.set(
    //             tempRange.name,
    //             temperatureDefectMap.get(tempRange.name) + defectCount
    //           );
    //         }
    //       }
    //     }
    //   }
    // }

    // const byTemperature = Array.from(temperatureDefectMap.entries())
    //   .map(([name, count]) => ({
    //     name,
    //     count,
    //     percentage:
    //       totalWashRecipeDefects > 0
    //         ? ((count / totalWashRecipeDefects) * 100).toFixed(2)
    //         : 0,
    //   }))
    //   .filter((item) => item.count > 0)
    //   .sort((a, b) => {
    //     // Sort numerically by the starting temperature in the range
    //     const aStart = parseInt(a.name.split("-")[0]);
    //     const bStart = parseInt(b.name.split("-")[0]);
    //     return aStart - bStart;
    //   });

    // Initialize map with count and a Set of recipe IDs per temperature range
    const temperatureDefectMap = new Map(
      temperatureRanges.map((range) => [range.name, 0])
    );

    for (const recipe of filteredWashRecipes) {
      if (!recipeIds.includes(recipe._id.toString())) continue;

      const defectCount = recipeDefectMap.has(recipe._id.toString())
        ? recipeDefectMap.get(recipe._id.toString()).defectCount
        : 0;

      if (defectCount === 0) continue;

      // Extract all valid temperatures from steps
      const temps = (recipe.steps || [])
        .map((step) => Number(step.temp))
        .filter((temp) => !isNaN(temp));

      if (temps.length === 0) continue; // Skip if no valid temps

      // Choose max temperature (you can change to average or another logic)
      const maxTemp = Math.max(...temps);

      // Find the temperature range for maxTemp
      const tempRange = temperatureRanges.find(
        (range) => maxTemp >= range.min && maxTemp <= range.max
      );

      if (tempRange) {
        temperatureDefectMap.set(
          tempRange.name,
          temperatureDefectMap.get(tempRange.name) + defectCount
        );
      }
    }

    // Calculate percentages
    const byTemperature = Array.from(temperatureDefectMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalWashRecipeDefects > 0
            ? ((count / totalWashRecipeDefects) * 100).toFixed(2)
            : 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => {
        const aStart = parseInt(a.name.split("-")[0]);
        const bStart = parseInt(b.name.split("-")[0]);
        return aStart - bStart;
      });

    // 6. Analysis by water ratio (liters)
    const waterRanges = [
      { min: 0, max: 5, name: "0-5L" },
      { min: 6, max: 10, name: "6-10L" },
      { min: 11, max: 20, name: "11-20L" },
      { min: 21, max: 50, name: "21-50L" },
      { min: 51, max: Number.POSITIVE_INFINITY, name: "51L+" },
    ];

    const waterDefectMap = new Map(waterRanges.map((range) => [range.name, 0]));

    for (const recipe of filteredWashRecipes) {
      if (!recipeIds.includes(recipe._id.toString())) continue;

      const defectCount = recipeDefectMap.has(recipe._id.toString())
        ? recipeDefectMap.get(recipe._id.toString()).defectCount
        : 0;

      if (defectCount === 0) continue;

      // Process each step in the recipe to get water usage data
      for (const step of recipe.steps || []) {
        if (step.liters) {
          const liters = Number(step.liters);
          if (!isNaN(liters)) {
            const waterRange = waterRanges.find(
              (range) => liters >= range.min && liters <= range.max
            );

            if (waterRange) {
              waterDefectMap.set(
                waterRange.name,
                waterDefectMap.get(waterRange.name) + defectCount
              );
            }
          }
        }
      }
    }

    const byWaterRatio = Array.from(waterDefectMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalWashRecipeDefects > 0
            ? ((count / totalWashRecipeDefects) * 100).toFixed(2)
            : 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => {
        // Sort numerically by the starting value in the range
        const aStart = parseInt(a.name.split("-")[0]);
        const bStart = parseInt(b.name.split("-")[0]);
        return aStart - bStart;
      });

    // 7. Analysis by duration (minutes)
    const durationRanges = [
      { min: 0, max: 10, name: "0-10 min" },
      { min: 11, max: 30, name: "11-30 min" },
      { min: 31, max: 60, name: "31-60 min" },
      { min: 61, max: 120, name: "61-120 min" },
      { min: 121, max: Number.POSITIVE_INFINITY, name: "120+ min" },
    ];

    const durationDefectMap = new Map(
      durationRanges.map((range) => [range.name, 0])
    );

    for (const recipe of filteredWashRecipes) {
      if (!recipeIds.includes(recipe._id.toString())) continue;

      const defectCount = recipeDefectMap.has(recipe._id.toString())
        ? recipeDefectMap.get(recipe._id.toString()).defectCount
        : 0;

      if (defectCount === 0) continue;

      // Process each step in the recipe to get duration data
      for (const step of recipe.steps || []) {
        if (step.time) {
          const time = Number(step.time);
          if (!isNaN(time)) {
            const durationRange = durationRanges.find(
              (range) => time >= range.min && time <= range.max
            );

            if (durationRange) {
              durationDefectMap.set(
                durationRange.name,
                durationDefectMap.get(durationRange.name) + defectCount
              );
            }
          }
        }
      }
    }

    const byDuration = Array.from(durationDefectMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalWashRecipeDefects > 0
            ? ((count / totalWashRecipeDefects) * 100).toFixed(2)
            : 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => {
        // Sort numerically by the starting value in the range
        const aStart = parseInt(a.name.split("-")[0]);
        const bStart = parseInt(b.name.split("-")[0]);
        return aStart - bStart;
      });

    // 8. Prepare recipe data for table display
    const recipesWithDefects = filteredWashRecipes
      .map((recipe) => {
        const recipeId = recipe._id.toString();
        const defectData = recipeDefectMap.get(recipeId) || { defectCount: 0 };

        // Calculate defect density
        const orderQty = recipe.orderId?.orderQty || 0;
        const defectDensity =
          orderQty > 0
            ? ((defectData.defectCount / orderQty) * 100).toFixed(2)
            : 0;

        // Get the top chemical used in this recipe
        const chemicalsUsed = recipe.steps
          .flatMap((step) => step.stepItems || [])
          .filter((item) => item.chemicalItemId)
          .map((item) => item.chemicalItemId.name);

        const chemicalCounts = {};
        chemicalsUsed.forEach((chem) => {
          chemicalCounts[chem] = (chemicalCounts[chem] || 0) + 1;
        });

        const topChemical =
          Object.entries(chemicalCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name)[0] || "N/A";

        // Get the primary process used in this recipe
        const processes = recipe.recipeProcessId
          .filter((process) => process.laundryProcessId)
          .map((process) => process.laundryProcessId.name);

        const primaryProcess = processes[0] || "N/A";

        // Calculate average temperature
        const temperatures = recipe.steps
          .filter((step) => step.temp)
          .map((step) => Number(step.temp))
          .filter((temp) => !isNaN(temp));

        const avgTemp =
          temperatures.length > 0
            ? (
                temperatures.reduce((sum, temp) => sum + temp, 0) /
                temperatures.length
              ).toFixed(1)
            : "N/A";

        return {
          id: recipeId,
          washCode:
            recipe.washCode || `Recipe-${recipe._id.toString().substr(-6)}`,
          articleNo: recipe.orderId?.articleNo || "Unknown",
          orderNo: recipe.orderId?.orderNo || "Unknown",
          orderQty: recipe.orderId?.orderQty || 0,
          // recipeName: recipe.recipeName || 'Unknown',
          // recipeCode: recipe.recipeCode || 'Unknown',

          washType: recipe.washType,
          date: recipe.date,
          defectCount: defectData.defectCount,
          defectDensity: `${defectDensity}%`,
          topChemical,
          primaryProcess,
          avgTemp,
          createdAt: recipe.createdAt,
        };
      })
      .sort((a, b) => b.defectCount - a.defectCount);

    // Get top defective recipes (top 10)
    const topDefective = [...recipesWithDefects]
      .sort((a, b) => b.defectCount - a.defectCount)
      .slice(0, 10);

    // Get lowest defective recipes with at least one defect (bottom 10)
    const lowestDefective = [...recipesWithDefects]
      .filter((recipe) => recipe.defectCount > 0)
      .sort((a, b) => a.defectCount - b.defectCount)
      .slice(0, 10);

    // Combine all data for the response
    return {
      summary: {
        totalWashRecipeDefects,
        totalDefects,
        washRecipeDefectRatio,
      },
      byWashType,
      byChemical,
      byProcess,
      byTemperature,
      byWaterRatio,
      byDuration,
      recipes: {
        all: recipesWithDefects,
        topDefective,
        lowestDefective,
      },
    };
  } catch (error) {
    console.error("Error in getWashRecipeDefectAnalytics service:", error);
    throw new Error("Failed to fetch wash recipe defect analytics");
  }
};
//****************************************************************************************************************** */

//****************************************************************************************************************** */

/**
 * Get comprehensive wash recipe defect analytics data
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Wash recipe analytics data
 */
exports.getWashRecipeDefectAnalytics2 = async (filters = {}) => {
  try {
    // Build query based on filters
    const query = {};

    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query.detectedDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    // Apply other filters
    if (filters.severity) query.severity = filters.severity;
    if (filters.status) query.status = filters.status;

    // Get all defects with populated references, focusing on wash recipe
    const defects = await Defect.find(query)
      .populate({
        path: "orderId",
        populate: [
          {
            path: "washRecipes",
            populate: [
              {
                path: "steps",
                populate: {
                  path: "stepItems",
                  populate: { path: "chemicalItemId" },
                },
              },
              {
                path: "recipeProcessId", // <-- Populate processes!
                // Optionally, you can further populate laundryProcessId if you want its name:
                populate: { path: "laundryProcessId" },
              },
            ],
          },
          { path: "fabric" },
          { path: "style" },
        ],
      })
      .populate("defectName")
      .populate("defectType")
      .populate("defectProcess")
      .lean();

    // Calculate total defects
    const totalDefects = defects.reduce(
      (sum, defect) => sum + (defect.defectCount || 1),
      0
    );

    // Initialize result object
    const result = {
      summary: {
        totalDefects,
        totalWashRecipeDefects: 0,
        washRecipeDefectRatio: 0,
      },
      byWashType: [],
      byChemical: [],
      byProcess: [],
      byTemperature: [],
      byWaterRatio: [],
      byDuration: [],
    };

    // Track unique wash types, chemicals, processes, etc.
    const washTypeMap = {};
    const chemicalMap = {};
    const processMap = {};
    const temperatureMap = {};
    const waterRatioMap = {};
    const durationMap = {};

    // Count wash recipe defects
    let washRecipeDefectCount = 0;

    // Process each defect
    defects.forEach((defect) => {
      // Skip if no wash recipe data
      if (!defect.orderId || !defect.orderId.washRecipes) return;

      const defectCount = defect.defectCount || 1;
      washRecipeDefectCount += defectCount;

      const washRecipes = Array.isArray(defect.orderId.washRecipes)
        ? defect.orderId.washRecipes
        : [];

      washRecipes.forEach((washRecipe) => {
        // Process wash type
        if (washRecipe.washType) {
          const washType = washRecipe.washType;
          if (!washTypeMap[washType]) {
            washTypeMap[washType] = {
              name: washType,
              count: 0,
              percentage: 0,
            };
          }
          washTypeMap[washType].count += defectCount;
        }

        // Process temperature ranges
        (washRecipe.steps || []).forEach((step) => {
          if (step.temp) {
            // Create temperature ranges (e.g., "30-40°C")
            const temp = parseInt(step.temp);
            const tempRange = `${Math.floor(temp / 10) * 10}-${
              Math.floor(temp / 10) * 10 + 10
            }°C`;

            if (!temperatureMap[tempRange]) {
              temperatureMap[tempRange] = {
                name: tempRange,
                count: 0,
                percentage: 0,
              };
            }
            temperatureMap[tempRange].count += defectCount;
          }
        });

        // Process water ratio (liters)
        (washRecipe.steps || []).forEach((step) => {
          if (step.liters) {
            // Create water ratio ranges
            const ratio = parseInt(step.liters);
            const ratioRange = `${Math.floor(ratio / 5) * 5}-${
              Math.floor(ratio / 5) * 5 + 5
            }L`;

            if (!waterRatioMap[ratioRange]) {
              waterRatioMap[ratioRange] = {
                name: ratioRange,
                count: 0,
                percentage: 0,
              };
            }
            waterRatioMap[ratioRange].count += defectCount;
          }
        });

        // Process duration (time)
        (washRecipe.steps || []).forEach((step) => {
          if (step.time) {
            // Create duration ranges in minutes
            const duration = parseInt(step.time);
            const durationRange = `${Math.floor(duration / 15) * 15}-${
              Math.floor(duration / 15) * 15 + 15
            }min`;

            if (!durationMap[durationRange]) {
              durationMap[durationRange] = {
                name: durationRange,
                count: 0,
                percentage: 0,
              };
            }
            durationMap[durationRange].count += defectCount;
          }
        });

        // Process wash steps and chemicals

        // Process chemicals
        (washRecipe.steps || []).forEach((step) => {
          // Check if step has chemical items
          if (!step.stepItems || step.stepItems.length === 0) return;
          // Process each chemical item
          step.stepItems.forEach((stepItem) => {
            // Check if stepItem has chemicalItemId
            if (stepItem.chemicalItemId) {
              // If populated, chemicalItemId will be an object with a .name property
              const chemicalName = stepItem.chemicalItemId.name;
              if (chemicalName) {
                if (!chemicalMap[chemicalName]) {
                  chemicalMap[chemicalName] = {
                    name: chemicalName,
                    count: 0,
                    percentage: 0,
                  };
                }
                chemicalMap[chemicalName].count += defectCount;
              }
            }
          });
        });
        // Process recipe process (e.g., SPRAY, DRY)

        (washRecipe.recipeProcessId || []).forEach((process) => {
          if (process.recipeProcessType) {
            const processType = process.recipeProcessType;
            if (!processMap[processType]) {
              processMap[processType] = {
                name: processType,
                count: 0,
                percentage: 0,
              };
            }
            processMap[processType].count += defectCount;
          }
        });

        // if (washRecipe.RecipeProcess && washRecipe.RecipeProcess.length > 0) {
        //   washRecipe.RecipeProcess.forEach((step) => {
        //     // Process step process (SPRAY, DRY, etc.)
        //     if (step.recipeProcessType) {
        //       const process = step.recipeProcessType;
        //       if (!processMap[process]) {
        //         processMap[process] = {
        //           name: process,
        //           count: 0,
        //           percentage: 0,
        //         };
        //       }
        //       processMap[process].count += defectCount;
        //     }
        //   });
        // }
      });
    });

    // Calculate percentages and sort results
    const calculatePercentageAndSort = (map, totalCount) => {
      return Object.values(map)
        .map((item) => ({
          ...item,
          percentage: ((item.count / totalCount) * 100).toFixed(1),
        }))
        .sort((a, b) => b.count - a.count);
    };

    // Update result with all processed data
    result.summary.totalWashRecipeDefects = washRecipeDefectCount;
    result.summary.washRecipeDefectRatio =
      totalDefects > 0
        ? ((washRecipeDefectCount / totalDefects) * 100).toFixed(1)
        : "0.0";

    result.byWashType = calculatePercentageAndSort(
      washTypeMap,
      washRecipeDefectCount
    );
    result.byChemical = calculatePercentageAndSort(
      chemicalMap,
      washRecipeDefectCount
    );
    result.byProcess = calculatePercentageAndSort(
      processMap,
      washRecipeDefectCount
    );
    result.byTemperature = calculatePercentageAndSort(
      temperatureMap,
      washRecipeDefectCount
    );
    result.byWaterRatio = calculatePercentageAndSort(
      waterRatioMap,
      washRecipeDefectCount
    );
    result.byDuration = calculatePercentageAndSort(
      durationMap,
      washRecipeDefectCount
    );

    return result;
  } catch (error) {
    console.error("Error fetching wash recipe defect analytics:", error);
    throw new Error("Failed to fetch wash recipe defect analytics 2");
  }
};

/**
 * Get comparison data for defect analysis
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} - Comparison data for visualization
 */
exports.getComparisonData = async (filters = {}) => {
  try {
    // Process dates from string to Date objects if provided
    let startDate, endDate;
    if (filters.startDate) startDate = new Date(filters.startDate);
    if (filters.endDate) endDate = new Date(filters.endDate);

    // Return structured data based on comparison type
    switch (filters.comparisonType) {
      case "fabric-vs-style":
        return {
          scatterData: await getScatterDataForFabricStyle(filters),
          fabricDefects: await getFabricDefects(filters),
          styleDefects: await getStyleDefects(filters),
          correlationScore: await calculateCorrelation(
            "fabric",
            "style",
            filters
          ),
          insights: await generateInsights("fabric-vs-style", filters),
        };
      case "composition-vs-defect":
        return {
          scatterData: await getScatterDataForComposition(filters),
          compositionData: await getCompositionData(filters),
          defectTypeData: await getDefectTypeData(filters),
          correlationScore: await calculateCorrelation(
            "composition",
            "defect",
            filters
          ),
          insights: await generateInsights("composition-vs-defect", filters),
        };
      case "time-vs-severity":
        return {
          timeSeriesData: await getTimeSeriesData(filters),
          severityTrends: await getSeverityTrends(filters),
          correlationScore: await calculateCorrelation(
            "time",
            "severity",
            filters
          ),
          insights: await generateInsights("time-vs-severity", filters),
        };
      default:
        throw new Error("Invalid comparison type");
    }
  } catch (error) {
    console.error("Error in getComparisonData service:", error);
    throw new Error(error.message || "Failed to generate comparison data");
  }
};

/**
 * Get scatter plot data for fabric vs style comparison
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Scatter plot data
 */
async function getScatterDataForFabricStyle(filters) {
  try {
    // Create date filter if dates are provided
    const dateFilter = {};
    if (filters.startDate)
      dateFilter.detectedDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      if (dateFilter.detectedDate) {
        dateFilter.detectedDate.$lte = new Date(filters.endDate);
      } else {
        dateFilter.detectedDate = { $lte: new Date(filters.endDate) };
      }
    }

    // Aggregation pipeline to get defects grouped by fabric and style
    const defects = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          ...(filters.severity && { severity: filters.severity }),
          ...(filters.status && { status: filters.status }),
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $lookup: {
          from: "fabrics",
          localField: "order.fabric",
          foreignField: "_id",
          as: "fabric",
        },
      },
      {
        $lookup: {
          from: "styles",
          localField: "order.style",
          foreignField: "_id",
          as: "style",
        },
      },
      { $unwind: "$fabric" },
      { $unwind: "$style" },
      {
        $group: {
          _id: {
            fabricId: "$fabric._id",
            styleId: "$style._id",
          },
          fabricName: { $first: "$fabric.name" },
          styleName: { $first: "$style.name" },
          defectCount: { $sum: "$defectCount" },
          orderCount: { $addToSet: "$order._id" },
        },
      },
      {
        $project: {
          _id: 0,
          fabricId: "$_id.fabricId",
          styleId: "$_id.styleId",
          fabricName: 1,
          styleName: 1,
          defectCount: 1,
          orderCount: { $size: "$orderCount" },
        },
      },
      { $sort: { defectCount: -1 } },
    ]);

    return defects.map((item) => ({
      x: item.fabricName,
      y: item.styleName,
      size: item.defectCount,
      orders: item.orderCount,
      fabricId: item.fabricId,
      styleId: item.styleId,
    }));
  } catch (error) {
    console.error("Error in getScatterDataForFabricStyle:", error);
    throw error;
  }
}

/**
 * Get fabric defects data
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Fabric defects data
 */
async function getFabricDefects(filters) {
  try {
    const dateFilter = {};
    if (filters.startDate)
      dateFilter.detectedDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      if (dateFilter.detectedDate) {
        dateFilter.detectedDate.$lte = new Date(filters.endDate);
      } else {
        dateFilter.detectedDate = { $lte: new Date(filters.endDate) };
      }
    }

    const fabricDefects = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          ...(filters.severity && { severity: filters.severity }),
          ...(filters.status && { status: filters.status }),
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $lookup: {
          from: "fabrics",
          localField: "order.fabric",
          foreignField: "_id",
          as: "fabric",
        },
      },
      { $unwind: "$fabric" },
      {
        $group: {
          _id: "$fabric._id",
          fabricName: { $first: "$fabric.name" },
          fabricCode: { $first: "$fabric.code" },
          defectCount: { $sum: "$defectCount" },
          highSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "High"] }, "$defectCount", 0],
            },
          },
          mediumSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "Medium"] }, "$defectCount", 0],
            },
          },
          lowSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "Low"] }, "$defectCount", 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "fabriccompositions",
          localField: "_id",
          foreignField: "fabric",
          as: "compositions",
        },
      },
      {
        $project: {
          _id: 1,
          fabricName: 1,
          fabricCode: 1,
          defectCount: 1,
          highSeverity: 1,
          mediumSeverity: 1,
          lowSeverity: 1,
          compositions: 1,
        },
      },
      { $sort: { defectCount: -1 } },
    ]);

    // Additional processing to get compositions
    for (const fabric of fabricDefects) {
      if (fabric.compositions && fabric.compositions.length > 0) {
        const populatedCompositions = await Promise.all(
          fabric.compositions.map(async (comp) => {
            const compositionItem = await CompositionItem.findById(
              comp.compositionItem
            );
            return {
              name: compositionItem ? compositionItem.name : "Unknown",
              value: comp.value,
            };
          })
        );
        fabric.compositionsFormatted = populatedCompositions;
      }
    }

    return fabricDefects;
  } catch (error) {
    console.error("Error in getFabricDefects:", error);
    throw error;
  }
}

/**
 * Get style defects data
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Style defects data
 */
async function getStyleDefects(filters) {
  try {
    const dateFilter = {};
    if (filters.startDate)
      dateFilter.detectedDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      if (dateFilter.detectedDate) {
        dateFilter.detectedDate.$lte = new Date(filters.endDate);
      } else {
        dateFilter.detectedDate = { $lte: new Date(filters.endDate) };
      }
    }

    const styleDefects = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          ...(filters.severity && { severity: filters.severity }),
          ...(filters.status && { status: filters.status }),
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $lookup: {
          from: "styles",
          localField: "order.style",
          foreignField: "_id",
          as: "style",
        },
      },
      { $unwind: "$style" },
      {
        $lookup: {
          from: "brands",
          localField: "style.brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: {
          path: "$brand",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$style._id",
          styleName: { $first: "$style.name" },
          styleNo: { $first: "$style.styleNo" },
          brandName: { $first: "$brand.name" },
          defectCount: { $sum: "$defectCount" },
          highSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "High"] }, "$defectCount", 0],
            },
          },
          mediumSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "Medium"] }, "$defectCount", 0],
            },
          },
          lowSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "Low"] }, "$defectCount", 0],
            },
          },
          totalOrderQty: { $sum: "$order.orderQty" }, // Sum the order quantities for each style
        },
      },
      {
        $project: {
          _id: 1,
          styleName: 1,
          styleNo: 1,
          brandName: 1,
          defectCount: 1,
          highSeverity: 1,
          mediumSeverity: 1,
          lowSeverity: 1,
          totalOrderQty: 1,
          defectRatio: {
            $cond: [
              { $gt: ["$totalOrderQty", 0] },
              {
                $multiply: [
                  { $divide: ["$defectCount", "$totalOrderQty"] },
                  100,
                ],
              },
              null,
            ],
          },
        },
      },
      { $sort: { defectCount: -1 } },
    ]);

    return styleDefects;
  } catch (error) {
    console.error("Error in getStyleDefects:", error);
    throw error;
  }
}

/**
 * Get scatter data for composition vs defect
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Scatter plot data
 */
async function getScatterDataForComposition(filters) {
  try {
    const dateFilter = {};
    if (filters.startDate)
      dateFilter.detectedDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      if (dateFilter.detectedDate) {
        dateFilter.detectedDate.$lte = new Date(filters.endDate);
      } else {
        dateFilter.detectedDate = { $lte: new Date(filters.endDate) };
      }
    }

    // First get defects with their related orders and fabrics
    const defects = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          ...(filters.severity && { severity: filters.severity }),
          ...(filters.status && { status: filters.status }),
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $lookup: {
          from: "fabrics",
          localField: "order.fabric",
          foreignField: "_id",
          as: "fabric",
        },
      },
      { $unwind: "$fabric" },
      {
        $lookup: {
          from: "defectnames",
          localField: "defectName",
          foreignField: "_id",
          as: "defectNameObj",
        },
      },
      {
        $unwind: {
          path: "$defectNameObj",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "defecttypes",
          localField: "defectType",
          foreignField: "_id",
          as: "defectTypeObj",
        },
      },
      {
        $unwind: {
          path: "$defectTypeObj",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          defectNameStr: { $ifNull: ["$defectNameObj.name", "Unknown"] },
          defectTypeStr: { $ifNull: ["$defectTypeObj.name", "Unknown"] },
          fabricId: "$fabric._id",
          fabricName: "$fabric.name",
          severity: 1,
          defectCount: 1,
        },
      },
    ]);

    // Then get composition data for each fabric
    const fabricIds = [...new Set(defects.map((d) => d.fabricId.toString()))];

    const fabricCompositions = await FabricComposition.aggregate([
      {
        $match: {
          fabric: { $in: fabricIds.map((id) => mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $lookup: {
          from: "compositionitems",
          localField: "compositionItem",
          foreignField: "_id",
          as: "compositionItemObj",
        },
      },
      { $unwind: "$compositionItemObj" },
      {
        $project: {
          fabricId: "$fabric",
          compositionName: "$compositionItemObj.name",
          value: 1,
        },
      },
    ]);

    // Create a map of fabric compositions
    const fabricCompositionMap = {};
    fabricCompositions.forEach((comp) => {
      const fabricId = comp.fabricId.toString();
      if (!fabricCompositionMap[fabricId]) {
        fabricCompositionMap[fabricId] = [];
      }
      fabricCompositionMap[fabricId].push({
        name: comp.compositionName,
        value: comp.value,
      });
    });

    // Combine defects with composition data
    const scatterData = defects.map((defect) => {
      const fabricId = defect.fabricId.toString();
      const compositions = fabricCompositionMap[fabricId] || [];

      // Find the dominant composition (highest percentage)
      let dominantComposition = { name: "Unknown", value: 0 };
      if (compositions.length > 0) {
        dominantComposition = compositions.reduce((prev, current) =>
          prev.value > current.value ? prev : current
        );
      }

      return {
        x: dominantComposition.name,
        y: defect.defectTypeStr,
        size: defect.defectCount,
        severity: defect.severity,
        fabricName: defect.fabricName,
        fabricId: fabricId,
        compositions: compositions,
        defectName: defect.defectNameStr,
      };
    });

    // Group by dominant composition and defect type
    const groupedData = {};
    scatterData.forEach((item) => {
      const key = `${item.x}|${item.y}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          x: item.x,
          y: item.y,
          size: 0,
          count: 0,
          severityCounts: { High: 0, Medium: 0, Low: 0 },
          defects: [],
        };
      }
      groupedData[key].size += item.size;
      groupedData[key].count += 1;
      groupedData[key].severityCounts[item.severity] += item.size;
      groupedData[key].defects.push({
        fabricName: item.fabricName,
        defectName: item.defectName,
        severity: item.severity,
        count: item.size,
      });
    });

    return Object.values(groupedData);
  } catch (error) {
    console.error("Error in getScatterDataForComposition:", error);
    throw error;
  }
}

/**
 * Get composition data
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Composition data
 */
async function getCompositionData(filters) {
  try {
    // Aggregate composition data across fabrics used in orders with defects
    const dateFilter = {};
    if (filters.startDate)
      dateFilter.detectedDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      if (dateFilter.detectedDate) {
        dateFilter.detectedDate.$lte = new Date(filters.endDate);
      } else {
        dateFilter.detectedDate = { $lte: new Date(filters.endDate) };
      }
    }

    // First get distinct fabric IDs from orders with defects
    const defects = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          ...(filters.severity && { severity: filters.severity }),
          ...(filters.status && { status: filters.status }),
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $group: {
          _id: "$order.fabric",
          defectCount: { $sum: "$defectCount" },
        },
      },
    ]);

    const fabricIds = defects.map((d) => d._id);

    // Get composition data for these fabrics
    const compositions = await FabricComposition.aggregate([
      {
        $match: {
          fabric: { $in: fabricIds },
        },
      },
      {
        $lookup: {
          from: "compositionitems",
          localField: "compositionItem",
          foreignField: "_id",
          as: "compositionItem",
        },
      },
      { $unwind: "$compositionItem" },
      {
        $lookup: {
          from: "fabrics",
          localField: "fabric",
          foreignField: "_id",
          as: "fabric",
        },
      },
      { $unwind: "$fabric" },
      {
        $group: {
          _id: "$compositionItem._id",
          name: { $first: "$compositionItem.name" },
          totalValue: { $sum: "$value" },
          fabricCount: { $sum: 1 },
          fabrics: {
            $push: {
              id: "$fabric._id",
              name: "$fabric.name",
              value: "$value",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          averageValue: { $divide: ["$totalValue", "$fabricCount"] },
          fabricCount: 1,
          fabrics: 1,
        },
      },
      { $sort: { fabricCount: -1 } },
    ]);

    // For each composition, calculate the defect relationship
    for (const composition of compositions) {
      const fabricsWithDefects = composition.fabrics.map((fabric) => {
        const defectInfo = defects.find(
          (d) => d._id.toString() === fabric.id.toString()
        );
        return {
          ...fabric,
          defectCount: defectInfo ? defectInfo.defectCount : 0,
        };
      });

      composition.fabricsWithDefects = fabricsWithDefects;
      composition.totalDefectCount = fabricsWithDefects.reduce(
        (sum, fabric) => sum + fabric.defectCount,
        0
      );
    }

    return compositions;
  } catch (error) {
    console.error("Error in getCompositionData:", error);
    throw error;
  }
}

/**
 * Get defect type data
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Defect type data
 */
async function getDefectTypeData(filters) {
  try {
    const dateFilter = {};
    if (filters.startDate)
      dateFilter.detectedDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      if (dateFilter.detectedDate) {
        dateFilter.detectedDate.$lte = new Date(filters.endDate);
      } else {
        dateFilter.detectedDate = { $lte: new Date(filters.endDate) };
      }
    }

    const defectTypeData = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          ...(filters.severity && { severity: filters.severity }),
          ...(filters.status && { status: filters.status }),
        },
      },
      {
        $lookup: {
          from: "defecttypes",
          localField: "defectType",
          foreignField: "_id",
          as: "defectTypeObj",
        },
      },
      {
        $unwind: {
          path: "$defectTypeObj",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "defectnames",
          localField: "defectName",
          foreignField: "_id",
          as: "defectNameObj",
        },
      },
      {
        $unwind: {
          path: "$defectNameObj",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            defectType: "$defectType",
            defectName: "$defectName",
          },
          defectTypeName: {
            $first: { $ifNull: ["$defectTypeObj.name", "Unknown"] },
          },
          defectName: {
            $first: { $ifNull: ["$defectNameObj.name", "Unknown"] },
          },
          count: { $sum: "$defectCount" },
          highSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "High"] }, "$defectCount", 0],
            },
          },
          mediumSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "Medium"] }, "$defectCount", 0],
            },
          },
          lowSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "Low"] }, "$defectCount", 0],
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.defectType",
          typeName: { $first: "$defectTypeName" },
          totalCount: { $sum: "$count" },
          highSeverity: { $sum: "$highSeverity" },
          mediumSeverity: { $sum: "$mediumSeverity" },
          lowSeverity: { $sum: "$lowSeverity" },
          defects: {
            $push: {
              name: "$defectName",
              count: "$count",
              highSeverity: "$highSeverity",
              mediumSeverity: "$mediumSeverity",
              lowSeverity: "$lowSeverity",
            },
          },
        },
      },
      { $sort: { totalCount: -1 } },
    ]);

    return defectTypeData;
  } catch (error) {
    console.error("Error in getDefectTypeData:", error);
    throw error;
  }
}

/**
 * Get time series data
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Time series data
 */
async function getTimeSeriesData(filters) {
  try {
    // Determine the grouping based on the date range
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    let dateFormat;
    let groupingField;

    if (startDate && endDate) {
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 31) {
        // Group by day for ranges under a month
        dateFormat = "%Y-%m-%d";
        groupingField = {
          year: { $year: "$detectedDate" },
          month: { $month: "$detectedDate" },
          day: { $dayOfMonth: "$detectedDate" },
        };
      } else if (daysDiff <= 365) {
        // Group by week for ranges under a year
        dateFormat = "%Y-W%U";
        groupingField = {
          year: { $year: "$detectedDate" },
          week: { $week: "$detectedDate" },
        };
      } else {
        // Group by month for ranges over a year
        dateFormat = "%Y-%m";
        groupingField = {
          year: { $year: "$detectedDate" },
          month: { $month: "$detectedDate" },
        };
      }
    } else {
      // Default to monthly grouping
      dateFormat = "%Y-%m";
      groupingField = {
        year: { $year: "$detectedDate" },
        month: { $month: "$detectedDate" },
      };
    }

    const dateFilter = {};
    if (startDate) dateFilter.detectedDate = { $gte: startDate };
    if (endDate) {
      if (dateFilter.detectedDate) {
        dateFilter.detectedDate.$lte = endDate;
      } else {
        dateFilter.detectedDate = { $lte: endDate };
      }
    }

    const timeSeriesData = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          ...(filters.severity && { severity: filters.severity }),
          ...(filters.status && { status: filters.status }),
        },
      },
      {
        $group: {
          _id: groupingField,
          dateStr: {
            $first: {
              $dateToString: { format: dateFormat, date: "$detectedDate" },
            },
          },
          count: { $sum: "$defectCount" },
          highSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "High"] }, "$defectCount", 0],
            },
          },
          mediumSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "Medium"] }, "$defectCount", 0],
            },
          },
          lowSeverity: {
            $sum: {
              $cond: [{ $eq: ["$severity", "Low"] }, "$defectCount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$dateStr",
          count: 1,
          highSeverity: 1,
          mediumSeverity: 1,
          lowSeverity: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return timeSeriesData;
  } catch (error) {
    console.error("Error in getTimeSeriesData:", error);
    throw error;
  }
}

/**
 * Get severity trends
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} - Severity trends data
 */
async function getSeverityTrends(filters) {
  try {
    const dateFilter = {};
    if (filters.startDate)
      dateFilter.detectedDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      if (dateFilter.detectedDate) {
        dateFilter.detectedDate.$lte = new Date(filters.endDate);
      } else {
        dateFilter.detectedDate = { $lte: new Date(filters.endDate) };
      }
    }

    const severityCounts = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          ...(filters.status && { status: filters.status }),
        },
      },
      {
        $group: {
          _id: "$severity",
          count: { $sum: "$defectCount" },
        },
      },
      {
        $project: {
          _id: 0,
          severity: "$_id",
          count: 1,
        },
      },
    ]);

    // Convert array to object for easier access
    const severityMap = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    severityCounts.forEach((item) => {
      if (item.severity) {
        severityMap[item.severity] = item.count;
      }
    });

    // Calculate total and percentages
    const total = Object.values(severityMap).reduce(
      (sum, count) => sum + count,
      0
    );

    const trends = {
      counts: severityMap,
      total,
      percentages: {
        High: total > 0 ? ((severityMap.High / total) * 100).toFixed(2) : 0,
        Medium: total > 0 ? ((severityMap.Medium / total) * 100).toFixed(2) : 0,
        Low: total > 0 ? ((severityMap.Low / total) * 100).toFixed(2) : 0,
      },
    };

    // Get resolution time data by severity
    const resolutionData = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          status: "Resolved",
        },
      },
      {
        $addFields: {
          resolutionTime: {
            $subtract: ["$resolvedDate", "$detectedDate"],
          },
        },
      },
      {
        $group: {
          _id: "$severity",
          averageResolutionTime: { $avg: "$resolutionTime" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          severity: "$_id",
          averageResolutionTime: {
            $divide: ["$averageResolutionTime", 1000 * 60 * 60],
          }, // Convert to hours
          count: 1,
        },
      },
    ]);
    const resolutionMap = {
      High: { averageResolutionTime: 0, count: 0 },
      Medium: { averageResolutionTime: 0, count: 0 },
      Low: { averageResolutionTime: 0, count: 0 },
    };
    resolutionData.forEach((item) => {
      if (item.severity) {
        resolutionMap[item.severity].averageResolutionTime =
          item.averageResolutionTime;
        resolutionMap[item.severity].count = item.count;
      }
    });
    trends.resolutionTimes = resolutionMap;
    return trends;
  } catch (error) {
    console.error("Error in getSeverityTrends:", error);
    throw error;
  }
}
/**
 * Calculate correlation between two fields
 * @param {String} field1 - First field to compare
 * @param {String} field2 - Second field to compare
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Number>} - Correlation score
 */
async function calculateCorrelation(field1, field2, filters) {
  try {
    const dateFilter = {};
    if (filters.startDate)
      dateFilter.detectedDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      if (dateFilter.detectedDate) {
        dateFilter.detectedDate.$lte = new Date(filters.endDate);
      } else {
        dateFilter.detectedDate = { $lte: new Date(filters.endDate) };
      }
    }

    const correlationData = await Defect.aggregate([
      {
        $match: {
          ...dateFilter,
          ...(filters.severity && { severity: filters.severity }),
          ...(filters.status && { status: filters.status }),
        },
      },
      {
        $group: {
          _id: null,
          field1Values: { $push: `$${field1}` },
          field2Values: { $push: `$${field2}` },
        },
      },
      {
        $project: {
          _id: 0,
          field1Values: 1,
          field2Values: 1,
        },
      },
    ]);

    if (correlationData.length === 0) return null;

    const { field1Values, field2Values } = correlationData[0];
    if (field1Values.length !== field2Values.length) return null;

    // Calculate correlation coefficient
    const n = field1Values.length;
    const sumX = field1Values.reduce((a, b) => a + b, 0);
    const sumY = field2Values.reduce((a, b) => a + b, 0);
    const sumXY = field1Values.reduce(
      (sum, x, i) => sum + x * field2Values[i],
      0
    );
    const sumX2 = field1Values.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = field2Values.reduce((sum, y) => sum + y * y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator !== 0 ? numerator / denominator : null;
  } catch (error) {
    console.error("Error in calculateCorrelation:", error);
    throw error;
  }
}
/**
 * Generate insights based on the comparison type
 * @param {String} comparisonType - Type of comparison
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} - Insights data
 */
async function generateInsights(comparisonType, filters) {
  try {
    // Placeholder for insights generation logic
    // This could involve complex analysis and machine learning models
    // For now, we will return a simple message
    return {
      message: `Insights for ${comparisonType} comparison generated successfully.`,
      filters: filters,
    };
  } catch (error) {
    console.error("Error in generateInsights:", error);
    throw error;
  }
}
