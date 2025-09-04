// controllers/productionController.js
const express = require('express');
const router = express.Router();
const { computeSchedule } = require('../utils/scheduleCalculator');
const Order = require('../models/order/Order'); // adjust path if needed

/**
 * POST /api/production/compute
 * Body:
 * {
 *   orderId: string,                // optional: either orderId OR order object
 *   order: { orderQty, deliveryDate } // alternative
 *   line: "Line 1",
 *   lineCapacity: 900,
 *   shiftsPerDay: 1,
 *   fabricAvailableDate: "2025-06-01",
 *   overrides: { sewingStart: "2025-06-15", inspectionDate: "2025-07-05" },
 *   holidays: ["2025-06-28","2025-07-23"],
 *   zone: "Africa/Cairo"            // optional timezone
 * }
 */
// router.post('/compute', async (req, res) => {
exports.computeSchedule = async (req, res) => {
  try {
    const {
      orderId,
      order: orderObject,
      line,
      lineCapacity,
      shiftsPerDay,
      fabricAvailableDate,
      overrides,
      holidays,
      zone
    } = req.body;

    let order = orderObject;
    if (orderId && !order) {
      order = await Order.findById(orderId).lean();
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order) return res.status(400).json({ success: false, message: 'Order or orderId required' });
    if (!fabricAvailableDate) return res.status(400).json({ success: false, message: 'fabricAvailableDate is required' });

    const computed = computeSchedule({
      order,
      line: line || 'Line 1',
      lineCapacity: lineCapacity || 900,
      shiftsPerDay: shiftsPerDay || 1,
      fabricAvailableDate,
      overrides: overrides || {},
      holidays: holidays || [],
      zone: zone || 'UTC'
    });

    res.json({ success: true, data: computed });
  } catch (err) {
    console.error('Error in /api/production/compute', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to compute schedule' });
  }
};
// );

// module.exports = router;
