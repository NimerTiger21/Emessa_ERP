import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Loader,
  Filter,
  RefreshCcw,
  Download,
  AlertCircle,
  Droplets,
  FlaskRound,
  Clock,
  Thermometer,
  FlaskConical,
} from "lucide-react";
import { getWashRecipeDefectAnalytics } from "../services/defectAnalyticsApiService";
import WashRecipeTable from "../components/washRecipes/analytics/WashRecipeTable";

// Custom colors for charts
const COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const WashRecipeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [filters, setFilters] = useState({
    severity: "",
    status: "",
    washType: "",
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'top', 'lowest'

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await getWashRecipeDefectAnalytics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...filters,
      });
      setAnalytics(analyticsData);
      console.log("Fetched wash recipe analytics:", analyticsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching wash recipe analytics:", err);
      setError(
        "Failed to load wash recipe analytics data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    fetchAnalytics();
    setFilterVisible(false);
  };

  const handleResetFilters = () => {
    setFilters({
      severity: "",
      status: "",
      washType: "",
    });
    setDateRange({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3))
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading wash recipe analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-lg w-full">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-700 font-medium">
                Error Loading Wash Recipe Analytics
              </p>
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

  // Format data for charts
  const washTypeData = analytics?.byWashType || [];
  const chemicalData = analytics?.byChemical || [];
  const processData = analytics?.byProcess.map(item => ({...item, percentage: Number(item.percentage)})) || [];
  const temperatureData = analytics?.byTemperature || [];
  const waterRatioData = analytics?.byWaterRatio || [];
  const durationData = analytics?.byDuration || [];

  // Get recipe data based on active tab
  const getActiveRecipes = () => {
    switch (activeTab) {
      case "top":
        return analytics.recipes?.topDefective || [];
      case "lowest":
        return analytics.recipes?.lowestDefective || [];
      case "all":
      default:
        return analytics.recipes?.all || [];
    }
  };
  console.log("process: ", processData);

  return (
    <div className="bg-gray-50 min-h-screen p-4 lg:p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Wash Recipe Defect Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Analysis of defects related to wash recipes and processes
          </p>
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

          <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-sm">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wash Type
              </label>
              <select
                name="washType"
                value={filters.washType}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Wash Types</option>
                <option value="Size set">Size Set</option>
                <option value="SMS">SMS</option>
                <option value="Proto">Proto</option>
                <option value="Production">Production</option>
                <option value="Fitting Sample">Fitting Sample</option>
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
              <p className="text-sm text-gray-500">Wash Recipe Defects</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {analytics?.summary?.totalWashRecipeDefects || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {analytics?.summary?.washRecipeDefectRatio || 0}% of total
                defects
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-full">
              <Droplets className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Wash Type</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {washTypeData[0]?.name || "N/A"}
              </h3>
              <p className="text-sm text-green-600 mt-1">
                {washTypeData[0]?.percentage || 0}% of total
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <Droplets className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Chemical</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {chemicalData[0]?.name || "N/A"}
              </h3>
              <p className="text-sm text-amber-600 mt-1">
                {chemicalData[0]?.percentage || 0}% of total
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-full">
              <FlaskRound className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Process</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {processData[0]?.name || "N/A"}
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                {processData[0]?.percentage || 0}% of total
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <FlaskConical className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Wash Type Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Defects by Wash Type
            </h3>
          </div>

          <div className="h-5/6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={washTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, "Percentage"]}
                  labelFormatter={(value) => `Wash Type: ${value}`}
                />
                <Legend />
                <Bar
                  dataKey="percentage"
                  name="Defect Percentage"
                  fill="#4f46e5"
                >
                  {washTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chemical Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Defects by Chemical
            </h3>
          </div>

          <div className="h-5/6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chemicalData.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, "Percentage"]}
                  labelFormatter={(value) => `Chemical: ${value}`}
                />
                <Legend />
                <Bar
                  dataKey="percentage"
                  name="Defect Percentage"
                  fill="#10b981"
                >
                  {chemicalData.slice(0, 6).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 2) % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second row of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Process Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Defects by Process
            </h3>
          </div>

          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${parseFloat(percent).toFixed(1)}%`
                  }
                >
                  {processData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Defects by Temperature Range
            </h3>
          </div>

          <div className="h-5/6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar
                  dataKey="percentage"
                  name="Defect Percentage"
                  fill="#f59e0b"
                >
                  {temperatureData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 4) % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Third row of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Water Ratio Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Defects by Water Ratio (Liters)
            </h3>
          </div>

          <div className="h-5/6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterRatioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar
                  dataKey="percentage"
                  name="Defect Percentage"
                  fill="#06b6d4"
                >
                  {waterRatioData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 5) % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Duration Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Defects by Duration (Minutes)
            </h3>
          </div>

          <div className="h-5/6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar
                  dataKey="percentage"
                  name="Defect Percentage"
                  fill="#8b5cf6"
                >
                  {durationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 1) % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {/* <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Wash Recipes</h3>
        </div>
        <div className="p-4">
          <WashRecipeTable />
        </div>
      </div> */}

      {/* Data Table */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Wash Recipes</h3>

          {/* Tab navigation */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab("all")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Recipes
              </button>
              <button
                onClick={() => setActiveTab("top")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "top"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Top Defective
              </button>
              <button
                onClick={() => setActiveTab("lowest")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "lowest"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Lowest Defective
              </button>
            </nav>
          </div>
        </div>
        <div className="p-4">
          <WashRecipeTable recipes={getActiveRecipes()} />
        </div>
      </div>
    </div>
  );
};

export default WashRecipeDashboard;
