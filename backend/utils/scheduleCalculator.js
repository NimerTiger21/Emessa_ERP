// utils/scheduleCalculator.js
const { DateTime } = require('luxon');

/**
 * Helper: check if a DateTime is weekend
 */
function isWeekend(dt) {
  return dt.weekday === 6 || dt.weekday === 7; // 6=Sat,7=Sun
}

/**
 * Add business days (skip weekends & holidays).
 * Input/output are Luxon DateTime objects or ISO strings.
 */
function addBusinessDays(dtInput, days, holidays = [], zone = 'UTC') {
  let dt = typeof dtInput === 'string' ? DateTime.fromISO(dtInput, { zone }).startOf('day') : dtInput.startOf('day');
  if (!dt.isValid) throw new Error(`Invalid date input to addBusinessDays: ${dtInput}`);

  let added = 0;
  while (added < days) {
    dt = dt.plus({ days: 1 });
    if (isWeekend(dt)) continue;
    if (holidays.includes(dt.toISODate())) continue;
    added++;
  }
  return dt;
}

/**
 * Subtract business days (skip weekends & holidays).
 */
function subtractBusinessDays(dtInput, days, holidays = [], zone = 'UTC') {
  let dt = typeof dtInput === 'string' ? DateTime.fromISO(dtInput, { zone }).startOf('day') : dtInput.startOf('day');
  if (!dt.isValid) throw new Error(`Invalid date input to subtractBusinessDays: ${dtInput}`);

  let subtracted = 0;
  while (subtracted < days) {
    dt = dt.minus({ days: 1 });
    if (isWeekend(dt)) continue;
    if (holidays.includes(dt.toISODate())) continue;
    subtracted++;
  }
  return dt;
}

/**
 * Utility: return ISO date string (yyyy-MM-dd)
 */
function toISODate(dt) {
  if (!dt) return null;
  if (typeof dt === 'string') return DateTime.fromISO(dt).toISODate();
  return dt.toISODate();
}

/**
 * Business-specific mapping
 */
const inspectionOffsetByWeekday = {
  5: 3, // Fri
  6: 2, // Sat
  7: 1, // Sun
  1: 1, // Mon
  2: 1, // Tue
  3: 1, // Wed
  4: 4  // Thu
};

// Example mapping — adjust as ops require
const possibleDDOffsetsByWeekday = {
  1: 9, // Mon
  2: 8, // Tue
  3: 7, // Wed
  4: 6, // Thu
  5: 5, // Fri (fallback)
  6: 4, // Sat
  7: 3  // Sun
};

/**
 * Ordered list of milestone keys (dependency order)
 */
const MILESTONE_KEYS = [
  'preparationStart',
  'cuttingStart',
  'sewingStart',
  'sewingEnd',
  'lastOutputFromLine',
  'lastOutputFromLaundry',
  'lastOutputFromPacking',
  'readyForInspection',
  'inspectionDate',
  'possibleDD'
];

/**
 * computeSchedule
 *
 * Inputs:
 *  - order: { orderQty: Number, deliveryDate: ISO string (yyyy-mm-dd) }
 *  - line: string (name)
 *  - lineCapacity: number (per day)
 *  - shiftsPerDay: number (optional)
 *  - fabricAvailableDate: ISO string (yyyy-mm-dd)  // required
 *  - overrides: object { milestoneKey: ISODateString, ... } optional
 *  - holidays: array of ISO date strings to skip
 *  - zone: timezone string (default 'UTC')
 *
 * Returns:
 *   { milestones: { key: { date, overridden, original } }, deviationDays, progression data... }
 */
function computeSchedule({
  order,
  line,
  lineCapacity = 900,
  shiftsPerDay = 1,
  fabricAvailableDate,
  overrides = {},
  holidays = [],
  zone = 'UTC'
}) {
  if (!order) throw new Error('order is required');
  if (!fabricAvailableDate) throw new Error('fabricAvailableDate is required');

  const orderQty = Number(order.orderQty || 0);
  const originalETD = order.deliveryDate ? DateTime.fromISO(order.deliveryDate, { zone }).startOf('day') : null;

  const capacityPerDay = Math.max(1, Math.round(lineCapacity * (shiftsPerDay || 1)));
  const sewingDurationDays = Math.max(1, Math.ceil(orderQty / capacityPerDay)); // at least 1 day

  // cutting offset (business rule)
  const cuttingOffset = orderQty < 2000 ? 4 : 6;
  const prepOffset = 16; // fixed

  // compute initial "defaults" chain starting from fabricAvailableDate
  let defaults = {};

  // earliest possible sewingStart: we allow sewing to start same day fabric arrives
  const fabricDT = DateTime.fromISO(fabricAvailableDate, { zone }).startOf('day');
  if (!fabricDT.isValid) throw new Error('Invalid fabricAvailableDate');

  // Default sewingStart = fabricAvailableDate (earliest)
  const sewingStartDT = fabricDT;
  const sewingEndDT = addBusinessDays(sewingStartDT, sewingDurationDays - 1, holidays, zone);
  const cuttingStartDT = subtractBusinessDays(sewingStartDT, cuttingOffset, holidays, zone);
  const preparationStartDT = subtractBusinessDays(cuttingStartDT, prepOffset, holidays, zone);

  const lastOutputFromLineDT = addBusinessDays(sewingEndDT, 5, holidays, zone);
  const lastOutputFromLaundryDT = addBusinessDays(lastOutputFromLineDT, 14, holidays, zone);
  const lastOutputFromPackingDT = addBusinessDays(lastOutputFromLaundryDT, 3, holidays, zone);
  const readyForInspectionDT = addBusinessDays(lastOutputFromPackingDT, 3, holidays, zone);

  const inspectionOffset = inspectionOffsetByWeekday[readyForInspectionDT.weekday] || 1;
  const inspectionDateDT = addBusinessDays(readyForInspectionDT, inspectionOffset, holidays, zone);

  const possibleDDOffset = possibleDDOffsetsByWeekday[inspectionDateDT.weekday] || 7;
  const possibleDD_DT = addBusinessDays(inspectionDateDT, possibleDDOffset, holidays, zone);

  // Build defaults map
  defaults.preparationStart = preparationStartDT;
  defaults.cuttingStart = cuttingStartDT;
  defaults.sewingStart = sewingStartDT;
  defaults.sewingEnd = sewingEndDT;
  defaults.lastOutputFromLine = lastOutputFromLineDT;
  defaults.lastOutputFromLaundry = lastOutputFromLaundryDT;
  defaults.lastOutputFromPacking = lastOutputFromPackingDT;
  defaults.readyForInspection = readyForInspectionDT;
  defaults.inspectionDate = inspectionDateDT;
  defaults.possibleDD = possibleDD_DT;

  // Initialize result milestones with default values
  const milestones = {};
  MILESTONE_KEYS.forEach((k) => {
    milestones[k] = {
      date: toISODate(defaults[k]),
      overridden: false,
      original: null
    };
  });

  // Helper to set override on a key (store original first)
  function applyOverride(key, isoDate) {
    if (!isoDate) return;
    const newDt = DateTime.fromISO(isoDate, { zone }).startOf('day');
    if (!newDt.isValid) throw new Error(`Invalid override date for ${key}: ${isoDate}`);

    // store original if not already overridden
    if (!milestones[key].overridden) {
      milestones[key].original = milestones[key].date;
    }
    milestones[key].date = newDt.toISODate();
    milestones[key].overridden = true;
  }

  // First, apply any overrides but *do not* cascade yet.
  // We must apply them in dependency order to ensure consistent originals.
  MILESTONE_KEYS.forEach((key) => {
    if (overrides && overrides[key]) {
      applyOverride(key, overrides[key]);
    }
  });

  // Cascade recompute: when a key's date is changed (either override or original),
  // recompute downstream keys that are NOT overridden.
  // We'll iterate keys in order and for each key, if its upstream changed (i.e. its current value
  // differs from computed default) then recompute downstream defaults and update non-overridden keys.
  // To simplify, we'll recompute defaults progressively starting from the earliest changed key.

  // function to recompute defaults starting from a given key's computed DateTime
  function recomputeFrom(key) {
    // Build a mapping of DateTimes starting from current values
    // We'll use current milestone dates as DateTime for upstream and compute downstream step-by-step
    const current = {};
    MILESTONE_KEYS.forEach((k) => {
      current[k] = DateTime.fromISO(milestones[k].date, { zone }).startOf('day');
    });

    // Now recompute downstream from key (apply business rules)
    // Implement rules for each step using current values where appropriate
    // We'll compute sequentially from the first key to the last but using current values as they stand.
    // Preparation and cutting depend on sewingStart; sewingEnd depends on sewingStart & duration.
    // So we re-calc sewingEnd using current.sewingStart, then downstream.
    // Also if sewingStart is later than fabricAvailableDate, that's fine.

    // Recompute sewingEnd from sewingStart (current.sewingStart)
    // sewingDurationDays uses orderQty and capacity (unchanged)
    const curSewingStart = current.sewingStart;
    const newSewingEnd = addBusinessDays(curSewingStart, sewingDurationDays - 1, holidays, zone);
    if (!milestones.sewingEnd.overridden) {
      milestones.sewingEnd.date = newSewingEnd.toISODate();
    }

    // Recompute cuttingStart = sewingStart - cuttingOffset, unless overridden
    const newCuttingStart = subtractBusinessDays(curSewingStart, cuttingOffset, holidays, zone);
    if (!milestones.cuttingStart.overridden) {
      milestones.cuttingStart.date = newCuttingStart.toISODate();
    }

    // Recompute preparationStart = cuttingStart - prepOffset
    const effectiveCuttingStart = DateTime.fromISO(milestones.cuttingStart.date, { zone }).startOf('day');
    const newPrepStart = subtractBusinessDays(effectiveCuttingStart, prepOffset, holidays, zone);
    if (!milestones.preparationStart.overridden) {
      milestones.preparationStart.date = newPrepStart.toISODate();
    }

    // Last output from line = sewingEnd + 5
    const curSewingEnd = DateTime.fromISO(milestones.sewingEnd.date, { zone }).startOf('day');
    const newLastOutputFromLine = addBusinessDays(curSewingEnd, 5, holidays, zone);
    if (!milestones.lastOutputFromLine.overridden) {
      milestones.lastOutputFromLine.date = newLastOutputFromLine.toISODate();
    }

    // Laundry = lastOutputFromLine + 14
    const curLastOutputFromLine = DateTime.fromISO(milestones.lastOutputFromLine.date, { zone }).startOf('day');
    const newLaundry = addBusinessDays(curLastOutputFromLine, 14, holidays, zone);
    if (!milestones.lastOutputFromLaundry.overridden) {
      milestones.lastOutputFromLaundry.date = newLaundry.toISODate();
    }

    // Packing = laundry + 3
    const curLaundry = DateTime.fromISO(milestones.lastOutputFromLaundry.date, { zone }).startOf('day');
    const newPacking = addBusinessDays(curLaundry, 3, holidays, zone);
    if (!milestones.lastOutputFromPacking.overridden) {
      milestones.lastOutputFromPacking.date = newPacking.toISODate();
    }

    // ReadyForInspection = packing + 3
    const curPacking = DateTime.fromISO(milestones.lastOutputFromPacking.date, { zone }).startOf('day');
    const newReady = addBusinessDays(curPacking, 3, holidays, zone);
    if (!milestones.readyForInspection.overridden) {
      milestones.readyForInspection.date = newReady.toISODate();
    }

    // InspectionDate = readyForInspection + inspection offset by weekday
    const curReady = DateTime.fromISO(milestones.readyForInspection.date, { zone }).startOf('day');
    const inspectOffset = inspectionOffsetByWeekday[curReady.weekday] || 1;
    const newInspection = addBusinessDays(curReady, inspectOffset, holidays, zone);
    if (!milestones.inspectionDate.overridden) {
      milestones.inspectionDate.date = newInspection.toISODate();
    }

    // possibleDD = inspectionDate + offset by weekday mapping
    const curInspection = DateTime.fromISO(milestones.inspectionDate.date, { zone }).startOf('day');
    const possibleOffset = possibleDDOffsetsByWeekday[curInspection.weekday] || 7;
    const newPossibleDD = addBusinessDays(curInspection, possibleOffset, holidays, zone);
    if (!milestones.possibleDD.overridden) {
      milestones.possibleDD.date = newPossibleDD.toISODate();
    }
  }

  // To ensure cascades are applied correctly, we will:
  // - Find earliest milestone that differs from initial default (either because of override or other reason)
  // - Recompute forward from that milestone
  // However simpler and safe approach: if any override exists, iterate all override keys in MILESTONE_KEYS order and recomputeFrom(that key).
  MILESTONE_KEYS.forEach((k) => {
    if (overrides && overrides[k]) {
      recomputeFrom(k);
    }
  });

  // Edge case: if sewingStart wasn't overridden but fabricAvailableDate changed, sewingStart may still be the fabric date.
  // We'll recompute once from the earliest key (preparationStart) to ensure consistency.
  recomputeFrom('preparationStart');

  // Finally compute deviationDays:
  const finalPossibleDD = DateTime.fromISO(milestones.possibleDD.date, { zone }).startOf('day');
  let deviationDays = null;
  if (originalETD && finalPossibleDD && originalETD.isValid) {
    deviationDays = Math.ceil(finalPossibleDD.diff(originalETD, 'days').days); // positive => possibleDD after originalETD (delay)
  }

  // Progress status (derived)
  const today = DateTime.local().setZone(zone).startOf('day');
  let progressStatus = 'Planned';
  const sStart = DateTime.fromISO(milestones.sewingStart.date, { zone });
  const sEnd = DateTime.fromISO(milestones.sewingEnd.date, { zone });

  if (today < DateTime.fromISO(milestones.preparationStart.date, { zone })) progressStatus = 'Planned';
  else if (today >= DateTime.fromISO(milestones.preparationStart.date, { zone }) && today < DateTime.fromISO(milestones.cuttingStart.date, { zone })) progressStatus = 'Preparation';
  else if (today >= DateTime.fromISO(milestones.cuttingStart.date, { zone }) && today < sStart) progressStatus = 'Cutting';
  else if (today >= sStart && today <= sEnd) progressStatus = 'Sewing';
  else if (today > sEnd && today <= DateTime.fromISO(milestones.lastOutputFromLine.date, { zone })) progressStatus = 'Line Finishing';
  else if (today > DateTime.fromISO(milestones.lastOutputFromLaundry.date, { zone })) progressStatus = 'Post-Laundry';
  else progressStatus = 'Completed';

  // Build clean result with ISO date strings
  const resultMilestones = {};
  MILESTONE_KEYS.forEach((k) => {
    resultMilestones[k] = {
      date: milestones[k].date,
      overridden: Boolean(milestones[k].overridden),
      original: milestones[k].original || null
    };
  });

  return {
    orderId: order._id || null,
    orderQty,
    line,
    lineCapacity: capacityPerDay,
    sewingDurationDays,
    milestones: resultMilestones,
    deviationDays,
    progressStatus
  };
}

module.exports = {
  computeSchedule,
  addBusinessDays,
  subtractBusinessDays,
  toISODate
};
