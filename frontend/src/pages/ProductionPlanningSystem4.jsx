import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, Users, Package, Scissors, Shirt, Droplets, Box, AlertTriangle, 
  Save, Plus, Eye, Truck, CheckCircle, XCircle, Settings, CalendarDays, Wrench, 
  AlertCircle, CheckSquare, X, Edit3 
} from 'lucide-react';

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
  { id: 'X', name: 'Line X', capacity: 900, isActive: true, defaultWorkingDays: [1,2,3,4,5] },
  { id: '1', name: 'Line 1', capacity: 100, isActive: true, defaultWorkingDays: [1,2,3,4,5] },
  { id: '2', name: 'Line 2', capacity: 120, isActive: true, defaultWorkingDays: [1,2,3,4,5] },
  { id: '3', name: 'Line 3', capacity: 80, isActive: true, defaultWorkingDays: [1,2,3,4,5] },
  { id: '4', name: 'Line 4', capacity: 150, isActive: true, defaultWorkingDays: [1,2,3,4,5] },
  { id: '5', name: 'Line 5', capacity: 90, isActive: true, defaultWorkingDays: [1,2,3,4,5] },
  { id: '6', name: 'Line 6', capacity: 110, isActive: true, defaultWorkingDays: [1,2,3,4,5] },
  { id: '7', name: 'Line 7', capacity: 130, isActive: true, defaultWorkingDays: [1,2,3,4,5] },
];

// Mock calendar data for demonstration
const mockGlobalHolidays = [
  { id: '1', name: 'New Year', date: '2025-01-01', isRecurring: true },
  { id: '2', name: 'Labour Day', date: '2025-05-01', isRecurring: true },
  { id: '3', name: 'Christmas', date: '2025-12-25', isRecurring: true },
];

const ProductionPlanningSystem4 = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [endDateSewing, setEndDateSewing] = useState('');
  const [scheduleItems, setScheduleItems] = useState([]);
  const [newETD, setNewETD] = useState('');
  
  // Calendar management state
  const [showCalendarManager, setShowCalendarManager] = useState(false);
  const [selectedCalendarLine, setSelectedCalendarLine] = useState(null);
  const [calendarView, setCalendarView] = useState('month');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [lineCalendars, setLineCalendars] = useState({});
  const [globalHolidays, setGlobalHolidays] = useState(mockGlobalHolidays);
  const [lineOverrides, setLineOverrides] = useState({});
  const [fabricDelays, setFabricDelays] = useState({});

  // Calendar service integration
  const calendarService = {
    // Simulate API calls - replace with actual API integration
    async getLineCalendar(lineId, startDate, endDate) {
      // Mock implementation - replace with real API call
      const calendar = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const isWorkingDay = await this.isLineWorkingDay(lineId, new Date(d));
        const capacity = isWorkingDay ? productionLines.find(l => l.id === lineId)?.capacity || 0 : 0;
        
        calendar.push({
          date: new Date(d),
          isWorkingDay,
          capacity,
          reason: await this.getWorkingDayReason(lineId, new Date(d))
        });
      }
      
      return calendar;
    },

    async isLineWorkingDay(lineId, date) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Check line-specific override
      const lineOverride = lineOverrides[lineId]?.[dateStr];
      if (lineOverride !== undefined) {
        return lineOverride.isWorkingDay;
      }
      
      // Check global holidays
      const isHoliday = globalHolidays.some(h => 
        h.date === dateStr
      );
      if (isHoliday) return false;
      
      // Check fabric constraints
      const hasFabricDelay = Object.values(fabricDelays).some(delay => 
        delay.affectedLines.includes(lineId) && 
        new Date(delay.expectedDate) > date
      );
      if (hasFabricDelay) return false;
      
      // Check default working days (exclude weekends)
      const line = productionLines.find(l => l.id === lineId);
      const workingDays = line?.defaultWorkingDays || [1,2,3,4,5];
      
      return workingDays.includes(date.getDay());
    },

    async getWorkingDayReason(lineId, date) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Check override
      const override = lineOverrides[lineId]?.[dateStr];
      if (override) {
        return `${override.reason}: ${override.description || ''}`;
      }
      
      // Check holiday
      const holiday = globalHolidays.find(h => h.date === dateStr);
      if (holiday) {
        return `Holiday: ${holiday.name}`;
      }
      
      // Check fabric delay
      const fabricDelay = Object.values(fabricDelays).find(delay => 
        delay.affectedLines.includes(lineId) && 
        new Date(delay.expectedDate) > date
      );
      if (fabricDelay) {
        return `Fabric delay: ${fabricDelay.delayReason}`;
      }
      
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 'Weekend';
      }
      
      return 'Normal working day';
    },

    async addWorkingDays(lineId, startDate, daysToAdd) {
      let currentDate = new Date(startDate);
      let addedDays = 0;

      while (addedDays < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);
        
        if (await this.isLineWorkingDay(lineId, currentDate)) {
          addedDays++;
        }
      }

      return currentDate;
    },

    async subtractWorkingDays(lineId, endDate, daysToSubtract) {
      let currentDate = new Date(endDate);
      let subtractedDays = 0;

      while (subtractedDays < daysToSubtract) {
        currentDate.setDate(currentDate.getDate() - 1);
        
        if (await this.isLineWorkingDay(lineId, currentDate)) {
          subtractedDays++;
        }
      }

      return currentDate;
    }
  };

  // Load calendar data for selected line
  useEffect(() => {
    if (selectedCalendarLine) {
      loadLineCalendar(selectedCalendarLine);
    }
  }, [selectedCalendarLine, currentCalendarDate]);

  const loadLineCalendar = async (lineId) => {
    const startDate = new Date(currentCalendarDate);
    startDate.setDate(1); // Start of month
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // End of month
    
    const calendar = await calendarService.getLineCalendar(lineId, startDate, endDate);
    setLineCalendars(prev => ({
      ...prev,
      [lineId]: calendar
    }));
  };

  // Helper functions for date calculations with calendar service
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
      default: return addDays(date, 7);
    }
  };

  const calculateMilestones = async (order, line, endDateSewing) => {
    const lineId = line.id;
    const orderQty = order.orderQty;
    
    // End date for sewing (user input)
    const sewingEndDate = new Date(endDateSewing);
    
    // Calculate sewing duration using line capacity
    const sewingDuration = Math.ceil(orderQty / line.capacity);
    const sewingStartDate = await calendarService.subtractWorkingDays(lineId, sewingEndDate, sewingDuration - 1);
    
    // Calculate cutting dates using calendar service
    const cuttingLeadTime = orderQty < 2000 ? 4 : 6;
    const cuttingStartDate = await calendarService.subtractWorkingDays(lineId, sewingStartDate, cuttingLeadTime);
    
    // Preparation starts 16 working days before cutting
    const preparationStartDate = await calendarService.subtractWorkingDays(lineId, cuttingStartDate, 16);
    
    // Post-production milestones (using regular days for now, could be enhanced with calendar service)
    const lastOutputLine = addDays(sewingEndDate, 5);
    const lastOutputLaundry = addDays(lastOutputLine, 14);
    const lastOutputPacking = addDays(lastOutputLaundry, 3);
    const readyForInspection = addDays(lastOutputPacking, 3);
    
    const inspectionDate = calculateInspectionDate(readyForInspection);
    const possibleDD = calculatePossibleDD(inspectionDate);
    
    const originalETD = new Date(order.originalETD);
    const newETDDate = newETD ? new Date(newETD) : originalETD;
    
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

  const handleAddSchedule = async () => {
    if (!selectedOrder || !selectedLine || !endDateSewing) {
      alert('Please select order, production line, and sewing end date');
      return;
    }

    const line = productionLines.find(l => l.id === selectedLine);
    let adjustedEndDate = endDateSewing;
    
    // Check for conflicts with existing orders on the same line
    const existingLineOrders = scheduleItems.filter(item => item.line.id === selectedLine);
    
    if (existingLineOrders.length > 0) {
      const sortedOrders = existingLineOrders.sort((a, b) => 
        new Date(a.milestones.sewingEnd) - new Date(b.milestones.sewingEnd)
      );
      
      const newSewingEnd = new Date(endDateSewing);
      const sewingDuration = Math.ceil(selectedOrder.orderQty / line.capacity);
      const newSewingStart = await calendarService.subtractWorkingDays(selectedLine, newSewingEnd, sewingDuration - 1);
      
      for (const existingOrder of sortedOrders) {
        const existingStart = new Date(existingOrder.milestones.sewingStart);
        const existingEnd = new Date(existingOrder.milestones.sewingEnd);
        
        if ((newSewingStart <= existingEnd && newSewingEnd >= existingStart)) {
          const adjustedStart = await calendarService.addWorkingDays(selectedLine, existingEnd, 1);
          const adjustedEnd = await calendarService.addWorkingDays(selectedLine, adjustedStart, sewingDuration - 1);
          adjustedEndDate = adjustedEnd.toISOString().split('T')[0];
          break;
        }
      }
      
      if (adjustedEndDate !== endDateSewing) {
        alert(`Date conflict detected! Sewing end date adjusted to ${new Date(adjustedEndDate).toLocaleDateString()} to avoid overlap with existing orders on ${line.name}.`);
      }
    }
    
    const milestones = await calculateMilestones(selectedOrder, line, adjustedEndDate);
    
    const newItem = {
      id: Date.now(),
      order: selectedOrder,
      line: line,
      milestones,
      week: 38,
      calendarDate: new Date().toISOString().split('T')[0],
      totalAccumulativeQty: selectedOrder.orderQty
    };

    setScheduleItems(prevItems => {
      const updatedItems = [...prevItems, newItem];
      return resequenceLineOrders(updatedItems, selectedLine);
    });
    
    setSelectedOrder(null);
    setSelectedLine(null);
    setEndDateSewing('');
    setNewETD('');
  };

  const handleMilestoneUpdate = async (itemId, milestoneKey, newDate) => {
    if (milestoneKey === 'sewingEnd') {
      setScheduleItems(prevItems => {
        const updatedItems = [...prevItems];
        const currentItemIndex = updatedItems.findIndex(item => item.id === itemId);
        const currentItem = updatedItems[currentItemIndex];
        
        if (!currentItem) return prevItems;
        
        const currentLine = currentItem.line.id;
        const oldSewingEnd = currentItem.milestones.sewingEnd;
        const newSewingEnd = new Date(newDate);
        
        const shiftDays = Math.ceil((newSewingEnd - oldSewingEnd) / (1000 * 60 * 60 * 24));
        
        // Update current item
        calculateMilestones(currentItem.order, currentItem.line, newDate).then(newMilestones => {
          updatedItems[currentItemIndex] = {
            ...currentItem,
            milestones: newMilestones
          };
        });
        
        // Find and update subsequent orders on same line
        const sameLineItems = updatedItems
          .filter(item => item.line.id === currentLine)
          .sort((a, b) => new Date(a.milestones.sewingEnd) - new Date(b.milestones.sewingEnd));
        
        sameLineItems.forEach(async (lineItem, index) => {
          if (lineItem.id !== itemId && new Date(lineItem.milestones.sewingEnd) >= oldSewingEnd) {
            const itemIndex = updatedItems.findIndex(item => item.id === lineItem.id);
            const currentSewingEnd = new Date(lineItem.milestones.sewingEnd);
            const newShiftedSewingEnd = addDays(currentSewingEnd, shiftDays);
            
            const updatedMilestones = await calculateMilestones(
              lineItem.order, 
              lineItem.line, 
              newShiftedSewingEnd.toISOString().split('T')[0]
            );
            
            updatedItems[itemIndex] = {
              ...lineItem,
              milestones: updatedMilestones
            };
          }
        });
        
        return resequenceLineOrders(updatedItems, currentLine);
      });
    }
  };

  const resequenceLineOrders = (items, lineId) => {
    const lineItems = items.filter(item => item.line.id === lineId);
    const otherItems = items.filter(item => item.line.id !== lineId);
    
    lineItems.sort((a, b) => new Date(a.milestones.sewingEnd) - new Date(b.milestones.sewingEnd));
    
    return [...otherItems, ...lineItems];
  };

  // Calendar override functions
  const handleCalendarOverride = (lineId, date, isWorkingDay, reason, description) => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    
    setLineOverrides(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        [dateStr]: {
          isWorkingDay,
          reason,
          description,
          createdAt: new Date()
        }
      }
    }));
    
    // Reload calendar for the affected line
    loadLineCalendar(lineId);
  };

  const handleFabricDelay = (fabricId, orderId, expectedDate, delayDays, delayReason, affectedLines) => {
    setFabricDelays(prev => ({
      ...prev,
      [fabricId]: {
        orderId,
        expectedDate,
        actualDate: null,
        status: 'delayed',
        delayDays,
        delayReason,
        affectedLines
      }
    }));
    
    // Reload calendars for affected lines
    affectedLines.forEach(lineId => loadLineCalendar(lineId));
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

  // Calendar component
  const CalendarManager = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [overrideReason, setOverrideReason] = useState('');
    const [overrideDescription, setOverrideDescription] = useState('');
    const [showOverrideForm, setShowOverrideForm] = useState(false);
    
    const calendar = lineCalendars[selectedCalendarLine] || [];
    
    const renderCalendarGrid = () => {
      const startOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
      const endOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - startOfMonth.getDay()); // Start from Sunday
      
      const days = [];
      const currentDate = new Date(startDate);
      
      for (let i = 0; i < 42; i++) { // 6 weeks
        const dayData = calendar.find(day => 
          day.date.toDateString() === currentDate.toDateString()
        );
        
        const isCurrentMonth = currentDate.getMonth() === currentCalendarDate.getMonth();
        const isToday = currentDate.toDateString() === new Date().toDateString();
        const isWorkingDay = dayData?.isWorkingDay ?? false;
        
        days.push(
          <div
            key={currentDate.toISOString()}
            className={`
              p-2 text-sm cursor-pointer border border-gray-100 min-h-[60px]
              ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
              ${isToday ? 'ring-2 ring-blue-500' : ''}
              ${isWorkingDay ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}
              ${selectedDate?.toDateString() === currentDate.toDateString() ? 'bg-blue-100' : ''}
            `}
            onClick={() => {
              setSelectedDate(new Date(currentDate));
              setShowOverrideForm(true);
            }}
          >
            <div className="font-semibold">{currentDate.getDate()}</div>
            {dayData && (
              <div className="text-xs mt-1">
                <div className={`px-1 rounded ${isWorkingDay ? 'bg-green-200' : 'bg-red-200'}`}>
                  {isWorkingDay ? '✓' : '✗'} {dayData.capacity || 0}
                </div>
                <div className="text-gray-600 truncate" title={dayData.reason}>
                  {dayData.reason}
                </div>
              </div>
            )}
          </div>
        );
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return days;
    };
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            Calendar Manager - {selectedCalendarLine ? `Line ${selectedCalendarLine}` : 'Select Line'}
          </h3>
          <div className="flex gap-2">
            <select
              value={selectedCalendarLine || ''}
              onChange={(e) => setSelectedCalendarLine(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select Line</option>
              {productionLines.map(line => (
                <option key={line.id} value={line.id}>{line.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowCalendarManager(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {selectedCalendarLine && (
          <>
            {/* Calendar Navigation */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))}
                className="p-2 border rounded hover:bg-gray-50"
              >
                ‹ Previous
              </button>
              <h4 className="text-lg font-semibold">
                {currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              <button
                onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))}
                className="p-2 border rounded hover:bg-gray-50"
              >
                Next ›
              </button>
            </div>
            
            {/* Calendar Grid */}
            <div className="mb-6">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarGrid()}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span>Working Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 rounded"></div>
                <span>Non-Working Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 rounded border-2 border-blue-500"></div>
                <span>Today</span>
              </div>
            </div>
          </>
        )}
        
        {/* Override Form */}
        {showOverrideForm && selectedDate && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-3">
              Override Calendar - {selectedDate.toLocaleDateString()}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Working Status</label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select reason...</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="holiday_override">Holiday Override</option>
                  <option value="fabric_delay">Fabric Delay</option>
                  <option value="training">Training</option>
                  <option value="power_outage">Power Outage</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={overrideDescription}
                  onChange={(e) => setOverrideDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    handleCalendarOverride(
                      selectedCalendarLine,
                      selectedDate,
                      false, // Set as non-working
                      overrideReason,
                      overrideDescription
                    );
                    setShowOverrideForm(false);
                    setOverrideReason('');
                    setOverrideDescription('');
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={!overrideReason}
                >
                  Mark Off
                </button>
                <button
                  onClick={() => {
                    handleCalendarOverride(
                      selectedCalendarLine,
                      selectedDate,
                      true, // Set as working
                      overrideReason,
                      overrideDescription
                    );
                    setShowOverrideForm(false);
                    setOverrideReason('');
                    setOverrideDescription('');
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  disabled={!overrideReason}
                >
                  Mark On
                </button>
                <button
                  onClick={() => setShowOverrideForm(false)}
                  className="px-3 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Production Planning System</h1>
            <p className="text-gray-600">Advanced scheduling with per-line working calendars</p>
          </div>
          <button
            onClick={() => setShowCalendarManager(!showCalendarManager)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <CalendarDays className="h-5 w-5" />
            Calendar Manager
          </button>
        </div>

        {/* Calendar Manager */}
        {showCalendarManager && <CalendarManager />}

        {/* Add Schedule Form */}
        {!showCalendarManager && (
          <>
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
                  
                  {/* Fabric Availability Status */}
                  <div className="mt-3 p-2 bg-blue-50 rounded">
                    <div className="flex items-center text-sm text-blue-800">
                      <Package className="h-4 w-4 mr-1" />
                      <strong>Fabric Ready in WH:</strong> {formatDate(selectedOrder.fabricReadyWH)}
                      {selectedLine && (
                        <span className="ml-2 text-green-600">
                          ✓ Available for {productionLines.find(l => l.id === selectedLine)?.name}
                        </span>
                      )}
                    </div>
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
                  if (a.line.id !== b.line.id) {
                    return a.line.id.toString().localeCompare(b.line.id.toString());
                  }
                  return new Date(a.milestones.sewingEnd) - new Date(b.milestones.sewingEnd);
                })
                .map((item, index) => {
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
                                <p className="text-sm font-medium">{formatDate(item.milestones.preparationStart)}</p>
                                <p className="text-xs text-gray-500">📅 Based on line calendar</p>
                              </div>
                              
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date for Cutting</label>
                                <p className="text-sm font-medium">{formatDate(item.milestones.cuttingStart)}</p>
                                <p className="text-xs text-gray-500">📅 Based on line calendar</p>
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
                                <p className="text-sm font-medium">{formatDate(item.milestones.sewingStart)}</p>
                                <p className="text-xs text-gray-500">📅 Based on line calendar</p>
                              </div>
                              
                              <div className="bg-green-100 p-3 rounded-lg">
                                <label className="block text-xs font-medium text-gray-600 mb-1">End Date for Sewing</label>
                                <input
                                  type="date"
                                  value={item.milestones.sewingEnd.toISOString().split('T')[0]}
                                  onChange={(e) => {
                                    const confirmMessage = `Changing this date will automatically shift all subsequent orders on ${item.line.name} using the line's working calendar. Continue?`;
                                    if (window.confirm(confirmMessage)) {
                                      handleMilestoneUpdate(item.id, 'sewingEnd', e.target.value);
                                    }
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded text-sm font-medium bg-yellow-50 border-yellow-300"
                                />
                                <p className="text-xs text-gray-500 mt-1">⚠️ Uses line working calendar</p>
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
                              <Package className="h-5 w-05 mr-2 text-purple-600" />
                              Post-Production
                            </h4>
                            <div className="space-y-3">
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Last Output from Laundry</label>
                                <p className="text-sm font-medium">{formatDate(item.milestones.lastOutputLaundry)}</p>
                              </div>
                              <div className="bg-purple-100 p-3 rounded-lg">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Last Output from Packing</label>
                                <p className="text-sm font-medium">{formatDate(item.milestones.lastOutputPacking)}</p>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Ready for Inspection</label>
                                <p className="text-sm font-medium">{formatDate(item.milestones.readyForInspection)}</p>
                              </div>
                              <div className="bg-purple-100 p-3 rounded-lg">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Inspection Date</label>
                                <p className="text-sm font-medium">{formatDate(item.milestones.inspectionDate)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default ProductionPlanningSystem4;