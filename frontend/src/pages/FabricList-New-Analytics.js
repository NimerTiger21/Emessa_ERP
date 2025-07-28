import React, { useState, useEffect } from "react";
import {
  fetchFabrics,
  deleteFabric,
  fetchFabricSuppliers,
} from "../services/masterDataService";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { 
  FiEdit, 
  FiTrash2, 
  FiDownload, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList,
  FiBarChart3,
  FiTrendingUp,
  FiPackage,
  FiUsers,
  FiPieChart,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiEye,
  FiX
} from "react-icons/fi";
import Spinner from "../components/Spinner";
import FabricModal from "../components/FabricModal";

// Enhanced Tooltip Component
const Tooltip = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-in fade-in zoom-in duration-200`}>
          <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700/50 max-w-xs">
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900/95 rotate-45 ${
              position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 -ml-1' :
              'right-full top-1/2 transform -translate-y-1/2 -mr-1'
            }`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Card Component
const AnalyticsCard = ({ title, value, icon: Icon, change, color, subtitle }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
        <Icon size={24} />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-200' : 'text-red-200'}`}>
          <FiTrendingUp size={16} className={change < 0 ? 'rotate-180' : ''} />
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <h3 className="text-2xl font-bold mb-1">{value}</h3>
    <p className="text-white/80 text-sm font-medium">{title}</p>
    {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
  </div>
);

// Enhanced Pagination Component
const PaginationControls = ({ pagination, onPageChange, compact = false }) => {
  const { page, totalPages } = pagination;
  
  const getVisiblePages = () => {
    const delta = compact ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${compact ? 'gap-1' : 'gap-2'}`}>
      <Tooltip content="First page">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            page === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:bg-indigo-50 hover:scale-110"
          }`}
        >
          <FiChevronsLeft size={compact ? 16 : 18} />
        </button>
      </Tooltip>

      <Tooltip content="Previous page">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            page === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:bg-indigo-50 hover:scale-110"
          }`}
        >
          <FiChevronLeft size={compact ? 16 : 18} />
        </button>
      </Tooltip>

      {getVisiblePages().map((pageNum, index) => (
        <button
          key={index}
          disabled={pageNum === '...'}
          onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : null}
          className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 ${compact ? 'text-sm px-2 py-1' : ''} ${
            pageNum === page
              ? "bg-indigo-500 text-white shadow-lg"
              : pageNum === '...'
              ? "text-gray-400 cursor-default"
              : "text-indigo-600 hover:bg-indigo-50 hover:scale-110"
          }`}
        >
          {pageNum}
        </button>
      ))}

      <Tooltip content="Next page">
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            page === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:bg-indigo-50 hover:scale-110"
          }`}
        >
          <FiChevronRight size={compact ? 16 : 18} />
        </button>
      </Tooltip>

      <Tooltip content="Last page">
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            page === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:bg-indigo-50 hover:scale-110"
          }`}
        >
          <FiChevronsRight size={compact ? 16 : 18} />
        </button>
      </Tooltip>
    </div>
  );
};

const FabricList = () => {
  const [editFabric, setEditFabric] = useState(null);
  const [fabrics, setFabrics] = useState([]);
  const [filteredFabrics, setFilteredFabrics] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sort, setSort] = useState({ field: "name", order: "desc" });
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: viewMode === "grid" ? 12 : 7,
    totalPages: 1,
  });

  // Update pagination limit when view mode changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      limit: viewMode === "grid" ? 12 : 7,
      page: 1
    }));
  }, [viewMode]);

  useEffect(() => {
    const loadFabrics = async () => {
      try {
        const fabricData = await fetchFabrics({
          page: pagination.page,
          limit: pagination.limit,
          sortField: sort.field,
          sortOrder: sort.order,
          search,
          supplier: selectedSupplier,
        });
        setFabrics(fabricData.data);
        setFilteredFabrics(fabricData.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: fabricData.pagination.totalPages,
        }));
      } catch (error) {
        console.error("Error loading fabrics:", error);
        setIsLoading(false);
      }
    };
    loadFabrics();
    fetchFabricSuppliers().then(setSuppliers);
    setIsLoading(false);
  }, [pagination.page, pagination.limit, sort, search, selectedSupplier]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [selectedSupplier, search, sort]);

  // Calculate analytics
  const analytics = {
    totalFabrics: fabrics.length,
    totalSuppliers: suppliers.length,
    averageCompositions: fabrics.length > 0 ? 
      (fabrics.reduce((acc, fabric) => acc + (fabric.fabricCompositions?.length || 0), 0) / fabrics.length).toFixed(1) : 0,
    topColors: fabrics.reduce((acc, fabric) => {
      const color = fabric.color || 'Unknown';
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {}),
    supplierDistribution: suppliers.map(supplier => ({
      name: supplier.name,
      count: fabrics.filter(fabric => fabric.supplier?._id === supplier._id).length
    })).sort((a, b) => b.count - a.count).slice(0, 5),
    recentlyAdded: fabrics.filter(fabric => {
      const createdDate = new Date(fabric.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length
  };

  const exportToExcel = () => {
    if (!fabrics || fabrics.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    const worksheetData = fabrics.map((fabric) => ({
      Name: fabric.name,
      Code: fabric.code,
      Color: fabric.color,
      Supplier: fabric.supplier?.name || "N/A",
      Composition:
        fabric.fabricCompositions
          ?.map(
            (fc) =>
              `${fc.value}% ${
                fc.compositionItem?.name || "Unknown"
              } abbrPrefix: ${fc.compositionItem.abbrPrefix}`
          )
          .join(", ") || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fabrics");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(dataBlob, "Fabrics.xlsx");
    toast.success("Fabrics exported successfully to Excel");
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    if (selectedSupplier) {
      setFilteredFabrics(
        fabrics.filter((fabric) => fabric.supplier?._id === selectedSupplier)
      );
    } else {
      setFilteredFabrics(fabrics);
    }
  }, [selectedSupplier, fabrics]);

  const updateFabricList = async (updatedFabric) => {
    if (!updatedFabric || !updatedFabric._id) {
      console.error("Invalid updated fabric:", updatedFabric);
      toast.error("Invalid updated fabric");
      return;
    }
    setFabrics((prevFabrics) => {
      const fabricExists = prevFabrics.some(
        (fabric) => fabric._id === updatedFabric._id
      );

      if (fabricExists) {
        return prevFabrics.map((fabric) =>
          fabric._id === updatedFabric._id ? updatedFabric : fabric
        );
      } else {
        return [...prevFabrics, updatedFabric];
      }
    });
  };

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFabric(deleteId);
      setFabrics(fabrics.filter((fabric) => fabric._id !== deleteId));
      toast.success("Fabric deleted successfully");
    } catch (error) {
      alert("Error deleting fabric");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const openEditModal = (fabric) => {
    setEditFabric(fabric);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditFabric(null);
    setIsModalOpen(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeConfirm = () => setIsConfirmOpen(false);

  if (isLoading) {
    return <Spinner />;
  }

  const GridView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFabrics?.map((fabric, index) => (
          <div
            key={fabric._id}
            className="group relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)`,
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Tooltip content={`Fabric: ${fabric.name}`}>
                    <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors duration-300 truncate">
                      {fabric.name}
                    </h3>
                  </Tooltip>
                  <Tooltip content={`Code: ${fabric.code}`}>
                    <p className="text-sm text-gray-500 font-mono">{fabric.code}</p>
                  </Tooltip>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  <Tooltip content="Edit fabric">
                    <button
                      onClick={() => openEditModal(fabric)}
                      className="p-2 bg-blue-500/90 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    >
                      <FiEdit size={14} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete fabric">
                    <button
                      onClick={() => openDeleteConfirm(fabric._id)}
                      className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </Tooltip>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Tooltip content={`Color: ${fabric.color || 'No color specified'}`}>
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-help"
                      style={{ backgroundColor: fabric.color || '#gray' }}
                    ></div>
                  </Tooltip>
                  <span className="text-sm text-gray-600 capitalize">{fabric.color}</span>
                </div>
                
                <div className="bg-gray-50/80 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Supplier</p>
                  <Tooltip content={fabric.supplier?.name ? `Supplier: ${fabric.supplier.name}` : "No supplier assigned"}>
                    <p className="text-sm text-gray-800 font-medium truncate">{fabric.supplier?.name || "N/A"}</p>
                  </Tooltip>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Composition</p>
                    <Tooltip content="Fabric composition details">
                      <FiInfo size={12} className="text-gray-400" />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                    {fabric.compositionString?.length > 0 ? fabric.compositionString : "No Composition"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Pagination */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing <strong>{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
            <strong>{Math.min(pagination.page * pagination.limit, filteredFabrics.length)}</strong> of{' '}
            <strong>{filteredFabrics.length}</strong> fabrics
          </div>
          <PaginationControls 
            pagination={pagination} 
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 p-6">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .search-glow:focus {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 0 20px rgba(99, 102, 241, 0.2);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Fabric Collection
              </h1>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-60"></div>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20 shadow-lg">
              <span className="text-sm font-semibold text-gray-600">
                {filteredFabrics.length} items
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Analytics Toggle */}
            <Tooltip content={showAnalytics ? "Hide analytics" : "Show analytics dashboard"}>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`group p-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                  showAnalytics 
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white" 
                    : "bg-white/80 backdrop-blur-lg text-gray-600 hover:bg-gray-100/80 border border-white/20"
                }`}
              >
                {/* <FiBarChart3 size={18} /> */}
              </button>
            </Tooltip>

            {/* View Mode Toggle */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-1 border border-white/20 shadow-lg">
              <Tooltip content="Table view">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "table"
                      ? "bg-indigo-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100/80"
                  }`}
                >
                  <FiList size={18} />
                </button>
              </Tooltip>
              <Tooltip content="Grid view">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-indigo-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100/80"
                  }`}
                >
                  <FiGrid size={18} />
                </button>
              </Tooltip>
            </div>

            {/* Export Button */}
            <Tooltip content="Export to Excel">
              <button
                onClick={exportToExcel}
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <FiDownload className="group-hover:animate-bounce" size={18} />
                Export Excel
              </button>
            </Tooltip>

            {/* Create Button */}
            <Tooltip content="Add new fabric">
              <button
                onClick={openModal}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <FiPlus className="group-hover:rotate-90 transition-transform duration-300" size={18} />
                New Fabric
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Business Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-300"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalyticsCard
                title="Total Fabrics"
                value={analytics.totalFabrics}
                icon={FiPackage}
                change={analytics.recentlyAdded > 0 ? Math.round((analytics.recentlyAdded / analytics.totalFabrics) * 100) : 0}
                color="from-blue-500 to-indigo-600"
                subtitle={`${analytics.recentlyAdded} added this week`}
              />
              <AnalyticsCard
                title="Active Suppliers"
                value={analytics.totalSuppliers}
                icon={FiUsers}
                color="from-emerald-500 to-teal-600"
                subtitle="Supplier partners"
              />
              <AnalyticsCard
                title="Avg Compositions"
                value={analytics.averageCompositions}
                icon={FiPieChart}
                color="from-purple-500 to-pink-600"
                subtitle="Per fabric"
              />
              <AnalyticsCard
                title="Color Varieties"
                value={Object.keys(analytics.topColors).length}
                icon={FiTrendingUp}
                color="from-orange-500 to-red-600"
                subtitle="Unique colors"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Colors */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiPieChart className="text-indigo-600" />
                  Popular Colors
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.topColors)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([color, count]) => (
                      <div key={color} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color === 'Unknown' ? '#gray' : color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">{color}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold">
                            {count}
                          </div>
                          <div className="w-16 h-2 bg-indigo-200 rounded-full">
                            <div 
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(count / fabrics.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              {/* Supplier Distribution */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiUsers className="text-indigo-600" />
                  Supplier Distribution
                </h3>
                <div className="space-y-3">
                  {analytics.supplierDistribution.map((supplier) => (
                    <div key={supplier.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{supplier.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold">
                          {supplier.count}
                        </div>
                        <div className="w-16 h-2 bg-indigo-200 rounded-full">
                          <div 
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(supplier.count / fabrics.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recently Added Fabrics */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-indigo-600" />
                  Recently Added Fabrics
                </h3>
                <div className="space-y-3">
                  {fabrics
                    .filter(fabric => {
                      const createdDate = new Date(fabric.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return createdDate > weekAgo;
                    })
                    .slice(0, 5)
                    .map(fabric => (
                      <div key={fabric._id} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{fabric.name}</span>
                        <span className="text-xs text-gray-500">{new Date(fabric.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                </div>
              </div>
              {/* Fabric Composition Breakdown */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiInfo className="text-indigo-600" />
                  Fabric Composition Breakdown
                </h3>
                <div className="space-y-3">
                  {fabrics.map(fabric => (
                    <div key={fabric._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{fabric.name}</span>
                      <span className="text-xs text-gray-500">
                        {fabric.fabricCompositions?.length > 0 
                          ? fabric.fabricCompositions.map(fc => `${fc.value}% ${fc.compositionItem?.name || 'Unknown'}`).join(', ')
                          : 'No Composition'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Main Content */}
      <div className="mt-8">
        {viewMode === "grid" ? (
          <GridView />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Fabrics List</h2>
                <span className="text-sm text-gray-600">
                  {filteredFabrics.length} items
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search fabrics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-glow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 w-full max-w-xs"
                />
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 w-full max-w-xs"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="min-w-full bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <th
                    onClick={() => handleSort("name")}
                    className={`px-6 py-3 cursor-pointer ${
                      sort.field === "name" ? (sort.order === "asc" ? "bg-indigo-600" : "bg-indigo-700") : ""
                    }`}
                  >
                    Fabric Name
                    {sort.field === "name" && (
                      <span className={`ml-1 ${sort.order === "asc" ? "text-xs" : "text-xs rotate-180"}`}>
                        ▲
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("code")}
                    className={`px-6 py-3 cursor-pointer ${
                      sort.field === "code" ? (sort.order === "asc" ? "bg-indigo-600" : "bg-indigo-700") : ""
                    }`}
                  >
                    Code
                    {sort.field === "code" && (
                      <span className={`ml-1 ${sort.order === "asc" ? "text-xs" : "text-xs rotate-180"}`}>
                        ▲
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("color")}
                    className={`px-6 py-3 cursor-pointer ${
                      sort.field === "color" ? (sort.order === "asc" ? "bg-indigo-600" : "bg-indigo-700") : ""
                    }`}
                  >
                    Color
                    {sort.field === "color" && (
                      <span className={`ml-1 ${sort.order === "asc" ? "text-xs" : "text-xs rotate-180"}`}>
                        ▲
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("supplier")}
                    className={`px-6 py-3 cursor-pointer ${
                      sort.field === "supplier" ? (sort.order === "asc" ? "bg-indigo-600" : "bg-indigo-700") : ""
                    }`}
                  >
                    Supplier
                    {sort.field === "supplier" && (
                      <span className={`ml-1 ${sort.order === "asc" ? "text-xs" : "text-xs rotate-180"}`}>
                        ▲
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("composition")}
                    className={`px-6 py-3 cursor-pointer ${
                      sort.field === "composition" ? (sort.order === "asc" ? "bg-indigo-600" : "bg-indigo-700") : ""
                    }`}
                  >
                    Composition
                    {sort.field === "composition" && (
                      <span className={`ml-1 ${sort.order === "asc" ? "text-xs" : "text-xs rotate-180"}`}>
                        ▲
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFabrics.map((fabric) => (
                  <tr key={fabric._id} className="hover:bg-gray-50 transition-colors duration-300">
                    <td className="px-6 py-4">{fabric.name}</td>
                    <td className="px-6 py-4">{fabric.code}</td>
                    <td className="px-6 py-4">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: fabric.color || '#gray' }}
                      ></div>
                    </td>
                    <td className="px-6 py-4">{fabric.supplier?.name || "N/A"}</td>
                    <td className="px-6 py-4">
                      {fabric.fabricCompositions?.length > 0 
                        ? fabric.fabricCompositions.map(fc => `${fc.value}% ${fc.compositionItem?.name || 'Unknown'}`).join(', ')
                        : "No Composition"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Tooltip content="Edit fabric">
                          <button
                            onClick={() => openEditModal(fabric)}
                            className="p-2 bg-blue-500/90 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                          >
                            <FiEdit size={14} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Delete fabric">
                          <button
                            onClick={() => openDeleteConfirm(fabric._id)}
                            className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Table Pagination */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <strong>{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
                  <strong>{Math.min(pagination.page * pagination.limit, filteredFabrics.length)}</strong> of{' '}
                  <strong>{filteredFabrics.length}</strong> fabrics
                </div>
                <PaginationControls
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Create/Edit Fabric Modal */}
      {/* <CreateEditFabricModal
        isOpen={isModalOpen}
        onClose={closeModal}
        fabric={editFabric}
        onUpdate={updateFabricList}
        suppliers={suppliers}
      /> */}
      {/* Delete Confirmation Modal */}
      {/* <DeleteConfirmationModal
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirmDelete}
        itemName="fabric"
        itemId={deleteId}
      /> */}
    </div>
  );
}
export default FabricList;