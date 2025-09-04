import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, Edit2, Save, X, Factory, Truck, Package, CheckCircle } from 'lucide-react';

const ProductionPlanningSystem2 = () => {
  // Mock holidays (including weekends)
  const holidays = [
    '2024-12-25', '2024-12-26', '2024-01-01', '2024-01-02', 
    '2024-04-25', '2024-05-01', '2024-07-23', '2024-10-06'
  ];

  // Production lines capacity
  const productionLines = [
    { id: 1, name: 'Line 1', capacity: 900 },
    { id: 2, name: 'Line 2', capacity: 900 },
    { id: 3, name: 'Line 3', capacity: 900 },
    { id: 4, name: 'Line 4', capacity: 900 },
    { id: 5, name: 'Line 5', capacity: 800 },
    { id: 6, name: 'Line 6', capacity: 700 },
    { id: 7, name: 'Line 7', capacity: 600 }
  ];

  // Sample cumulative planned input data (simulating Excel columns B and D)
  const cumulativePlannedInput = [
    { date: '2024-08-17', cumulative: 1500 },
    { date: '2024-08-18', cumulative: 3000 },
    { date: '2024-08-19', cumulative: 4500 },
    { date: '2024-08-20', cumulative: 6000 },
    { date: '2024-08-21', cumulative: 7500 },
    { date: '2024-08-22', cumulative: 9000 }
  ];

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNo: 'ORD-001',
      model: 'Classic Trouser',
      fabricSupplier: 'Supplier A',
      styleNo: 'ST-001',
      keyNo: 'KEY-001',
      fabricArt: 'FAB-001',
      orderQty: 1800,
      totalQty: 1800,
      originalETD: '2024-10-31',
      assignedLine: 1,
      milestones: {},
      overrides: {}
    },
    {
      id: 2,
      orderNo: 'ORD-002',
      model: 'Premium Trouser',
      fabricSupplier: 'Supplier B',
      styleNo: 'ST-002',
      keyNo: 'KEY-002',
      fabricArt: 'FAB-002',
      orderQty: 2500,
      totalQty: 4300,
      originalETD: '2024-11-15',
      assignedLine: 2,
      milestones: {},
      overrides: {}
    }
  ]);

  const [editingOrder, setEditingOrder] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);

  // Utility functions
  const isHoliday = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    return holidays.includes(dateStr) || dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };

  const addBusinessDays = (startDate, days) => {
    let currentDate = new Date(startDate);
    let addedDays = 0;
    
    while (addedDays < Math.abs(days)) {
      if (days > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      if (!isHoliday(currentDate)) {
        addedDays++;
      }
    }
    
    return currentDate;
  };

  // Excel INDEX/MATCH equivalent for End Date for Sewing Input
  const calculateSewingEndDate = (totalQty) => {
    // Find the first cumulative value >= totalQty
    const matchedRow = cumulativePlannedInput.find(row => row.cumulative >= totalQty);
    if (matchedRow) {
      const baseDate = new Date(matchedRow.date);
      return addBusinessDays(baseDate, 1); // +1 day as in Excel formula
    }
    return new Date(); // fallback
  };

  const getInspectionDate = (readyForInspectionDate) => {
    const date = new Date(readyForInspectionDate);
    const dayOfWeek = date.getDay();
    
    switch (dayOfWeek) {
      case 5: return addBusinessDays(date, 3); // Friday -> +3
      case 6: return addBusinessDays(date, 2); // Saturday -> +2
      case 0: return addBusinessDays(date, 1); // Sunday -> +1
      default: return addBusinessDays(date, 1); // Mon-Thu -> +1
    }
  };

  const getPossibleDeliveryDate = (inspectionDate) => {
    const date = new Date(inspectionDate);
    const dayOfWeek = date.getDay();
    
    switch (dayOfWeek) {
      case 1: return addBusinessDays(date, 9); // Monday -> +9
      case 2: return addBusinessDays(date, 8); // Tuesday -> +8
      case 3: return addBusinessDays(date, 7); // Wednesday -> +7
      case 4: return addBusinessDays(date, 6); // Thursday -> +6
      default: return addBusinessDays(date, 7); // fallback
    }
  };

  const calculateMilestones = (order) => {
    const calendarDate = new Date();
    
    // Start Date for Preparation = Calendar Date - 16 days
    const preparationStart = order.overrides.preparationStart || 
      addBusinessDays(calendarDate, -16);
    
    // Cutting Input Start Date
    const cuttingOffset = order.orderQty < 2000 ? -4 : -6;
    const cuttingStart = order.overrides.cuttingStart || 
      addBusinessDays(preparationStart, cuttingOffset);
    
    // Sewing Input Start Date = Cutting Start - (Order Qty / Line Capacity)
    const line = productionLines.find(l => l.id === order.assignedLine);
    const sewingDays = Math.ceil(order.orderQty / line.capacity);
    const sewingStart = order.overrides.sewingStart || 
      addBusinessDays(cuttingStart, -sewingDays);
    
    // End Date for Sewing Input (INDEX/MATCH equivalent)
    const sewingEnd = order.overrides.sewingEnd || 
      calculateSewingEndDate(order.totalQty);
    
    // Last Output from Line = Sewing End + 5 days
    const lineOutput = order.overrides.lineOutput || 
      addBusinessDays(sewingEnd, 5);
    
    // Last Output from Laundry = Line Output + 14 days
    const laundryOutput = order.overrides.laundryOutput || 
      addBusinessDays(lineOutput, 14);
    
    // Last Output from Packing = Laundry Output + 3 days
    const packingOutput = order.overrides.packingOutput || 
      addBusinessDays(laundryOutput, 3);
    
    // Ready for Inspection = Packing Output + 3 days
    const readyForInspection = order.overrides.readyForInspection || 
      addBusinessDays(packingOutput, 3);
    
    // Inspection Date (weekday logic)
    const inspectionDate = order.overrides.inspectionDate || 
      getInspectionDate(readyForInspection);
    
    // Possible Delivery Date
    const possibleDelivery = order.overrides.possibleDelivery || 
      getPossibleDeliveryDate(inspectionDate);
    
    // Deviation Days = Original ETD - Possible Delivery
    const originalETD = new Date(order.originalETD);
    const deviationDays = Math.ceil((originalETD - possibleDelivery) / (1000 * 60 * 60 * 24));
    
    return {
      preparationStart,
      cuttingStart,
      sewingStart,
      sewingEnd,
      lineOutput,
      laundryOutput,
      packingOutput,
      readyForInspection,
      inspectionDate,
      possibleDelivery,
      deviationDays
    };
  };

  useEffect(() => {
    const updatedOrders = orders.map(order => ({
      ...order,
      milestones: calculateMilestones(order)
    }));
    setOrders(updatedOrders);
  }, []);

  const handleDateOverride = (orderId, milestone, newDate) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            overrides: {
              ...order.overrides,
              [milestone]: new Date(newDate)
            }
          };
          return {
            ...updatedOrder,
            milestones: calculateMilestones(updatedOrder)
          };
        }
        return order;
      })
    );
    setEditingMilestone(null);
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }) : 'N/A';
  };

  const getStatusColor = (deviationDays) => {
    if (deviationDays > 7) return 'text-green-600';
    if (deviationDays > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const milestoneStages = [
    { key: 'preparationStart', label: 'Preparation Start', icon: Calendar },
    { key: 'cuttingStart', label: 'Cutting Start', icon: Edit2 },
    { key: 'sewingStart', label: 'Sewing Start', icon: Factory },
    { key: 'sewingEnd', label: 'Sewing End', icon: Factory },
    { key: 'lineOutput', label: 'Line Output', icon: Truck },
    { key: 'laundryOutput', label: 'Laundry Output', icon: Package },
    { key: 'packingOutput', label: 'Packing Output', icon: Package },
    { key: 'readyForInspection', label: 'Ready for Inspection', icon: CheckCircle },
    { key: 'inspectionDate', label: 'Inspection Date', icon: CheckCircle },
    { key: 'possibleDelivery', label: 'Possible Delivery', icon: Truck }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Production Planning System - EMESSA
          </h1>
          <p className="text-gray-600">
            Automated scheduling across 7 production lines with holiday-aware calculations
          </p>
        </div>

        {/* Production Lines Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Factory className="w-5 h-5 mr-2" />
            Production Lines Capacity
          </h2>
          <div className="grid grid-cols-7 gap-4">
            {productionLines.map(line => (
              <div key={line.id} className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-900">{line.name}</div>
                <div className="text-2xl font-bold text-blue-600">{line.capacity}</div>
                <div className="text-sm text-blue-700">units/day</div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Production Orders & Timeline
            </h2>
          </div>
          
          {orders.map(order => (
            <div key={order.id} className="border-b last:border-b-0">
              {/* Order Header */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-8 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order No</label>
                    <div className="font-semibold">{order.orderNo}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Model</label>
                    <div className="font-semibold">{order.model}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                    <div className="font-semibold text-blue-600">{order.orderQty.toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned Line</label>
                    <div className="font-semibold">Line {order.assignedLine}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Original ETD</label>
                    <div className="font-semibold">{formatDate(new Date(order.originalETD))}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Possible Delivery</label>
                    <div className="font-semibold">{formatDate(order.milestones?.possibleDelivery)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deviation Days</label>
                    <div className={`font-bold ${getStatusColor(order.milestones?.deviationDays)}`}>
                      {order.milestones?.deviationDays > 0 ? '+' : ''}{order.milestones?.deviationDays} days
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    {order.milestones?.deviationDays < 0 && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="p-6">
                <div className="grid grid-cols-5 gap-6">
                  {milestoneStages.map((stage, index) => {
                    const Icon = stage.icon;
                    const date = order.milestones?.[stage.key];
                    const isOverridden = order.overrides?.[stage.key];
                    const isEditing = editingMilestone === `${order.id}-${stage.key}`;

                    return (
                      <div key={stage.key} className="relative">
                        <div className={`p-4 rounded-lg border-2 transition-all ${
                          isOverridden ? 'border-orange-300 bg-orange-50' : 
                          stage.key === 'sewingEnd' ? 'border-purple-300 bg-purple-50' : 
                          'border-gray-200 bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <Icon className={`w-4 h-4 ${
                              isOverridden ? 'text-orange-600' : 
                              stage.key === 'sewingEnd' ? 'text-purple-600' : 
                              'text-gray-600'
                            }`} />
                            <button
                              onClick={() => setEditingMilestone(`${order.id}-${stage.key}`)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="text-xs font-medium text-gray-500 mb-1">
                            {stage.label}
                            {stage.key === 'sewingEnd' && <span className="text-purple-600 ml-1">(INDEX/MATCH)</span>}
                            {isOverridden && <span className="text-orange-600 ml-1">(Override)</span>}
                          </div>
                          
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="date"
                                defaultValue={date ? date.toISOString().split('T')[0] : ''}
                                className="w-full text-xs p-1 border rounded"
                                onBlur={(e) => {
                                  if (e.target.value) {
                                    handleDateOverride(order.id, stage.key, e.target.value);
                                  } else {
                                    setEditingMilestone(null);
                                  }
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleDateOverride(order.id, stage.key, e.target.value);
                                  } else if (e.key === 'Escape') {
                                    setEditingMilestone(null);
                                  }
                                }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-gray-900">
                              {formatDate(date)}
                            </div>
                          )}
                        </div>
                        
                        {/* Timeline connector */}
                        {index < milestoneStages.length - 1 && (
                          <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold mb-4">Legend & Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-50 border-2 border-purple-300 rounded mr-2"></div>
              <span>INDEX/MATCH Formula (Auto)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-50 border-2 border-orange-300 rounded mr-2"></div>
              <span>User Override</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded mr-2"></div>
              <span>On/Ahead Schedule</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded mr-2"></div>
              <span>Behind Schedule</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Holiday-Aware Scheduling:</strong> Weekends and holidays are automatically excluded from production calculations.</p>
            <p><strong>Click edit icons to override any milestone date.</strong> All subsequent dates will recalculate automatically.</p>
            <p><strong>Deviation Days:</strong> Original ETD - Possible Delivery Date (positive = ahead, negative = behind)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionPlanningSystem2;