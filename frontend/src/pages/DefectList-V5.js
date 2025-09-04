import React, { useEffect, useState } from "react";

import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar,
  X,
  ChevronDown,
  AlertTriangle,
  Target,
  Clock,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Zap,
  Activity,
  Users,
  Factory,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Table,
  Grid
} from "lucide-react";

// Mock data and context for demo
const PRODUCTION_LINES = ["Line A", "Line B", "Line C", "Line D"];
const mockCurrentColor = "#3B82F6";

// Enhanced mock data with additional fields
const mockDefects = [
  {
    _id: "1",
    orderId: { orderNo: "ORD-2024-001", season: "Spring 2024" },
    defectName: { name: "Thread Break" },
    defectType: { name: "Mechanical" },
    severity: "Critical",
    detectedDate: "2024-01-15T10:30:00Z",
    defectCount: 15,
    productionLine: "Line A",
    impactScore: 85,
    frequency: "High",
    costImpact: 1250,
    timeToDetect: 2.5,
    category: "Process"
  },
  {
    _id: "2",
    orderId: { orderNo: "ORD-2024-002", season: "Summer 2024" },
    defectName: { name: "Color Variation" },
    defectType: { name: "Quality" },
    severity: "Major",
    detectedDate: "2024-01-14T14:20:00Z",
    defectCount: 8,
    productionLine: "Line B",
    impactScore: 65,
    frequency: "Medium",
    costImpact: 800,
    timeToDetect: 1.2,
    category: "Material"
  },
  {
    _id: "3",
    orderId: { orderNo: "ORD-2024-003", season: "Fall 2024" },
    defectName: { name: "Size Inconsistency" },
    defectType: { name: "Dimensional" },
    severity: "Minor",
    detectedDate: "2024-01-13T09:15:00Z",
    defectCount: 3,
    productionLine: "Line C",
    impactScore: 25,
    frequency: "Low",
    costImpact: 200,
    timeToDetect: 0.8,
    category: "Equipment"
  },
  {
    _id: "4",
    orderId: { orderNo: "ORD-2024-004", season: "Winter 2024" },
    defectName: { name: "Seam Failure" },
    defectType: { name: "Structural" },
    severity: "Critical",
    detectedDate: "2024-01-12T16:45:00Z",
    defectCount: 22,
    productionLine: "Line D",
    impactScore: 95,
    frequency: "High",
    costImpact: 1800,
    timeToDetect: 3.1,
    category: "Process"
  },
  {
    _id: "5",
    orderId: { orderNo: "ORD-2024-005", season: "Spring 2024" },
    defectName: { name: "Print Alignment" },
    defectType: { name: "Visual" },
    severity: "Major",
    detectedDate: "2024-01-11T11:30:00Z",
    defectCount: 12,
    productionLine: "Line A",
    impactScore: 55,
    frequency: "Medium",
    costImpact: 650,
    timeToDetect: 1.5,
    category: "Equipment"
  }
];

const DefectList = () => {
  // Mock navigation function
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
  };

  // State management
  const [defects, setDefects] = useState(mockDefects);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);
  
  // Enhanced filters
  const [filters, setFilters] = useState({
    search: "",
    severity: "",
    defectType: "",
    defectName: "",
    productionLine: "",
    frequency: "",
    category: "",
    impactRange: "",
    dateFrom: "",
    dateTo: ""
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Mock data for dropdowns
  const defectTypes = [
    { _id: "1", name: "Mechanical" },
    { _id: "2", name: "Quality" },
    { _id: "3", name: "Dimensional" },
    { _id: "4", name: "Structural" },
    { _id: "5", name: "Visual" }
  ];

  const defectNames = [
    { _id: "1", name: "Thread Break", type: { _id: "1" } },
    { _id: "2", name: "Color Variation", type: { _id: "2" } },
    { _id: "3", name: "Size Inconsistency", type: { _id: "3" } },
    { _id: "4", name: "Seam Failure", type: { _id: "4" } },
    { _id: "5", name: "Print Alignment", type: { _id: "5" } }
  ];

  // Enhanced statistics with comprehensive KPIs
  const stats = {
    total: defects.length,
    critical: defects.filter(d => d.severity === 'Critical').length,
    avgImpactScore: Math.round(defects.reduce((sum, d) => sum + d.impactScore, 0) / defects.length),
    totalCostImpact: defects.reduce((sum, d) => sum + d.costImpact, 0),
    avgDetectionTime: (defects.reduce((sum, d) => sum + d.timeToDetect, 0) / defects.length).toFixed(1),
    highFrequency: defects.filter(d => d.frequency === 'High').length,
    defectRate: ((defects.reduce((sum, d) => sum + d.defectCount, 0) / 1000) * 100).toFixed(2), // Assuming 1000 total production
    qualityIndex: Math.round(100 - (defects.reduce((sum, d) => sum + d.impactScore, 0) / (defects.length * 100)) * 100)
  };

  // Trend calculations (mock data for demo)
  const trends = {
    defectRate: -12.5, // Positive means increase, negative means decrease
    costImpact: 8.3,
    avgImpact: -5.2,
    detectionTime: -15.7
  };

  // Filter handlers
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      severity: "",
      defectType: "",
      defectName: "",
      productionLine: "",
      frequency: "",
      category: "",
      impactRange: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Major': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUpRight className="w-4 h-4 text-red-500" />;
    if (trend < 0) return <ArrowDownRight className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-red-600';
    if (trend < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Enhanced Modern Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                    Quality Control Center
                  </h1>
                  <p className="text-sm text-gray-500">Advanced defect analytics & management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live Monitoring</span>
                </div>
              </div>
              
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/90 transition-all duration-200 shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
              
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/90 transition-all duration-200 shadow-sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Data
              </button>

              <button 
                className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Defect
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Enhanced KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Defect Rate */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/30 hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(trends.defectRate)}
                <span className={`text-sm font-medium ${getTrendColor(trends.defectRate)}`}>
                  {Math.abs(trends.defectRate)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Defect Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.defectRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Per 1000 units produced</p>
            </div>
          </div>

          {/* Quality Index */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/30 hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(trends.avgImpact)}
                <span className={`text-sm font-medium ${getTrendColor(trends.avgImpact)}`}>
                  {Math.abs(trends.avgImpact)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Quality Index</p>
              <p className="text-3xl font-bold text-gray-900">{stats.qualityIndex}</p>
              <p className="text-xs text-gray-500 mt-1">Overall quality score</p>
            </div>
          </div>

          {/* Cost Impact */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/30 hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(trends.costImpact)}
                <span className={`text-sm font-medium ${getTrendColor(trends.costImpact)}`}>
                  {Math.abs(trends.costImpact)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Cost Impact</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalCostImpact.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total estimated loss</p>
            </div>
          </div>

          {/* Detection Efficiency */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/30 hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(trends.detectionTime)}
                <span className={`text-sm font-medium ${getTrendColor(trends.detectionTime)}`}>
                  {Math.abs(trends.detectionTime)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Detection Time</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgDetectionTime}h</p>
              <p className="text-xs text-gray-500 mt-1">Time to identify defects</p>
            </div>
          </div>
        </div>

        {/* Secondary KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-4 border border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Critical Issues</p>
                <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-100 rounded-2xl p-4 border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">High Frequency</p>
                <p className="text-2xl font-bold text-orange-900">{stats.highFrequency}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Avg Impact Score</p>
                <p className="text-2xl font-bold text-blue-900">{stats.avgImpactScore}/100</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Production Lines</p>
                <p className="text-2xl font-bold text-purple-900">{PRODUCTION_LINES.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/30 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search defects, orders, impact scores..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-5 py-3 text-sm font-medium rounded-2xl transition-all duration-200 shadow-sm ${
                  showFilters
                    ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-purple-100'
                    : 'bg-white/60 text-gray-700 border-gray-300 hover:bg-white/80'
                } border backdrop-blur-sm`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
                {hasActiveFilters && (
                  <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-5 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-2xl hover:bg-red-100 transition-all duration-200 shadow-sm backdrop-blur-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Expandable Filters */}
          <div className={`transition-all duration-500 overflow-hidden ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Severity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => updateFilter('severity', e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="Major">Major</option>
                    <option value="Minor">Minor</option>
                  </select>
                </div>

                {/* Frequency Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={filters.frequency}
                    onChange={(e) => updateFilter('frequency', e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">All Frequencies</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Production Line Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Production Line</label>
                  <select
                    value={filters.productionLine}
                    onChange={(e) => updateFilter('productionLine', e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">All Lines</option>
                    {PRODUCTION_LINES.map((line) => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="Process">Process</option>
                    <option value="Material">Material</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
              </div>

              {/* Impact Range and Date Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Impact Score Range</label>
                  <select
                    value={filters.impactRange}
                    onChange={(e) => updateFilter('impactRange', e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">All Impact Ranges</option>
                    <option value="80-100">Critical (80-100)</option>
                    <option value="50-79">High (50-79)</option>
                    <option value="30-49">Medium (30-49)</option>
                    <option value="0-29">Low (0-29)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => updateFilter('dateFrom', e.target.value)}
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => updateFilter('dateTo', e.target.value)}
                      min={filters.dateFrom}
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600 mr-2">Active filters:</span>
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <span key={key} className="inline-flex items-center px-0.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium border border-purple-200">
                          {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                          <button
                            onClick={() => updateFilter(key, "")}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Enhanced Defect List Table */}
        <div className={`bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-xl transition-all duration-300 ${viewMode === 'table' ? 'block' : 'hidden'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Defect List</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Table className="w-5 h-5 inline-block mr-1" />
                Table View
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${viewMode === 'card' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Grid className="w-5 h-5 inline-block mr-1" />
                Card View
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defect Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defect Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detected Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production Line</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {defects.map((defect) => (
                <tr key={defect._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {defect.orderId.orderNo}
                    <div className="text-sm text-gray-500">{defect.orderId.season}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{defect.defectName.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{defect.defectType.name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${getSeverityColor(defect.severity)}`}>
                    {defect.severity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(defect.detectedDate).toLocaleDateString()} 
                    <span className="text-sm text-gray-500 ml-2">{new Date(defect.detectedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{defect.defectCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getFrequencyColor(defect.frequency)}`}>
                      {defect.productionLine}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/defect/${defect._id}`)}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/defect/edit/${defect._id}`)}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => console.log(`Deleting defect ${defect._id}`)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Enhanced Card View */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${viewMode === 'card' ? 'block' : 'hidden'}`}>
          {defects.map((defect) => (
            <div key={defect._id} className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-xl transition-all duration-300 hover:bg-white/90">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-gray-800">{defect.defectName.name}</div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSeverityColor(defect.severity)}`}>
                  {defect.severity}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Order No:</span> {defect.orderId.orderNo} ({defect.orderId.season})
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Type:</span> {defect.defectType.name}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Detected:</span> {new Date(defect.detectedDate).toLocaleDateString()} at {new Date(defect.detectedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Count:</span> {defect.defectCount}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Production Line:</span> {defect.productionLine}
              </div>
              <div className={`text-sm ${getImpactColor(defect.impactScore)}`}>
                <span className="font-medium">Impact Score:</span> {defect.impactScore}/100
              </div>
              <div className="mt-4 flex items-center justify-end space-x-3">
                <button
                  onClick={() => navigate(`/defect/${defect._id}`)}
                  className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate(`/defect/edit/${defect._id}`)}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => console.log(`Deleting defect ${defect._id}`)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default DefectList;
