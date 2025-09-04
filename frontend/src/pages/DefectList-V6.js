import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  Factory,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

const DefectList = () => {
  // Mock data - replace with your actual data source
  const [defects] = useState([
    {
      _id: "1",
      orderId: { orderNo: "ORD-2024-001", season: "Spring" },
      defectName: { name: "Stitching Issue" },
      defectType: { name: "Process" },
      severity: "Critical",
      detectedDate: "2024-08-15T10:30:00Z",
      defectCount: 25,
      productionLine: "Line A",
      category: "Process",
      description: "Loose stitching on sleeve seams"
    },
    {
      _id: "2",
      orderId: { orderNo: "ORD-2024-002", season: "Summer" },
      defectName: { name: "Color Mismatch" },
      defectType: { name: "Material" },
      severity: "Major",
      detectedDate: "2024-08-14T14:20:00Z",
      defectCount: 12,
      productionLine: "Line B",
      category: "Material",
      description: "Color variation in fabric dye"
    },
    {
      _id: "3",
      orderId: { orderNo: "ORD-2024-003", season: "Fall" },
      defectName: { name: "Button Defect" },
      defectType: { name: "Equipment" },
      severity: "Minor",
      detectedDate: "2024-08-13T09:15:00Z",
      defectCount: 8,
      productionLine: "Line C",
      category: "Equipment",
      description: "Loose button attachment"
    },
  ]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    severity: "",
    category: "",
    productionLine: "",
    dateFrom: "",
    dateTo: ""
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Production lines data
  const PRODUCTION_LINES = ["Line A", "Line B", "Line C", "Line D"];

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalDefects = defects.length;
    const totalDefectCount = defects.reduce((sum, defect) => sum + defect.defectCount, 0);
    const criticalDefects = defects.filter(d => d.severity === 'Critical').length;
    const recentDefects = defects.filter(d => {
      const defectDate = new Date(d.detectedDate);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return defectDate >= threeDaysAgo;
    }).length;

    return {
      totalDefects,
      totalDefectCount,
      criticalDefects,
      recentDefects,
      avgDefectsPerOrder: totalDefects > 0 ? (totalDefectCount / totalDefects).toFixed(1) : 0
    };
  }, [defects]);

  // Filter defects
  const filteredDefects = useMemo(() => {
    return defects.filter(defect => {
      const matchesSearch = search === "" || 
        defect.orderId.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        defect.defectName.name.toLowerCase().includes(search.toLowerCase()) ||
        defect.defectType.name.toLowerCase().includes(search.toLowerCase());

      const matchesSeverity = !filters.severity || defect.severity === filters.severity;
      const matchesCategory = !filters.category || defect.category === filters.category;
      const matchesProductionLine = !filters.productionLine || defect.productionLine === filters.productionLine;

      const defectDate = new Date(defect.detectedDate);
      const matchesDateFrom = !filters.dateFrom || defectDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || defectDate <= new Date(filters.dateTo);

      return matchesSearch && matchesSeverity && matchesCategory && matchesProductionLine && matchesDateFrom && matchesDateTo;
    });
  }, [defects, search, filters]);

  // Helper functions
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Major': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical': return AlertTriangle;
      case 'Major': return AlertTriangle;
      case 'Minor': return Info;
      default: return Info;
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFilters({
      severity: "",
      category: "",
      productionLine: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "") || search !== "";

  // Statistics Card Component
  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bgColor, description }) => (
    <div className={`${bgColor} backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${color} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );

  const ActiveFiltersDisplay = () => {
    if (!hasActiveFilters) return null;

    return (
      <div className="bg-purple-50/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200/50 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-purple-700">Active filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Search: "{search}"
              <button onClick={() => setSearch("")} className="text-purple-600 hover:text-purple-800">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <span key={key} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, [key]: "" }))}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={resetFilters}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Clear all
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Defect Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Track and manage production defects
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Log Defect
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Defects"
            value={statistics.totalDefects.toLocaleString()}
            icon={Package}
            trend="down"
            trendValue="-5%"
            color="bg-blue-500"
            bgColor="bg-blue-50/80"
            description="All logged defects"
          />
          <StatCard
            title="Total Count"
            value={statistics.totalDefectCount.toLocaleString()}
            icon={BarChart3}
            trend="down"
            trendValue="-8%"
            color="bg-purple-500"
            bgColor="bg-purple-50/80"
            description="Sum of all defect counts"
          />
          <StatCard
            title="Critical Issues"
            value={statistics.criticalDefects.toString()}
            icon={AlertTriangle}
            trend="down"
            trendValue="-12%"
            color="bg-red-500"
            bgColor="bg-red-50/80"
            description="High priority defects"
          />
          <StatCard
            title="Avg per Order"
            value={statistics.avgDefectsPerOrder}
            icon={Target}
            trend="up"
            trendValue="+2.1"
            color="bg-orange-500"
            bgColor="bg-orange-50/80"
            description="Defects per order average"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">Recent Defects</p>
                  <div className="relative group">
                    <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                      Defects logged in last 3 days
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics.recentDefects}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">Active Lines</p>
                  <div className="relative group">
                    <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                      Production lines with defects
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(defects.map(d => d.productionLine)).size}
                </p>
              </div>
              <Factory className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-purple-600">87.5%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search defects by order, type, or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50 backdrop-blur-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                  >
                    <option value="">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="Major">Major</option>
                    <option value="Minor">Minor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                  >
                    <option value="">All Categories</option>
                    <option value="Process">Process</option>
                    <option value="Material">Material</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Production Line</label>
                  <select
                    value={filters.productionLine}
                    onChange={(e) => setFilters(prev => ({ ...prev, productionLine: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                  >
                    <option value="">All Lines</option>
                    {PRODUCTION_LINES.map(line => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        <ActiveFiltersDisplay />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-700 font-medium text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
            <div className="inline-flex items-center gap-3 text-red-600">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl font-medium">Loading defects...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Defects Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order & Defect
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type & Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Production Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count & Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDefects.map((defect) => {
                      const SeverityIcon = getSeverityIcon(defect.severity);
                      return (
                        <tr key={defect._id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {defect.orderId.orderNo}
                                </span>
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {defect.orderId.season}
                                </span>
                              </div>
                              <div className="font-medium text-gray-900">
                                {defect.defectName.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {defect.description}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {defect.defectType.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {defect.category}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(defect.severity)}`}>
                              <SeverityIcon className="w-4 h-4" />
                              {defect.severity}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Factory className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                  {defect.productionLine}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-red-600">
                                  {defect.defectCount}
                                </span>
                                <span className="text-sm text-gray-500">units</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {new Date(defect.detectedDate).toLocaleDateString()}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredDefects.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No defects found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DefectList;