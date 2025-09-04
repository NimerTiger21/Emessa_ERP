import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Users, Package, Scissors, Shirt, Droplets, Box, AlertTriangle, Save, Plus, Eye, Truck, CheckCircle, XCircle } from 'lucide-react';

// Mock data - in real implementation, fetch from API
const mockOrders = [
  { 
    id: '1', 
    orderNo: '668102', 
    season: 'Spring', 
    orderQty: 385, 
    brand: 'Nike', 
    style: 'STYLE.SHAKIRA',
    styleNo: '99_814_20',
    keyNo: '103750',
    customer: 'Retailer A',
    fabricSupplier: 'SHARABATI',
    fabric: 'Ultra jet 85 Ocean',
    fabricArt: '17-6908/02',
    fabricReadyWH: '2025-07-16',
    originalETD: '2025-11-15'
  },
  { 
    id: '2', 
    orderNo: 'ORD-2025-002', 
    season: 'Spring', 
    orderQty: 750, 
    brand: 'Adidas', 
    style: 'Regular Fit',
    styleNo: '99_815_21',
    keyNo: '103751',
    customer: 'Retailer B',
    fabricSupplier: 'SUPPLIER B',
    fabric: 'Cotton Blend',
    fabricArt: '18-7009/03',
    fabricReadyWH: '2025-08-01',
    originalETD: '2025-12-01'
  }
];

const productionLines = [
  { id: 'X', name: 'Line X', capacity: 900 },
  { id: '1', name: 'Line 1', capacity: 100 },
  { id: '2', name: 'Line 2', capacity: 120 },
  { id: '3', name: 'Line 3', capacity: 80 },
  { id: '4', name: 'Line 4', capacity: 150 },
  { id: '5', name: 'Line 5', capacity: 90 },
  { id: '6', name: 'Line 6', capacity: 110 },
  { id: '7', name: 'Line 7', capacity: 130 },
];

// Production calendar mock data
const generateProductionCalendar = () => {
  const calendar = [];
  const startDate = new Date('2025-01-01');
  let plannedInputAccumulated = 0;
  
  for (let week = 1; week <= 52; week++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + (week - 1) * 7);
    
    const plannedInput = 900; // Daily capacity
    plannedInputAccumulated += plannedInput;
    
    calendar.push({
      week,
      date: date.toISOString().split('T')[0],
      plannedInput,
      plannedInputAccumulated
    });
  }
  
  return calendar;
};

const ProductionPlanningSystem3 = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [endDateSewing, setEndDateSewing] = useState('');
  const [scheduleItems, setScheduleItems] = useState([]);
  const [productionCalendar] = useState(generateProductionCalendar());
  const [newETD, setNewETD] = useState('');

  // Helper functions for date calculations
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  const getWeekday = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const calculateInspectionDate = (readyForInspectionDate) => {
    const date = new Date(readyForInspectionDate);
    const weekday = getWeekday(date);
    
    switch (weekday) {
      case 'Fri': return addDays(date, 3);
      case 'Sat': return addDays(date, 2);
      case 'Sun': return addDays(date, 1);
      case 'Mon': return addDays(date, 1);
      case 'Tue': return addDays(date, 1);
      case 'Wed': return addDays(date, 1);
      case 'Thu': return addDays(date, 4);
      default: return addDays(date, 1);
    }
  };

  const calculatePossibleDD = (inspectionDate) => {
    const date = new Date(inspectionDate);
    const weekday = getWeekday(date);
    
    switch (weekday) {
      case 'Mon': return addDays(date, 9);
      case 'Tue': return addDays(date, 8);
      case 'Wed': return addDays(date, 7);
      case 'Thu': return addDays(date, 6);
      default: return addDays(date, 7); // Default fallback
    }
  };

  const calculateMilestones = (order, line, endDateSewing) => {
    const lineCapacity = line.capacity;
    const orderQty = order.orderQty;
    
    // End date for sewing (user input)
    const sewingEndDate = new Date(endDateSewing);
    
    // Start Date for Sewing = End Date for sewing - (Order Qty / line capacity)
    const sewingDuration = Math.ceil(orderQty / lineCapacity);
    const sewingStartDate = subtractDays(sewingEndDate, sewingDuration - 1);
    
    // Start Date for Cutting = If Order Qty < 2000 then Sewing Start - 4, else Sewing Start - 6
    const cuttingLeadTime = orderQty < 2000 ? 4 : 6;
    const cuttingStartDate = subtractDays(sewingStartDate, cuttingLeadTime);
    
    // Start Date for Preparation = Cutting Start - 16
    const preparationStartDate = subtractDays(cuttingStartDate, 16);
    
    // Last Output from the line = End Date for sewing + 5
    const lastOutputLine = addDays(sewingEndDate, 5);
    
    // Last Output from Laundry = Last Output from line + 14
    const lastOutputLaundry = addDays(lastOutputLine, 14);
    
    // Last Output from Packing = Last Output from Laundry + 3
    const lastOutputPacking = addDays(lastOutputLaundry, 3);
    
    // Ready For Inspection = Last Output from Packing + 3
    const readyForInspection = addDays(lastOutputPacking, 3);
    
    // Inspection Date (complex logic based on weekday)
    const inspectionDate = calculateInspectionDate(readyForInspection);
    
    // Possible DD / EMESSA (based on inspection date weekday)
    const possibleDD = calculatePossibleDD(inspectionDate);
    
    // Original ETD (from order)
    const originalETD = new Date(order.originalETD);
    
    // New ETD (user can modify)
    const newETDDate = newETD ? new Date(newETD) : originalETD;
    
    // Deviation days = Original ETD - Possible DD
    const deviationDays = Math.ceil((originalETD - possibleDD) / (1000 * 60 * 60 * 24));
    
    return {
      preparationStart: preparationStartDate,
      cuttingStart: cuttingStartDate,
      sewingStart: sewingStartDate,
      sewingEnd: sewingEndDate,
      lastOutputLine,
      lastOutputLaundry,
      lastOutputPacking,
      readyForInspection,
      inspectionDate,
      possibleDD,
      originalETD,
      newETD: newETDDate,
      deviationDays,
      sewingDuration
    };
  };

  const handleAddSchedule = () => {
    if (!selectedOrder || !selectedLine || !endDateSewing) {
      alert('Please select order, production line, and sewing end date');
      return;
    }

    const line = productionLines.find(l => l.id === selectedLine);
    let adjustedEndDate = endDateSewing;
    
    // Check for conflicts with existing orders on the same line
    const existingLineOrders = scheduleItems.filter(item => item.line.id === selectedLine);
    
    if (existingLineOrders.length > 0) {
      // Sort existing orders by sewing end date
      const sortedOrders = existingLineOrders.sort((a, b) => 
        new Date(a.milestones.sewingEnd) - new Date(b.milestones.sewingEnd)
      );
      
      const newSewingEnd = new Date(endDateSewing);
      const sewingDuration = Math.ceil(selectedOrder.orderQty / line.capacity);
      const newSewingStart = subtractDays(newSewingEnd, sewingDuration - 1);
      
      // Check if the new order conflicts with existing orders
      for (const existingOrder of sortedOrders) {
        const existingStart = new Date(existingOrder.milestones.sewingStart);
        const existingEnd = new Date(existingOrder.milestones.sewingEnd);
        
        // If there's an overlap, adjust the new order to start after the existing one
        if ((newSewingStart <= existingEnd && newSewingEnd >= existingStart)) {
          const adjustedStart = addDays(existingEnd, 1);
          const adjustedEnd = addDays(adjustedStart, sewingDuration - 1);
          adjustedEndDate = adjustedEnd.toISOString().split('T')[0];
          break;
        }
      }
      
      // If we had to adjust, show a warning
      if (adjustedEndDate !== endDateSewing) {
        alert(`Date conflict detected! Sewing end date adjusted to ${new Date(adjustedEndDate).toLocaleDateString()} to avoid overlap with existing orders on ${line.name}.`);
      }
    }
    
    const milestones = calculateMilestones(selectedOrder, line, adjustedEndDate);
    
    const newItem = {
      id: Date.now(),
      order: selectedOrder,
      line: line,
      milestones,
      week: 38, // This should be calculated based on calendar
      calendarDate: new Date().toISOString().split('T')[0],
      totalAccumulativeQty: selectedOrder.orderQty // This should be calculated
    };

    setScheduleItems(prevItems => {
      const updatedItems = [...prevItems, newItem];
      
      // Re-sequence all orders on this line to ensure proper ordering
      return resequenceLineOrders(updatedItems, selectedLine);
    });
    
    // Reset form
    setSelectedOrder(null);
    setSelectedLine(null);
    setEndDateSewing('');
    setNewETD('');
  };

  const handleMilestoneUpdate = (itemId, milestoneKey, newDate) => {
    if (milestoneKey === 'sewingEnd') {
      setScheduleItems(prevItems => {
        const updatedItems = [...prevItems];
        const currentItemIndex = updatedItems.findIndex(item => item.id === itemId);
        const currentItem = updatedItems[currentItemIndex];
        
        if (!currentItem) return prevItems;
        
        const currentLine = currentItem.line.id;
        const oldSewingEnd = currentItem.milestones.sewingEnd;
        const newSewingEnd = new Date(newDate);
        
        // Calculate the shift in days
        const shiftDays = Math.ceil((newSewingEnd - oldSewingEnd) / (1000 * 60 * 60 * 24));
        
        // Update the current item
        updatedItems[currentItemIndex] = {
          ...currentItem,
          milestones: calculateMilestones(currentItem.order, currentItem.line, newDate)
        };
        
        // Find all items on the same production line
        const sameLineItems = updatedItems
          .filter(item => item.line.id === currentLine)
          .sort((a, b) => new Date(a.milestones.sewingEnd) - new Date(b.milestones.sewingEnd));
        
        // Update subsequent orders on the same line
        for (let i = 0; i < sameLineItems.length; i++) {
          const lineItem = sameLineItems[i];
          const itemIndex = updatedItems.findIndex(item => item.id === lineItem.id);
          
          // If this item comes after the updated item, shift its dates
          if (lineItem.id !== itemId && new Date(lineItem.milestones.sewingEnd) >= oldSewingEnd) {
            const currentSewingEnd = new Date(lineItem.milestones.sewingEnd);
            const newShiftedSewingEnd = addDays(currentSewingEnd, shiftDays);
            
            updatedItems[itemIndex] = {
              ...lineItem,
              milestones: calculateMilestones(lineItem.order, lineItem.line, newShiftedSewingEnd.toISOString().split('T')[0])
            };
          }
        }
        
        // Re-sequence orders on the same line to prevent overlaps
        const resequencedItems = resequenceLineOrders(updatedItems, currentLine);
        
        return resequencedItems;
      });
    } else {
      // Handle other milestone updates without line shifting
      setScheduleItems(prevItems => 
        prevItems.map(item => {
          if (item.id === itemId) {
            const updatedMilestones = { ...item.milestones };
            updatedMilestones[milestoneKey] = new Date(newDate);
            
            return {
              ...item,
              milestones: updatedMilestones
            };
          }
          return item;
        })
      );
    }
  };

  const resequenceLineOrders = (items, lineId) => {
    const lineItems = items.filter(item => item.line.id === lineId);
    const otherItems = items.filter(item => item.line.id !== lineId);
    
    // Sort line items by sewing end date
    lineItems.sort((a, b) => new Date(a.milestones.sewingEnd) - new Date(b.milestones.sewingEnd));
    
    // Check for overlaps and adjust
    for (let i = 1; i < lineItems.length; i++) {
      const currentItem = lineItems[i];
      const previousItem = lineItems[i - 1];
      
      const currentSewingStart = new Date(currentItem.milestones.sewingStart);
      const previousSewingEnd = new Date(previousItem.milestones.sewingEnd);
      
      // If there's an overlap or insufficient gap, adjust the current item
      if (currentSewingStart <= previousSewingEnd) {
        const newSewingStart = addDays(previousSewingEnd, 1);
        const sewingDuration = Math.ceil(currentItem.order.orderQty / currentItem.line.capacity);
        const newSewingEnd = addDays(newSewingStart, sewingDuration - 1);
        
        const itemIndex = items.findIndex(item => item.id === currentItem.id);
        if (itemIndex !== -1) {
          items[itemIndex] = {
            ...currentItem,
            milestones: calculateMilestones(currentItem.order, currentItem.line, newSewingEnd.toISOString().split('T')[0])
          };
        }
      }
    }
    
    return [...otherItems, ...lineItems];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDeviationColor = (days) => {
    if (days >= 0) return 'text-green-600 bg-green-50';
    if (days >= -7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Production Planning System</h1>
          <p className="text-gray-600">Complete milestone tracking with automatic date calculations</p>
        </div>

        {/* Add Schedule Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <Plus className="mr-2" />
            New Production Schedule
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Order Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Order</label>
              <select
                value={selectedOrder?.id || ''}
                onChange={(e) => setSelectedOrder(mockOrders.find(o => o.id === e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an order...</option>
                {mockOrders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.orderNo} - {order.orderQty} units
                  </option>
                ))}
              </select>
            </div>

            {/* Production Line Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Production Line</label>
              <select
                value={selectedLine || ''}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select line...</option>
                {productionLines.map(line => (
                  <option key={line.id} value={line.id}>
                    {line.name} (Capacity: {line.capacity}/day)
                  </option>
                ))}
              </select>
            </div>

            {/* Sewing End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date for Sewing</label>
              <input
                type="date"
                value={endDateSewing}
                onChange={(e) => setEndDateSewing(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* New ETD (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New ETD (Optional)</label>
              <input
                type="date"
                value={newETD}
                onChange={(e) => setNewETD(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Order Details Preview */}
          {selectedOrder && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Order Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div><strong>Model:</strong> {selectedOrder.style}</div>
                <div><strong>Style No:</strong> {selectedOrder.styleNo}</div>
                <div><strong>Key No:</strong> {selectedOrder.keyNo}</div>
                <div><strong>Fabric Supplier:</strong> {selectedOrder.fabricSupplier}</div>
                <div><strong>Fabric:</strong> {selectedOrder.fabric}</div>
                <div><strong>Original ETD:</strong> {formatDate(selectedOrder.originalETD)}</div>
              </div>
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={handleAddSchedule}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Production Schedule
          </button>
        </div>

        {/* Schedule Items */}
<div className="space-y-8">
  {scheduleItems
    .sort((a, b) => {
      // Sort by line first, then by sewing end date
      if (a.line.id !== b.line.id) {
        return a.line.id.toString().localeCompare(b.line.id.toString());
      }
      return new Date(a.milestones.sewingEnd) - new Date(b.milestones.sewingEnd);
    })
    .map((item, index) => {
      // Calculate sequence number within the same line
      const sameLineItems = scheduleItems
        .filter(schedItem => schedItem.line.id === item.line.id)
        .sort((a, b) => new Date(a.milestones.sewingEnd) - new Date(b.milestones.sewingEnd));
      const sequenceNumber = sameLineItems.findIndex(schedItem => schedItem.id === item.id) + 1;
      
      return (
        <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with Key Information */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-semibold mr-3">{item.order.orderNo}</h3>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                    #{sequenceNumber} in queue
                  </span>
                </div>
                <p className="text-indigo-100">{item.order.style} • {item.line.name}</p>
                <p className="text-indigo-100">Qty: {item.order.orderQty} • Duration: {item.milestones.sewingDuration} days</p>
              </div>
              <div>
                <p className="text-sm text-indigo-200">Fabric Supplier</p>
                <p className="font-semibold">{item.order.fabricSupplier}</p>
                <p className="text-sm text-indigo-200">Fabric Ready: {formatDate(item.order.fabricReadyWH)}</p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDeviationColor(item.milestones.deviationDays)}`}>
                  Deviation: {item.milestones.deviationDays > 0 ? '+' : ''}{item.milestones.deviationDays} days
                </div>
                <p className="text-sm text-indigo-200 mt-1">
                  Original ETD: {formatDate(item.milestones.originalETD)}
                </p>
                
                {/* Line Conflict Warning */}
                {(() => {
                  const conflictingOrders = scheduleItems.filter(conflictItem => 
                    conflictItem.line.id === item.line.id && 
                    conflictItem.id !== item.id &&
                    new Date(conflictItem.milestones.sewingStart) <= new Date(item.milestones.sewingEnd) &&
                    new Date(conflictItem.milestones.sewingEnd) >= new Date(item.milestones.sewingStart)
                  );
                  
                  return conflictingOrders.length > 0 && (
                    <div className="mt-2 flex items-center text-yellow-200">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Schedule conflict detected</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Production Milestones */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              
              {/* Preparation & Cutting */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center border-b pb-2">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Pre-Production
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date for Preparation</label>
                    <input
                      type="date"
                      value={item.milestones.preparationStart ? new Date(item.milestones.preparationStart).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleMilestoneUpdate(item.id, 'preparationStart', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date for Cutting</label>
                    <input
                      type="date"
                      value={item.milestones.cuttingStart ? new Date(item.milestones.cuttingStart).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleMilestoneUpdate(item.id, 'cuttingStart', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sewing */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center border-b pb-2">
                  <Shirt className="h-5 w-5 mr-2 text-green-600" />
                  Sewing Phase
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date for Sewing</label>
                    <input
                      type="date"
                      value={item.milestones.sewingStart ? new Date(item.milestones.sewingStart).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleMilestoneUpdate(item.id, 'sewingStart', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  
                  <div className="bg-green-100 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">End Date for Sewing</label>
                    <input
                      type="date"
                      value={item.milestones.sewingEnd ? new Date(item.milestones.sewingEnd).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleMilestoneUpdate(item.id, 'sewingEnd', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm font-medium"
                    />
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Last Output from Line</label>
                    <p className="text-sm font-medium">{formatDate(item.milestones.lastOutputLine)}</p>
                  </div>
                </div>
              </div>

              {/* Post-Production */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center border-b pb-2">
                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                  Post-Production
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Last Output from Laundry</label>
                    <p className="text-sm font-medium">{formatDate(item.milestones.lastOutputLaundry)}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Last Output from Packing</label>
                    <p className="text-sm font-medium">{formatDate(item.milestones.lastOutputPacking)}</p>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ready For Inspection</label>
                    <p className="text-sm font-medium">{formatDate(item.milestones.readyForInspection)}</p>
                  </div>
                </div>
              </div>

              {/* Quality & Delivery */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center border-b pb-2">
                  <Eye className="h-5 w-5 mr-2 text-orange-600" />
                  Quality & Inspection
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Inspection Date</label>
                    <p className="text-sm font-medium">{formatDate(item.milestones.inspectionDate)}</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Possible DD / EMESSA</label>
                    <p className="text-sm font-medium">{formatDate(item.milestones.possibleDD)}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Dates */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center border-b pb-2">
                  <Truck className="h-5 w-5 mr-2 text-red-600" />
                  Delivery Schedule
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Original ETD</label>
                    <p className="text-sm font-medium">{formatDate(item.milestones.originalETD)}</p>
                  </div>
                  
                  <div className="bg-red-100 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">New ETD / EX EGY</label>
                    <p className="text-sm font-medium">{formatDate(item.milestones.newETD)}</p>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center border-b pb-2">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Status Summary
                </h4>
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${getDeviationColor(item.milestones.deviationDays)}`}>
                    <label className="block text-xs font-medium mb-1">Deviation from DD</label>
                    <p className="text-lg font-bold">
                      {item.milestones.deviationDays > 0 ? '+' : ''}{item.milestones.deviationDays} days
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Production Duration</label>
                    <p className="text-sm font-medium">
                      {Math.ceil((new Date(item.milestones.lastOutputPacking) - new Date(item.milestones.preparationStart)) / (1000 * 60 * 60 * 24))} days total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> // This closing tag was missing
      );
    })}
</div>

        {scheduleItems.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Production Schedules</h3>
            <p className="text-gray-500">Create your first production schedule to track all milestones</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionPlanningSystem3;