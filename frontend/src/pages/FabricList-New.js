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
import { FiEdit, FiTrash2, FiDownload, FiPlus, FiSearch, FiFilter, FiGrid, FiList } from "react-icons/fi";
import Spinner from "../components/Spinner";
import FabricModal from "../components/FabricModal";

const FabricList = () => {
  const [editFabric, setEditFabric] = useState(null);
  const [fabrics, setFabrics] = useState([]);
  const [filteredFabrics, setFilteredFabrics] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sort, setSort] = useState({ field: "name", order: "desc" });
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 7,
    totalPages: 1,
  });

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
              } aabbrPrefix: ${fc.compositionItem.abbrPrefix}`
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
                <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors duration-300">
                  {fabric.name}
                </h3>
                <p className="text-sm text-gray-500 font-mono">{fabric.code}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <button
                  onClick={() => openEditModal(fabric)}
                  className="p-2 bg-blue-500/90 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <FiEdit size={14} />
                </button>
                <button
                  onClick={() => openDeleteConfirm(fabric._id)}
                  className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: fabric.color || '#gray' }}
                  title={fabric.color}
                ></div>
                <span className="text-sm text-gray-600 capitalize">{fabric.color}</span>
              </div>
              
              <div className="bg-gray-50/80 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Supplier</p>
                <p className="text-sm text-gray-800 font-medium">{fabric.supplier?.name || "N/A"}</p>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Composition</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {fabric.compositionString?.length > 0 ? fabric.compositionString : "No Composition"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
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
            {/* View Mode Toggle */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-1 border border-white/20 shadow-lg">
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
            </div>

            {/* Export Button */}
            <button
              onClick={exportToExcel}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <FiDownload className="group-hover:animate-bounce" size={18} />
              Export Excel
            </button>

            {/* Create Button */}
            <button
              onClick={openModal}
              className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <FiPlus className="group-hover:rotate-90 transition-transform duration-300" size={18} />
              New Fabric
            </button>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="mt-6 bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search fabrics by name, code, or color..."
                defaultValue={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-glow w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-0 transition-all duration-300 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Supplier Filter */}
            <div className="relative min-w-[200px]">
              <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
              <select
                className="w-full pl-12 pr-8 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-0 transition-all duration-300 text-gray-700 appearance-none cursor-pointer"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
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

          {/* Filter Message */}
          {selectedSupplier && (
            <div className="mt-4 bg-indigo-50/80 backdrop-blur-sm border border-indigo-200/50 rounded-lg p-3">
              <p className="text-sm text-indigo-700">
                Showing results for supplier <strong>{suppliers.find(s => s._id === selectedSupplier)?.name}</strong> on page <strong>{pagination.page}</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "grid" ? (
        <GridView />
      ) : (
        <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50/90 to-gray-100/90 backdrop-blur-sm">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      Fabric Name
                      <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {sort.field === "name" && (sort.order === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Code</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Color</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Supplier</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Composition</th>
                  <th className="px-6 py-4 text-center text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFabrics?.map((fabric, index) => (
                  <tr
                    key={fabric._id}
                    className="group border-b border-gray-100/50 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-300"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                        {fabric.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-gray-100/80 px-2 py-1 rounded-md text-gray-600">
                        {fabric.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: fabric.color || '#gray' }}
                        ></div>
                        <span className="text-gray-700 capitalize">{fabric.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{fabric.supplier?.name || "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <span className="text-sm text-gray-600 line-clamp-2">
                          {fabric.compositionString?.length > 0 ? fabric.compositionString : "No Composition"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={() => openEditModal(fabric)}
                          className="p-2 bg-blue-500/90 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(fabric._id)}
                          className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-t border-gray-100/50">
            <div className="flex items-center justify-between">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  pagination.page === 1
                    ? "bg-gray-200/80 text-gray-400 cursor-not-allowed"
                    : "bg-white/80 text-indigo-600 hover:bg-indigo-50 hover:scale-105 shadow-md hover:shadow-lg"
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                </span>
              </div>
              
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  pagination.page === pagination.totalPages
                    ? "bg-gray-200/80 text-gray-400 cursor-not-allowed"
                    : "bg-white/80 text-indigo-600 hover:bg-indigo-50 hover:scale-105 shadow-md hover:shadow-lg"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <FabricModal
          closeModal={closeModal}
          editFabric={editFabric}
          refreshFabricList={updateFabricList}
        />
      )}

      {/* Enhanced Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20 transform animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiTrash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Fabric</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this fabric? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeConfirm}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricList;