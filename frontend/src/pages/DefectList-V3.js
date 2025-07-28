import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  X, 
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

// Mock data for demonstration
const mockDefects = [
  {
    _id: "1",
    orderId: { orderNo: "ORD-2024-001" },
    defectName: { name: "Surface Scratch" },
    defectType: { name: "Visual" },
    defectProcess: { name: "Painting" },
    severity: "High",
    detectedDate: "2024-01-15",
    status: "Open",
    defectCount: 3,
    productionLine: "Line A"
  },
  {
    _id: "2",
    orderId: { orderNo: "ORD-2024-002" },
    defectName: { name: "Dimension Error" },
    defectType: { name: "Mechanical" },
    defectProcess: { name: "Assembly" },
    severity: "Medium",
    detectedDate: "2024-01-14",
    status: "In Progress",
    defectCount: 1,
    productionLine: "Line B"
  },
  {
    _id: "3",
    orderId: { orderNo: "ORD-2024-003" },
    defectName: { name: "Color Mismatch" },
    defectType: { name: "Visual" },
    defectProcess: { name: "Quality Check" },
    severity: "Low",
    detectedDate: "2024-01-13",
    status: "Resolved",
    defectCount: 2,
    productionLine: "Line C"
  }
];

const PRODUCTION_LINES = ["Line A", "Line B", "Line C", "Line D"];

const DefectList = () => {
  const navigate = useNavigate();
  const currentColor = "#3B82F6";

  // States
  const [defects, setDefects] = useState(mockDefects);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editDefect, setEditDefect] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort states
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [sort, setSort] = useState({ field: "detectedDate", order: "desc" });
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [defectTypeFilter, setDefectTypeFilter] = useState("");
  const [lineFilter, setLineFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  // Calculate statistics
  const totalDefects = defects.length;
  const openDefects = defects.filter(d => d.status === "Open").length;
  const resolvedDefects = defects.filter(d => d.status === "Resolved").length;
  const highSeverityDefects = defects.filter(d => d.severity === "High").length;
  const resolutionRate = totalDefects > 0 ? ((resolvedDefects / totalDefects) * 100).toFixed(1) : 0;

  // Handle functions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setEditDefect(null);
    setIsModalOpen(false);
  };

  const openEditModal = (defect) => {
    setEditDefect(defect);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDefects(defects.filter((defect) => defect._id !== deleteId));
    setIsConfirmOpen(false);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const viewDefectDetails = (defect) => {
    navigate(`/defects/${defect._id}`);
  };

  const clearAllFilters = () => {
    setSearch("");
    setSeverityFilter("");
    setDefectTypeFilter("");
    setLineFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = search || severityFilter || defectTypeFilter || lineFilter || dateFromFilter || dateToFilter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with glassmorphism effect */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Defect Management
              </h1>
              <p className="text-slate-600 mt-1">Monitor and manage production defects efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group relative px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80"
              >
                <Filter className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
              </button>
              <button
                onClick={openModal}
                className="group relative px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 inline-block mr-2" />
                Create Defect
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Defects</p>
                <p className="text-3xl font-bold text-slate-900">{totalDefects}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+12% from last week</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Open Defects</p>
                <p className="text-3xl font-bold text-red-600">{openDefects}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600 font-medium">Needs attention</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{resolvedDefects}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+8% efficiency</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Resolution Rate</p>
                <p className="text-3xl font-bold text-blue-600">{resolutionRate}%</p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600 font-medium">-2% from target</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search defects by order, type, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              )}
            </div>

            {/* Collapsible Filters */}
            <div className={`transition-all duration-300 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/20">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full p-3 bg-white/80 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    <option value="">All Severities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Production Line</label>
                  <select
                    value={lineFilter}
                    onChange={(e) => setLineFilter(e.target.value)}
                    className="w-full p-3 bg-white/80 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    <option value="">All Lines</option>
                    {PRODUCTION_LINES.map((line) => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date From</label>
                  <input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="w-full p-3 bg-white/80 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date To</label>
                  <input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    min={dateFromFilter}
                    className="w-full p-3 bg-white/80 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20">
                <span className="text-sm text-slate-600">Active filters:</span>
                {search && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: {search}
                  </span>
                )}
                {severityFilter && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Severity: {severityFilter}
                  </span>
                )}
                {lineFilter && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Line: {lineFilter}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modern Table */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-slate-50/80 backdrop-blur-sm">
                <tr>
                  <th
                    onClick={() => handleSort("orderId.orderNo")}
                    className="cursor-pointer px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-100/50 transition-all duration-300"
                  >
                    Order No {sort.field === "orderId.orderNo" && (sort.order === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("defectName.name")}
                    className="cursor-pointer px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-100/50 transition-all duration-300"
                  >
                    Defect Name {sort.field === "defectName.name" && (sort.order === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("defectType.name")}
                    className="cursor-pointer px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-100/50 transition-all duration-300"
                  >
                    Type {sort.field === "defectType.name" && (sort.order === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("severity")}
                    className="cursor-pointer px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-100/50 transition-all duration-300"
                  >
                    Severity {sort.field === "severity" && (sort.order === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="cursor-pointer px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-100/50 transition-all duration-300"
                  >
                    Status {sort.field === "status" && (sort.order === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("detectedDate")}
                    className="cursor-pointer px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-100/50 transition-all duration-300"
                  >
                    Date {sort.field === "detectedDate" && (sort.order === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("productionLine")}
                    className="cursor-pointer px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-100/50 transition-all duration-300"
                  >
                    Line {sort.field === "productionLine" && (sort.order === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/40 backdrop-blur-sm divide-y divide-white/20">
                {defects.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-lg font-medium">No defects found</p>
                        <p className="text-sm">Try adjusting your filters or create a new defect</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  defects.map((defect, index) => (
                    <tr
                      key={defect._id}
                      className="hover:bg-white/60 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{defect.orderId?.orderNo || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{defect.defectName?.name || "N/A"}</div>
                        <div className="text-xs text-slate-500">{defect.defectProcess?.name || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {defect.defectType?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            defect.severity === "High"
                              ? "bg-red-100 text-red-800"
                              : defect.severity === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {defect.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            defect.status === "Resolved"
                              ? "bg-green-100 text-green-800"
                              : defect.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {defect.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {defect.detectedDate ? new Date(defect.detectedDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {defect.productionLine || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        <Menu as="div" className="relative inline-block text-left">
                          <div>
                            <Menu.Button className="inline-flex w-full justify-center rounded-xl bg-white/80 backdrop-blur-sm px-3 py-2 text-sm font-medium text-slate-700 shadow-sm border border-white/20 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300">
                              <MoreVertical className="w-5 h-5" />
                            </Menu.Button>
                          </div>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border border-white/20 focus:outline-none">
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => viewDefectDetails(defect)}
                                      className={`${
                                        active ? "bg-blue-50 text-blue-900" : "text-slate-700"
                                      } group flex w-full items-center px-4 py-2 text-sm transition-all duration-300`}
                                    >
                                      <Eye className="mr-3 h-4 w-4" />
                                      View Details
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => openEditModal(defect)}
                                      className={`${
                                        active ? "bg-blue-50 text-blue-900" : "text-slate-700"
                                      } group flex w-full items-center px-4 py-2 text-sm transition-all duration-300`}
                                    >
                                      <Edit className="mr-3 h-4 w-4" />
                                      Edit
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => openDeleteConfirm(defect._id)}
                                      className={`${
                                        active ? "bg-red-50 text-red-900" : "text-slate-700"
                                      } group flex w-full items-center px-4 py-2 text-sm transition-all duration-300`}
                                    >
                                      <Trash2 className="mr-3 h-4 w-4 text-red-500" />
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Pagination */}
        {defects.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">{pagination.page}</span> of{" "}
                <span className="font-medium">{pagination.totalPages}</span> pages
              </p>
              <select
                value={pagination.limit}
                onChange={(e) =>
                  setPagination({
                    ...pagination,
                    page: 1,
                    limit: Number(e.target.value),
                  })
                }
                className="border border-white/20 rounded-lg px-3 py-1 text-sm bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
                  pagination.page === 1
                    ? "text-slate-400 bg-slate-100 cursor-not-allowed border-slate-200"
                    : "text-slate-700 bg-white/80 border-white/20 hover:bg-white/90 hover:shadow-md transform hover:scale-105"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
                  pagination.page === pagination.totalPages
                    ? "text-slate-400 bg-slate-100 cursor-not-allowed border-slate-200"
                    : "text-slate-700 bg-white/80 border-white/20 hover:bg-white/90 hover:shadow-md transform hover:scale-105"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {/* Create/Edit Defect Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editDefect ? "Edit Defect" : "Create Defect"}
              </h2>
              {/* Form goes here */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete this defect? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default DefectList;