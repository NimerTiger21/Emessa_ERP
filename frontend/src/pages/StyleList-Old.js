import React, { useEffect, useState } from "react";
import { fetchStyles, deleteStyle } from "../services/masterDataService";
import { Button } from "../components/ui/button";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import StyleModal from './../components/StyleModal';
import ConfirmationModal from "../components/ConfirmationModal";
import Spinner from "../components/Spinner";

const StyleList = () => {
  const [styles, setStyles] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredStyles, setFilteredStyles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editStyle, setEditStyle] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
  const [deleteId, setDeleteId] = useState(null); // ID of defect to be deleted

  const [isLoading, setIsLoading] = useState(true);

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
    const filtered = styles.filter(style =>
      style.name.toLowerCase().includes(search.toLowerCase())
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

  // Open Confirmation Modal for Deletion
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
          }
          finally {
            setIsConfirmOpen(false); // Close confirmation modal
          }
    };

    const closeConfirm = () => setIsConfirmOpen(false);
    
      if (isLoading) {
        return <Spinner />;
      }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Style List</h1>
        <Button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <FiPlus /> Add Style
        </Button>
      </div>

      <input
        type="text"
        placeholder="Search styles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Style Name</th>
              <th className="p-2 border text-left">Style No</th>
              <th className="p-2 border text-left">Brand</th>
              <th className="p-2 border text-left">Customer</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStyles.map((style) => (
              <tr key={style._id}>
                <td className="p-2 border">{style.name}</td>
                <td className="p-2 border">{style.styleNo || "-"}</td>
                <td className="p-2 border">{style.brand?.name || "-"}</td>
                <td className="p-2 border">{style.brand?.customer?.name || "-"}</td>
                <td className="p-2 border text-center">
                  <Button onClick={() => openEditModal(style)} className="mr-2 px-3 py-1 text-indigo-600 hover:underline text-sm">
                    <FiEdit />
                  </Button>
                  <Button onClick={() => openDeleteConfirm(style._id)} className="px-3 py-1 bg-red-500 text-red-600 hover:bg-red-600 text-sm">
                    <FiTrash2 />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredStyles.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">No styles found.</td>
              </tr>
            )}
          </tbody>
        </table>
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
