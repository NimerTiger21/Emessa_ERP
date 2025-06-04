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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
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
  AlertCircle,
  GitCompare,
} from "lucide-react";
import { getDefectAnalytics } from "../services/defectAnalyticsApiService";
import DefectComparison from "../components/DefectComparison";

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

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const DefectDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeView, setActiveView] = useState("overview"); // 'overview', 'composition', 'comparison'

  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [filters, setFilters] = useState({
    severity: "",
    status: "",
    defectType: "", // <-- Add this line
  });
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleStyleClick = (data) => {
    // Find the selected style data
    const styleData = analytics.byStyle.find(
      (style) => style.name === data.name
    );
    setSelectedStyle(styleData);
  };

  const handleLineClick = (data) => {
    //console.log("name=>>  ", data);
    // Find the selected line data
    const lineData = analytics.byLine.find((line) => line.name === data.name);
    if (lineData) {
      setSelectedLine(lineData);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await getDefectAnalytics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...filters,
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
      defectType: "",
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
              <p className="text-red-700 font-medium">
                Error Loading Dashboard
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

  // Format data for easy rendering
  const lineDefects = analytics?.byLine || [];
  const fabricDefects = analytics?.byFabric || [];
  const styleDefects = analytics?.byStyle || [];
  const compositionDefects = analytics?.byComposition || [];
  // Convert percentage strings to numbers
  const formattedcompositionDefects = compositionDefects.map((item) => ({
    ...item,
    percentage: parseFloat(item.percentage), // Convert string to number
  }));
  const defectTypeData = analytics?.byDefectType || [];
  const defectPlaceData = analytics?.byDefectPlace || [];
  const trendData = analytics?.trendData || [];
  const severityData = analytics?.summary?.defectsBySeverity || [];
  // Convert percentage strings to numbers
  const formattedSeverityData = severityData.map((item) => ({
    ...item,
    percentage: parseFloat(item.percentage), // Convert string to number
  }));

  return (
    <div className="bg-gray-50 min-h-screen p-4 lg:p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quality Defect Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Comprehensive analysis of fabric, style, and composition defects
          </p>
        </div>

        <div className="flex flex-col sm:flex-row mt-4 lg:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
          {/* View Toggle Buttons */}

          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              className={`px-3 py-2 text-sm rounded-md flex items-center ${
                activeView === "overview"
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveView("overview")}
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              Overview
            </button>

            <button
              className={`px-3 py-2 text-sm rounded-md flex items-center ${
                activeView === "composition"
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveView("composition")}
            >
              <Layers className="h-4 w-4 mr-1" />
              Composition
            </button>

            <button
              className={`px-3 py-2 text-sm rounded-md flex items-center ${
                activeView === "comparison"
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveView("comparison")}
            >
              <GitCompare className="h-4 w-4 mr-1" />
              Comparison
            </button>
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Defect Type
              </label>
              <select
                name="defectType"
                value={filters.defectType}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Types</option>
                {analytics?.byDefectType.map((type) => (
                  // <option key={type._id} value={type._id}>
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
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
      {/* Main Content */}
      {activeView === "overview" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Defects</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {analytics?.summary?.totalDefects || 0}
                  </h3>
                  {analytics?.summary?.defectRatio && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ratio: {analytics.summary.defectRatio}% of{" "}
                      {analytics.summary.totalProducedItems} produced items
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
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {defectTypeData[0]?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    {defectTypeData[0]?.percentage || 0}% of total
                  </p>
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
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {defectPlaceData[0]?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-amber-600 mt-1">
                    {defectPlaceData[0]?.percentage || 0}% of total
                  </p>
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
                    {severityData.find((s) => s.name === "High")?.count || 0}
                  </h3>
                  <p className="text-sm text-red-600 mt-1">
                    {severityData.find((s) => s.name === "High")?.percentage ||
                      0}
                    % of total
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
            {/* Some other Ya Tiger Defects */}

            {/* Line Defects */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Defects by Production
                  {selectedLine && (
                    <>
                      <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-800 font-bold border border-yellow-400 shadow-sm animate-pulse">
                        {selectedLine?.name}
                      </span>
                    </>
                  )}
                </h3>
                <div className="text-xs text-gray-500">
                  Showing top {lineDefects.length} Lines
                </div>
              </div>
              {!selectedLine?.name ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lineDefects.slice(0, 7)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip
                        formatter={(value, name) => [`${value}%`, "Percentage"]}
                        labelFormatter={(value) => `Line: ${value}`}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                <p className="font-semibold">{`Line: ${label}`}</p>
                                {/* <p className="text-sm text-gray-600">{`Line No: ${data.lineNumber}`}</p> */}
                                <p className="text-sm text-gray-600">{`Line No: ${data.name}`}</p>
                                <p className="text-blue-600">{`Defects: ${data.count}`}</p>
                                <p className="text-green-600">{`Percentage: ${data.percentage}%`}</p>
                                <p className="text-orange-600">{`Efficiency: ${data.efficiency}%`}</p>
                                <p className="text-gray-600">{`Produced: ${data.totalProduced.toLocaleString()}`}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Click to view details
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="percentage"
                        name="Defect Percentage"
                        fill="#f59e0b"
                        onClick={handleLineClick}
                        className="cursor-pointer"
                      >
                        {lineDefects.slice(0, 7).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[(index + 4) % COLORS.length]}
                            className="hover:opacity-80 cursor-pointer"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                // Line Details
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {selectedLine.name} - Production Line Details
                      </h3>
                      <p className="text-sm text-gray-600">
                        {/* Line No: {selectedLine.lineNumber} | Total Defects:{" "} */}
                        Line No: {selectedLine.name} | Total Defects:{" "}
                        {selectedLine.count}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedLine(null)}
                      className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                      ← Back to Lines
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="text-sm font-medium text-red-700">
                        Total Defects
                      </h4>
                      <p className="text-2xl font-bold text-red-900">
                        {selectedLine.count}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-700">
                        Items Produced
                      </h4>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedLine.totalProduced.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="text-sm font-medium text-green-700">
                        Line Efficiency
                      </h4>
                      <p className="text-2xl font-bold text-green-900">
                        {selectedLine.efficiency}%
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="text-sm font-medium text-orange-700">
                        Defect Rate
                      </h4>
                      <p className="text-2xl font-bold text-orange-900">
                        {(
                          (selectedLine.count / selectedLine.totalProduced) *
                          100
                        ).toFixed(2)}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">
                      Line Performance Analysis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Quality Score:
                        </span>
                        <span
                          className={`ml-2 ${
                            selectedLine.efficiency > 90
                              ? "text-green-600"
                              : selectedLine.efficiency > 85
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {selectedLine.efficiency > 90
                            ? "Excellent"
                            : selectedLine.efficiency > 85
                            ? "Good"
                            : "Needs Improvement"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Defect Impact:
                        </span>
                        <span
                          className={`ml-2 ${
                            selectedLine.percentage < 15
                              ? "text-green-600"
                              : selectedLine.percentage < 25
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {selectedLine.percentage < 15
                            ? "Low"
                            : selectedLine.percentage < 25
                            ? "Medium"
                            : "High"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Fabric Defects */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Defects by Fabric
                </h3>
                <div className="text-xs text-gray-500">
                  Showing top {fabricDefects.length} fabrics
                </div>
              </div>

              <div className="h-5/6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fabricDefects.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, "Percentage"]}
                      labelFormatter={(value) => `Fabric: ${value}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="percentage"
                      name="Defect Percentage"
                      fill="#4f46e5"
                    >
                      {fabricDefects.slice(0, 5).map((entry, index) => (
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

            {/* Style Defects */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Defects by Style
                  {selectedStyle && (
                    <>
                      {" - Drilling down into "}
                      <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-800 font-bold border border-yellow-400 shadow-sm animate-pulse">
                        {selectedStyle.name}
                      </span>
                    </>
                  )}
                </h3>
                <div className="text-xs text-gray-500">
                  Showing top {styleDefects.length} styles
                </div>
              </div>
              {!selectedStyle ? (
                <div className="h-5/6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={styleDefects.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip
                        formatter={(value, name) => [`${value}%`, "Percentage"]}
                        labelFormatter={(value) => `Style: ${value}`}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                <p className="font-semibold">{`Style: ${label}`}</p>
                                <p className="text-sm text-gray-600">{`Style No: ${data.styleNo}`}</p>
                                <p className="text-blue-600">{`Count: ${data.count} defects`}</p>
                                <p className="text-green-600">{`Percentage: ${data.percentage}%`}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Click to drill down
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="percentage"
                        name="Defect Percentage"
                        fill="#10b981"
                        onClick={handleStyleClick}
                        className="cursor-pointer"
                      >
                        {styleDefects.slice(0, 5).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[(index + 2) % COLORS.length]}
                            className="hover:opacity-80 cursor-pointer"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {selectedStyle.name} - Key Number Breakdown
                      </h3>
                      <p className="text-sm text-gray-600">
                        Style No: {selectedStyle.styleNo} | Total Defects:{" "}
                        {selectedStyle.count}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedStyle(null)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      ← Back to Styles
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Key Number
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Defect Count
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Percentage of Style
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStyle.orders.map((order, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-white transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {order.keyNo}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {order.count}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {(
                                (order.count / selectedStyle.count) *
                                100
                              ).toFixed(1)}
                              %
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Second row of charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Composition Defects */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Defects by Fabric Composition
                </h3>
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
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {formattedcompositionDefects
                        .slice(0, 6)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </Pie>
                    {/* <Tooltip formatter={(value) => `${value}%`} /> */}
                    <Tooltip
                      formatter={(value, name, props) => {
                        const percent =
                          (value /
                            formattedcompositionDefects.reduce(
                              (a, b) => a + b.percentage,
                              0
                            )) *
                          100;
                        return `${percent.toFixed(1)}%`;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Monthly Defect Trend
                </h3>
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
                <h3 className="text-lg font-medium text-gray-800 text-center mb-4">
                  Distribution by Defect Type
                </h3>
              </div>

              <div className="h-96 md:h-120">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={defectTypeData.slice(0, 8)}
                  >
                    <PolarGrid />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: "#333", fontSize: 12 }}
                      tickFormatter={(value) =>
                        value.length > 10
                          ? `${value.substring(0, 10)}...`
                          : value
                      }
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tickCount={5}
                    />
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
                <h3 className="text-lg font-medium text-gray-800">
                  Defects by Severity
                </h3>
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
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {formattedSeverityData.map((entry, index) => {
                        let color = "#10b981"; // Default: green
                        if (entry.name === "High") color = "#ef4444"; // Red
                        if (entry.name === "Medium") color = "#f59e0b"; // Amber
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
              <h3 className="text-lg font-medium text-gray-800">
                Top Defective Fabrics
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Detailed breakdown of defects by fabric
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fabric
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Code
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Defect Count
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Produced
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fabricDefects.map((fabric, index) => (
                    <tr
                      key={fabric.id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td
                        title={
                          fabric.composition
                            ? fabric.composition
                            : "No composition info"
                        }
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${
                          fabric.composition
                            ? "cursor-pointer hover:text-blue-600"
                            : ""
                        }`}
                      >
                        {fabric.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fabric.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fabric.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fabric.totalProduced || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{ width: `${fabric.percentage}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {fabric.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {activeView === "composition" && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Composition Defects
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Detailed breakdown of defects by fabric composition
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={compositionDefects}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {activeView === "comparison" && <DefectComparison></DefectComparison>}

      {/* Footer */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Quality Defect Analytics. All rights
        reserved.
      </div>
      <div className="mt-4 text-center text-gray-500 text-sm">
        Developed by Emessa for Garment<sup>TM</sup>
        <br />
        <a
          href="https://emessadenim.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          www.emessadenim.com
        </a>
        <br />
      </div>
    </div>
  );
};

export default DefectDashboard;
