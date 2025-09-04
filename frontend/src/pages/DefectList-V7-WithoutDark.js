import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  TrendingUp,
  MoreVertical,
} from "lucide-react";
import { PRODUCTION_LINES } from "../data/dummy";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { toast } from "react-toastify";
import { fetchDefects, deleteDefect, fetchDefectStatistics } from "../services/defectService";
import {
  fetchDefectTypes,
  fetchDefectNames,
} from "../services/masterDataService";
import { useStateContext } from "../contexts/ContextProvider";
import LogDefectModal from "../components/defect/LogDefectModal";
import ConfirmationModal from "./../components/ConfirmationModal";
import Spinner from "../components/Spinner";

const DefectList = () => {
  const { currentColor } = useStateContext();
  const navigate = useNavigate();

  // Defect management states
  const [defects, setDefects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editDefect, setEditDefect] = useState(null);

  // Filter and sort states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const [sort, setSort] = useState({ field: "detectedDate", order: "desc" });
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [defectTypeFilter, setDefectTypeFilter] = useState("");
  const [defectNameFilter, setDefectNameFilter] = useState("");
  const [lineFilter, setLineFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [defectTypes, setDefectTypes] = useState([]);
  const [defectNames, setDefectNames] = useState([]);
  const [availableDefectNames, setAvailableDefectNames] = useState([]);
  const [productionLines, setProductionLines] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [error, setError] = useState("");
  // In your component
  const [statistics, setStatistics] = useState({
    totalDefects: 0,
    totalDefectCount: 0,
    criticalDefects: 0,
    recentDefects: 0,
    avgDefectsPerOrder: 0,
  });

  // Statistics calculations
  // const statistics = useMemo(() => {
  //   const totalDefects = defects.length;
  //   const totalDefectCount = defects.reduce(
  //     (sum, defect) => sum + defect.defectCount,
  //     0
  //   );
  //   const criticalDefects = defects.filter((d) => d.severity === "High").length;
  //   const recentDefects = defects.filter((d) => {
  //     const defectDate = new Date(d.detectedDate);
  //     const threeDaysAgo = new Date();
  //     threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  //     return defectDate >= threeDaysAgo;
  //   }).length;

  //   return {
  //     totalDefects,
  //     totalDefectCount,
  //     criticalDefects,
  //     recentDefects,
  //     avgDefectsPerOrder:
  //       totalDefects > 0 ? (totalDefectCount / totalDefects).toFixed(1) : 0,
  //   };
  // }, [defects]);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const stats = await fetchDefectStatistics({
          search,
          severity: severityFilter,
          defectType: defectTypeFilter,
          defectName: defectNameFilter,
          productionLine: lineFilter,
          dateFrom: dateFromFilter,
          dateTo: dateToFilter,
        });
        setStatistics(stats);
        console.log("Statistics loaded:", stats);
      } catch (error) {
        console.error("Error loading statistics:", error);
      }
    };

    loadStatistics();
  }, [
    search,
    severityFilter,
    defectTypeFilter,
    defectNameFilter,
    lineFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  // Fetch defect types on component mount
  useEffect(() => {
    const loadDefectTypes = async () => {
      try {
        const types = await fetchDefectTypes();
        setDefectTypes(types);
      } catch (error) {
        console.error("Failed to load defect types");
        setError("Failed to load defect types");
      }
    };
    loadDefectTypes();
  }, []);

  // Fetch defect names on component mount
  useEffect(() => {
    const loadDefectNames = async () => {
      try {
        const names = await fetchDefectNames();
        setDefectNames(names);
      } catch (error) {
        console.error("Failed to load defect names");
        setError("Failed to load defect names");
      }
    };
    loadDefectNames();
  }, []);

  // Filter defect names based on selected defect type
  useEffect(() => {
    if (defectTypeFilter && defectNames.length > 0) {
      const filteredNames = defectNames.filter(
        (name) => name.type._id === defectTypeFilter
      );
      setAvailableDefectNames(filteredNames);
    } else {
      setAvailableDefectNames([]);
      setDefectNameFilter(""); // Reset defect name filter when type changes
    }
  }, [defectTypeFilter, defectNames]);

  // Load defects with filters and pagination
  useEffect(() => {
    const loadDefects = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchDefects({
          page: pagination.page,
          limit: pagination.limit,
          sortField: sort.field,
          sortOrder: sort.order,
          search,
          severity: severityFilter,
          defectType: defectTypeFilter,
          defectName: defectNameFilter,
          productionLine: lineFilter,
          dateFrom: dateFromFilter,
          dateTo: dateToFilter,
        });

        setDefects(data.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
        }));

        // Extract unique production lines from the data
        const uniqueLines = [
          ...new Set(
            data.data.map((defect) => defect.productionLine).filter(Boolean)
          ),
        ];
        setProductionLines(uniqueLines);
      } catch (error) {
        console.error("Error loading defects:", error);
        setError("Failed to load defects");
        toast.error("Failed to load defects");
      } finally {
        setIsLoading(false);
      }
    };

    loadDefects();
  }, [
    pagination.page,
    pagination.limit,
    sort,
    search,
    severityFilter,
    defectTypeFilter,
    defectNameFilter,
    lineFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  // Modal handling functions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setEditDefect(null);
    setIsModalOpen(false);
  };

  const openEditModal = (defect) => {
    setEditDefect(defect);
    setIsModalOpen(true);
  };

  // Delete confirmation functions
  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    setDeleteId(null);
    setIsConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDefect(deleteId);
      setDefects(defects.filter((defect) => defect._id !== deleteId));
      toast.success("Defect deleted successfully");
    } catch (error) {
      console.error("Error deleting defect:", error);
      toast.error("Failed to delete defect");
    } finally {
      setIsConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // Function to add new defect to the list
  const onDefectCreated = (newDefect) => {
    setDefects([newDefect, ...defects]);
    // toast.success("Defect logged successfully");
  };

  // Function to update defect in the list
  const updateDefectInList = (updatedDefect) => {
    setDefects((prevDefects) =>
      prevDefects.map((defect) =>
        defect._id === updatedDefect._id ? updatedDefect : defect
      )
    );
    // toast.success("Defect updated successfully");
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // View defect details
  const viewDefectDetails = (defect) => {
    navigate(`/defects/${defect._id}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setSeverityFilter("");
    setDefectTypeFilter("");
    setDefectNameFilter("");
    setLineFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Check if any filters are active
  const hasActiveFilters =
    search ||
    severityFilter ||
    defectTypeFilter ||
    defectNameFilter ||
    lineFilter ||
    dateFromFilter ||
    dateToFilter;

  // Helper functions
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "High":
        return AlertTriangle;
      case "Medium":
        return AlertTriangle;
      case "Low":
        return Info;
      default:
        return Info;
    }
  };

  // Statistics Card Component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color,
    bgColor,
    description,
  }) => (
    <div
      className={`${bgColor} backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${color} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );

  const ActiveFiltersDisplay = () => {
    if (!hasActiveFilters) return null;

    return (
      <div className="bg-purple-50/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200/50 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-purple-700">
            Active filters:
          </span>
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Search: "{search}"
              <button
                onClick={() => setSearch("")}
                className="text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {severityFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Severity: {severityFilter}
              <button
                onClick={() => setSeverityFilter("")}
                className="text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {defectTypeFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Type: {defectTypes.find((t) => t._id === defectTypeFilter)?.name}
              <button
                onClick={() => setDefectTypeFilter("")}
                className="text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {lineFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Line: {lineFilter}
              <button
                onClick={() => setLineFilter("")}
                className="text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Clear all
          </button>
        </div>
      </div>
    );
  };

  if (isLoading && defects.length === 0) {
    return <Spinner />;
  }

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
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button
                onClick={openModal}
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
            value={statistics.avgDefectsPerOrder.toFixed(1)}
            icon={Target}
            trend="up"
            trendValue="+2.1"
            color="bg-orange-500"
            bgColor="bg-orange-50/80"
            description="Defects per order average"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
                  {/* {productionLines.length} */}
                  {PRODUCTION_LINES.length}
                </p>
              </div>
              <Factory className="w-8 h-8 text-green-500" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                  >
                    <option value="">All Severities</option>
                    <option value="High">Critical</option>
                    <option value="Medium">Major</option>
                    <option value="Low">Minor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Defect Type
                  </label>
                  <select
                    value={defectTypeFilter}
                    onChange={(e) => setDefectTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                  >
                    <option value="">All Types</option>
                    {defectTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Defect Name
                  </label>
                  <select
                    value={defectNameFilter}
                    onChange={(e) => setDefectNameFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                    disabled={!defectTypeFilter}
                  >
                    <option value="">All Names</option>
                    {availableDefectNames.map((name) => (
                      <option key={name._id} value={name._id}>
                        {name.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Production Line
                  </label>
                  <select
                    value={lineFilter}
                    onChange={(e) => setLineFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                  >
                    <option value="">All Lines</option>
                    {/* {productionLines.map(line => ( */}
                    {PRODUCTION_LINES.map((line) => (
                      <option key={line} value={line}>
                        {line}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
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
              {/* <div className="overflow-x-auto"> */}
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
                  {defects.map((defect) => {
                    const SeverityIcon = getSeverityIcon(defect.severity);
                    return (
                      <tr
                        key={defect._id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {defect.orderId?.orderNo || "N/A"}
                              </span>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {defect.orderId?.season || "N/A"}
                              </span>
                            </div>
                            <div className="font-medium text-gray-900">
                              {defect.defectName?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {defect.description || "No description"}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {defect.defectType?.name || "N/A"}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(
                              defect.severity
                            )}`}
                          >
                            <SeverityIcon className="w-4 h-4" />
                            {defect.severity}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Factory className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {defect.productionLine || "N/A"}
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
                              <span className="text-sm text-gray-500">
                                units
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(
                                defect.detectedDate
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Menu
                            as="div"
                            className="relative inline-block text-left"
                          >
                            <Menu.Button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div className="px-1 py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() =>
                                          viewDefectDetails(defect)
                                        }
                                        className={`${
                                          active ? "bg-gray-100" : ""
                                        } group flex rounded-lg items-center w-full px-2 py-2 text-sm text-gray-700`}
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => openEditModal(defect)}
                                        className={`${
                                          active ? "bg-gray-100" : ""
                                        } group flex rounded-lg items-center w-full px-2 py-2 text-sm text-gray-700`}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Defect
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() =>
                                          openDeleteConfirm(defect._id)
                                        }
                                        className={`${
                                          active ? "bg-red-50" : ""
                                        } group flex rounded-lg items-center w-full px-2 py-2 text-sm text-red-600`}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* </div> */}

              {/* Pagination */}
              {defects.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    defects
                  </div>
                  <div className="flex items-center">
                    <label className="text-sm text-gray-700 mr-2">
                      Items per page:
                    </label>
                    <select
                      value={pagination.limit}
                      onChange={(e) =>
                        setPagination({
                          ...pagination,
                          page: 1,
                          limit: Number(e.target.value),
                        })
                      }
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, pagination.page - 1))
                      }
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (
                            pagination.page >=
                            pagination.totalPages - 2
                          ) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                pagination.page === pageNum
                                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                                  : "hover:bg-gray-100"
                              } transition-colors duration-200`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      {pagination.totalPages > 5 &&
                        pagination.page < pagination.totalPages - 2 && (
                          <>
                            <span className="px-1">...</span>
                            <button
                              onClick={() =>
                                handlePageChange(pagination.totalPages)
                              }
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                pagination.page === pagination.totalPages
                                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                                  : "hover:bg-gray-100"
                              } transition-colors duration-200`}
                            >
                              {pagination.totalPages}
                            </button>
                          </>
                        )}
                    </div>

                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.min(pagination.totalPages, pagination.page + 1)
                        )
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {defects.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No defects found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Log Defect Modal */}
      {isModalOpen && (
        <LogDefectModal
          closeModal={closeModal}
          onDefectCreated={onDefectCreated}
          editDefect={editDefect}
          updateDefectInList={updateDefectInList}
          currentColor={currentColor}
        />
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this defect?"
          onConfirm={handleConfirmDelete}
          onCancel={closeConfirm}
        />
      )}
    </div>
  );
};

export default DefectList;
