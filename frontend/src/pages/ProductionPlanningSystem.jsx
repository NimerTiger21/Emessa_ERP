import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, Clock, Package, Truck, Eye, BarChart3, Settings } from 'lucide-react';

const ProductionPlanningSystem = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLine, setSelectedLine] = useState('all');
  const [orders, setOrders] = useState([]);

  // Mock data for demonstration
  const mockOrders = [
    {
      id: 1,
      orderNo: "668102",
      model: "STYLE.SHAKIRA",
      fabricSupplier: "SHARABATI",
      fabricReadyWH: "2024-07-16",
      styleNo: "99_814_20",
      keyNo: "103750",
      fabric: "Ultra jet 85 Ocean",
      fabricArt: "17-6908/02",
      orderQty: 385,
      assignedLine: 1,
      startDatePreparation: "2024-09-07",
      startDateCutting: "2024-09-23",
      startDateSewing: "2024-09-27",
      endDateSewing: "2024-09-27",
      lastOutputLine: "2024-10-02",
      lastOutputLaundry: "2024-10-16",
      lastOutputPacking: "2024-10-19",
      readyForInspection: "2024-10-22",
      inspectionDate: "2024-10-24",
      possibleDD: "2024-11-05",
      originalETD: "2024-11-10",
      newETD: null,
      deviationDays: 5,
      status: "In Progress",
      currentStage: "Sewing"
    },
    {
      id: 2,
      orderNo: "668103",
      model: "STYLE.CARMEN",
      fabricSupplier: "TEXTILE CORP",
      fabricReadyWH: "2024-07-20",
      styleNo: "99_815_21",
      keyNo: "103751",
      fabric: "Denim Classic Blue",
      fabricArt: "18-7009/03",
      orderQty: 1200,
      assignedLine: 2,
      startDatePreparation: "2024-09-10",
      startDateCutting: "2024-09-26",
      startDateSewing: "2024-09-30",
      endDateSewing: "2024-10-01",
      lastOutputLine: "2024-10-06",
      lastOutputLaundry: "2024-10-20",
      lastOutputPacking: "2024-10-23",
      readyForInspection: "2024-10-26",
      inspectionDate: "2024-10-28",
      possibleDD: "2024-11-08",
      originalETD: "2024-11-15",
      newETD: null,
      deviationDays: 7,
      status: "Scheduled",
      currentStage: "Preparation"
    }
  ];

  const productionLines = [
    { id: 1, name: "Line 1", capacity: 900, currentLoad: 385 },
    { id: 2, name: "Line 2", capacity: 900, currentLoad: 1200 },
    { id: 3, name: "Line 3", capacity: 900, currentLoad: 750 },
    { id: 4, name: "Line 4", capacity: 900, currentLoad: 600 },
    { id: 5, name: "Line 5", capacity: 800, currentLoad: 480 },
    { id: 6, name: "Line 6", capacity: 700, currentLoad: 350 },
    { id: 7, name: "Line 7", capacity: 600, currentLoad: 200 }
  ];

  const holidays = [
    "2024-09-01", "2024-10-06", "2024-12-25", "2024-12-31"
  ];

  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const isHoliday = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.includes(dateStr);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Delayed': return 'bg-red-100 text-red-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLineUtilization = (line) => {
    return Math.min((line.currentLoad / line.capacity) * 100, 100);
  };

  useEffect(() => {
    setOrders(mockOrders);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">EMESSA Production Planning</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">16</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delayed</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Production Lines Overview */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Production Lines Utilization</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {productionLines.map((line) => (
                <div key={line.id} className="text-center">
                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{line.name}</h3>
                    <p className="text-xs text-gray-500">{line.capacity}/day</p>
                  </div>
                  <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
                        getLineUtilization(line) > 90 ? 'bg-red-500' : 
                        getLineUtilization(line) > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ height: `${getLineUtilization(line)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {getLineUtilization(line).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {line.currentLoad}/{line.capacity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Production Calendar
                </h2>
                <p className="text-sm text-gray-500">Week {getWeekNumber(new Date())}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - date.getDay() + i - 14);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const isHol = isHoliday(date);
                    
                    return (
                      <div
                        key={i}
                        className={`
                          h-8 w-8 flex items-center justify-center text-xs rounded cursor-pointer
                          ${isToday ? 'bg-blue-500 text-white' : ''}
                          ${isWeekend && !isToday ? 'bg-gray-100 text-gray-400' : ''}
                          ${isHol && !isToday ? 'bg-red-100 text-red-600' : ''}
                          ${!isToday && !isWeekend && !isHol ? 'hover:bg-gray-100' : ''}
                        `}
                        onClick={() => setSelectedDate(date)}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                    <span>Holiday</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                    <span>Weekend</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Production Orders</h2>
                  <div className="flex space-x-2">
                    <select 
                      value={selectedLine}
                      onChange={(e) => setSelectedLine(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value="all">All Lines</option>
                      {productionLines.map(line => (
                        <option key={line.id} value={line.id}>Line {line.id}</option>
                      ))}
                    </select>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                      Add Order
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETD</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deviation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.orderNo}</div>
                          <div className="text-sm text-gray-500">{order.keyNo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.model}</div>
                          <div className="text-sm text-gray-500">{order.styleNo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Line {order.assignedLine}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.orderQty.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.currentStage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.originalETD).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${order.deviationDays > 0 ? 'text-green-600' : order.deviationDays < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {order.deviationDays > 0 ? '+' : ''}{order.deviationDays}d
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <BarChart3 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Production Timeline</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Order {order.orderNo} - {order.model}</h3>
                      <p className="text-sm text-gray-500">Line {order.assignedLine} • {order.orderQty} units</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Preparation</span>
                      <span>Cutting</span>
                      <span>Sewing</span>
                      <span>Laundry</span>
                      <span>Packing</span>
                      <span>Inspection</span>
                      <span>Delivery</span>
                    </div>
                    
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>{new Date(order.startDatePreparation).toLocaleDateString()}</span>
                      <span>{new Date(order.startDateCutting).toLocaleDateString()}</span>
                      <span>{new Date(order.startDateSewing).toLocaleDateString()}</span>
                      <span>{new Date(order.lastOutputLaundry).toLocaleDateString()}</span>
                      <span>{new Date(order.lastOutputPacking).toLocaleDateString()}</span>
                      <span>{new Date(order.inspectionDate).toLocaleDateString()}</span>
                      <span>{new Date(order.possibleDD).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionPlanningSystem;