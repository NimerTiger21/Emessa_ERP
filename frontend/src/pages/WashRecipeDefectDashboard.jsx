import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Loader, 
  Droplet, 
  PieChart as PieChartIcon, 
  BarChart2, 
  TrendingUp,
  Filter,
  RefreshCcw,
  Download,
  AlertCircle,
  Layers,
  Flask,
  Beaker
} from 'lucide-react';
import { getWashRecipeDefectAnalytics2 } from '../services/defectAnalyticsApiService';
import WashRecipeDefectChart from '../components/washRecipes/analytics/WashRecipeDefectChart';

// Custom colors for charts
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const PROCESS_COLORS = {
  'DRY PROCESS': '#10b981',   // Green
  'SPRAY PROCESS': '#4f46e5', // Indigo
};
const WASH_TYPE_COLORS = {
  'Size set': '#8b5cf6',     // Purple
  'SMS': '#f59e0b',          // Amber
  'Proto': '#06b6d4',        // Cyan
  'Production': '#ef4444',   // Red
  'Fitting Sample': '#ec4899' // Pink
};
const SEVERITY_COLORS = {
  'Low': '#10b981',    // Green
  'Medium': '#f59e0b', // Amber
  'High': '#ef4444'    // Red
};

const WashRecipeDefectDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    washType: ''
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [tableView, setTableView] = useState('top'); // 'top', 'low', or 'all'

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await getWashRecipeDefectAnalytics2({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...filters
      });
      setAnalytics(analyticsData);
      console.log(analyticsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching wash recipe analytics:", err);
      setError("Failed to load wash recipe analytics data. Please try again later.");
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
      status: '',
      washType: ''
    });
    setDateRange({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading wash recipe analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-lg w-full">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-700 font-medium">Error Loading Data</p>
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

  // Get table data based on selected view
  const getTableData = () => {
    if (!analytics) return [];
    
    switch (tableView) {
      case 'top':
        return analytics.topDefectiveRecipes || [];
      case 'low':
        return analytics.lowestDefectiveRecipes || [];
      case 'all':
      default:
        return analytics.allRecipes || [];
    }
  };

  // Format wash type data for chart
  const formatWashTypeData = () => {
    if (!analytics?.washTypeAnalytics) return [];
    return analytics.washTypeAnalytics.map(item => ({
      name: item.type,
      defects: item.totalDefects,
      recipes: item.recipeCount,
      ratio: parseFloat(item.averageDefectRatio)
    }));
  };

  // Format process type data for chart
  const formatProcessTypeData = () => {
    if (!analytics?.processTypeAnalytics) return [];
    return analytics.processTypeAnalytics.map(item => ({
      name: item.type,
      defects: item.totalDefects,
      recipes: item.recipeCount,
      average: parseFloat(item.averageDefectsPerRecipe)
    }));
  };

  // Format top defective recipes for scatter plot
  const formatScatterData = () => {
    if (!analytics?.topDefectiveRecipes) return [];
    return analytics.topDefectiveRecipes.map(recipe => ({
      x: recipe.orderQty,
      y: parseFloat(recipe.defectRatio),
      z: recipe.defectCount,
      name: recipe.washCode || 'N/A',
      washType: recipe.washType
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 lg:p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wash Recipe Defect Analysis</h1>
          <p className="text-gray-500 mt-1">Analysis of defect rates per wash recipe and process type</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
        </div>
      )}
      
      {/* Chart */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <WashRecipeDefectChart data={analytics} />
      </div>
    </div>
  );
};

export default WashRecipeDefectDashboard;