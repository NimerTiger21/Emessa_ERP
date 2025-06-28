import React, { useEffect, useState } from "react";
import { fetchStyles, deleteStyle } from "../services/masterDataService";
import { toast } from "react-toastify";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiTag,
  FiUser,
  FiGrid,
} from "react-icons/fi";

import StyleModal from "./../components/StyleModal";
import ConfirmationModal from "../components/ConfirmationModal";
import Spinner from "../components/Spinner";

// Mock data for demonstration
const mockStyles = [
  {
    _id: "1",
    name: "Summer Breeze Collection",
    styleNo: ["SB001", "SB002", "SB003"],
    brand: { name: "Zara", customer: { name: "Fashion Forward Inc." } },
  },
  {
    _id: "2",
    name: "Urban Chic Line",
    styleNo: ["UC101", "UC102"],
    brand: { name: "H&M", customer: { name: "Trendy Styles Ltd." } },
  },
  {
    _id: "3",
    name: "Classic Elegance",
    styleNo: ["CE500"],
    brand: { name: "Gucci", customer: { name: "Luxury Brands Co." } },
  },
  {
    _id: "4",
    name: "Streetwear Essentials",
    styleNo: ["SW200", "SW201", "SW202", "SW203", "SW204"],
    brand: { name: "Nike", customer: { name: "Athletic Wear Group" } },
  },
  {
    _id: "5",
    name: "Minimalist Modern",
    styleNo: ["MM300", "MM301"],
    brand: { name: "Uniqlo", customer: { name: "Simple Fashion Co." } },
  },
];

const StyleList = () => {
  const [styles, setStyles] = useState(mockStyles);
  const [search, setSearch] = useState("");
  const [filteredStyles, setFilteredStyles] = useState(mockStyles);
  const [showModal, setShowModal] = useState(false);
  const [editStyle, setEditStyle] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  // Fetch styles on mount
  useEffect(() => {
    loadStyles();
    setIsLoading(false);
  }, []);

  const loadStyles = async () => {
    try {
      const data = await fetchStyles();
      setStyles(data);
      setFilteredStyles(data);
    } catch (error) {
      toast.error("Failed to load styles.");
      setIsLoading(false);
    }
  };

  // Filter styles on search
  useEffect(() => {
    const filtered = styles.filter(
      (style) =>
        style.name.toLowerCase().includes(search.toLowerCase()) ||
        style.styleNo.some((no) =>
          no.toLowerCase().includes(search.toLowerCase())
        ) ||
        style.brand?.name.toLowerCase().includes(search.toLowerCase()) ||
        style.brand?.customer?.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStyles(filtered);
  }, [search, styles]);

  const openCreateModal = () => {
    setEditStyle(null);
    setShowModal(true);
  };

  const openEditModal = (style) => {
    setEditStyle(style);
    setShowModal(true);
  };

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  // Confirm Order Deletion
  const handleConfirmDelete = async () => {
    try {
      await deleteStyle(deleteId);
      //toast.success("Style deleted successfully.");
      loadStyles();
    } catch (error) {
      toast.error("Error deleting style.");
    } finally {
      setIsConfirmOpen(false); // Close confirmation modal
    }
  };

  const closeConfirm = () => setIsConfirmOpen(false);

  // Component for rendering style numbers with modern badges
  const StyleNumberBadges = ({ styleNumbers, maxVisible = 3 }) => {
    if (!styleNumbers || styleNumbers.length === 0) {
      return <span className="text-gray-400 italic">No style numbers</span>;
    }

    const visibleNumbers = styleNumbers.slice(0, maxVisible);
    const remainingCount = styleNumbers.length - maxVisible;

    return (
      <div className="flex flex-wrap gap-1">
        {visibleNumbers.map((styleNo, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 hover:from-purple-200 hover:to-pink-200 transition-all duration-200"
          >
            <FiTag className="w-3 h-3 mr-1" />
            {styleNo}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  };

  // Grid view component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredStyles.map((style) => (
        <div
          key={style._id}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2"></div>
          <div className="p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
              {style.name}
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FiUser className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-medium">
                  {style.brand?.name || "No Brand"}
                </span>
              </div>

              <div className="text-sm text-gray-500">
                Customer: {style.brand?.customer?.name || "N/A"}
              </div>

              <div className="pt-2">
                <div className="text-xs text-gray-500 mb-2">Style Numbers:</div>
                <StyleNumberBadges
                  styleNumbers={style.styleNo}
                  maxVisible={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => openEditModal(style)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDeleteConfirm(style._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table view component
  const TableView = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Style Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Style Numbers
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStyles.map((style, index) => (
              <tr
                key={style._id}
                className={`hover:bg-gray-50 transition-colors duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{style.name}</div>
                </td>
                <td className="px-6 py-4">
                  <StyleNumberBadges styleNumbers={style.styleNo} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-gray-900 font-medium">
                      {style.brand?.name || "-"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {style.brand?.customer?.name || "-"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => openEditModal(style)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(style._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStyles.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="text-gray-400">
                    <FiSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No styles found</p>
                    <p className="text-sm">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Fashion Styles
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your fashion style collection
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "table"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiPlus className="w-4 h-4" />
              Add Style
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search styles, style numbers, brands, or customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 bg-white shadow-sm"
          />
        </div>

        {/* Content */}
        {viewMode === "table" ? <TableView /> : <GridView />}

        {/* Confirmation Modal */}
        {/* {isConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this style? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeConfirm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Style Modal Placeholder */}
        {/* {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {editStyle ? "Edit Style" : "Add New Style"}
              </h3>
              <p className="text-gray-600 mb-6">
                Modal content would go here...
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>
      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this style?"
          onConfirm={handleConfirmDelete}
          onCancel={closeConfirm}
        />
      )}

      {showModal && (
        <StyleModal
          closeModal={() => setShowModal(false)}
          editStyle={editStyle}
          refreshStyleList={loadStyles}
          isOpen={openCreateModal}
        />
      )}
    </div>
  );
};

export default StyleList;
