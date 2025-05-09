import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Loader, 
  Calendar, 
  PieChart as PieChartIcon, 
  BarChart2, 
  TrendingUp,
  Filter,
  RefreshCcw,
  Download,
  Layers,
  AlertCircle
} from 'lucide-react';
import { getDefectAnalytics } from '../services/defectAnalyticsApiService';

// Custom colors for charts
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const DefectDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    severity: '',
    status: ''
  });
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await getDefectAnalytics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...filters
      });
      setAnalytics(analyticsData);
      console.log(analyticsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchAnalytics();
    setFilterVisible(false);
  };

  const handleResetFilters = () => {
    setFilters({
      severity: '',
      status: ''
    });
    setDateRange({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-lg w-full">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-700 font-medium">Error Loading Dashboard</p>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                className="mt-3 bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm flex items-center"
                onClick={fetchAnalytics}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format data for easy rendering
  const fabricDefects = analytics?.byFabric || [];
  const styleDefects = analytics?.byStyle || [];
  const compositionDefects = analytics?.byComposition || [];
  // Convert percentage strings to numbers
const formattedcompositionDefects = compositionDefects.map(item => ({
  ...item,
  percentage: parseFloat(item.percentage)  // Convert string to number
}));
  const defectTypeData = analytics?.byDefectType || [];
  const defectPlaceData = analytics?.byDefectPlace || [];
  const trendData = analytics?.trendData || [];
  const severityData = analytics?.summary?.defectsBySeverity || [];
  // Convert percentage strings to numbers
const formattedSeverityData = severityData.map(item => ({
  ...item,
  percentage: parseFloat(item.percentage)  // Convert string to number
}));
  
  return (
    <div className="bg-gray-50 min-h-screen p-4 lg:p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quality Defect Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive analysis of fabric, style, and composition defects</p>
        </div>
        
        <div className="flex flex-col sm:flex-row mt-4 lg:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
          <button 
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-sm"
            onClick={() => setFilterVisible(!filterVisible)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          <button 
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-sm"
            onClick={fetchAnalytics}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          
          <button 
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Filter Panel */}
      {filterVisible && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">Filter Options</h3>
            <button 
              className="text-gray-500 hover:text-gray-700 text-sm"
              onClick={handleResetFilters}
            >
              Reset All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                name="severity"
                value={filters.severity}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Defects</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{analytics?.summary?.totalDefects || 0}</h3>
              {analytics?.summary?.defectRatio && (
        <p className="text-xs text-gray-500 mt-1">
          Ratio: {analytics.summary.defectRatio}% of {analytics.summary.totalProducedItems} produced items
        </p>
      )}
              </div>
            <div className="bg-indigo-50 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Defect Type</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{defectTypeData[0]?.name || "N/A"}</h3>
              <p className="text-sm text-green-600 mt-1">{defectTypeData[0]?.percentage || 0}% of total</p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <Layers className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Defect Location</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{defectPlaceData[0]?.name || "N/A"}</h3>
              <p className="text-sm text-amber-600 mt-1">{defectPlaceData[0]?.percentage || 0}% of total</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-full">
              <PieChartIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Severity Defects</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {severityData.find(s => s.name === "High")?.count || 0}
              </h3>
              <p className="text-sm text-red-600 mt-1">
                {severityData.find(s => s.name === "High")?.percentage || 0}% of total
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Fabric Defects */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Defects by Fabric</h3>
            <div className="text-xs text-gray-500">Showing top {fabricDefects.length} fabrics</div>
          </div>
          
          <div className="h-5/6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fabricDefects.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, 'Percentage']}
                  labelFormatter={(value) => `Fabric: ${value}`}
                />
                <Legend />
                <Bar dataKey="percentage" name="Defect Percentage" fill="#4f46e5">
                  {fabricDefects.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Style Defects */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Defects by Style</h3>
            <div className="text-xs text-gray-500">Showing top {styleDefects.length} styles</div>
          </div>
          
          <div className="h-5/6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={styleDefects.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, 'Percentage']}
                  labelFormatter={(value) => `Style: ${value}`}
                />
                <Legend />
                <Bar dataKey="percentage" name="Defect Percentage" fill="#10b981">
                  {styleDefects.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Second row of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Composition Defects */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Defects by Fabric Composition</h3>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedcompositionDefects.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {formattedcompositionDefects.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {/* <Tooltip formatter={(value) => `${value}%`} /> */}
                <Tooltip formatter={(value, name, props) => {
                  const percent = (value / formattedcompositionDefects.reduce((a,b) => a +b.percentage, 0)) * 100;
                  return `${percent.toFixed(1)}%`;
                }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Monthly Trend */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Monthly Defect Trend</h3>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip labelFormatter={(value) => `Month: ${value}`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Defect Count" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Third row of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defect Types */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 text-center mb-4">Distribution by Defect Type</h3>
          </div>
          
          <div className="h-96 md:h-120">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={defectTypeData.slice(0, 8)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" 
                tick={{ fill: '#333', fontSize: 12 }}
                tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}/>
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} />
                <Radar 
                  name="Defect Type" 
                  dataKey="percentage" 
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.6} 
                />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Defect Severity */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Defects by Severity</h3>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedSeverityData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {formattedSeverityData.map((entry, index) => {
                    let color = '#10b981'; // Default: green
                    if (entry.name === 'High') color = '#ef4444'; // Red
                    if (entry.name === 'Medium') color = '#f59e0b'; // Amber
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Data Table */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Top Defective Fabrics</h3>
          <p className="text-sm text-gray-500 mt-1">Detailed breakdown of defects by fabric</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fabric
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Defect Count
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fabricDefects.map((fabric, index) => (
                <tr key={fabric.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fabric.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fabric.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fabric.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${fabric.percentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">{fabric.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DefectDashboard;