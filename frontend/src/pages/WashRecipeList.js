import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWashRecipes, deleteWashRecipe } from "../services/washService";
import { toast } from "react-toastify";
import { useStateContext } from "../contexts/ContextProvider";
import { darkenColor } from "../utils/darkenColor";
import { MdEdit, MdDelete, MdContentPasteSearch } from "react-icons/md";
import ConfirmationModal from "../components/ConfirmationModal";
import Spinner from "../components/Spinner";

const WashRecipeList = () => {
  const { currentColor, washTypeColors } = useStateContext();
  const [washRecipes, setWashRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const hoverColor = darkenColor(currentColor, -15);

  const [isLoading, setIsLoading] = useState(true);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
  const [deleteId, setDeleteId] = useState(null); // ID of defect to be deleted

  const loadRecipes = async () => {
    try {
      const response = await fetchWashRecipes();
      setWashRecipes(response);
    } catch (error) {
      //toast.error("Failed to fetch wash recipes.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
    setIsLoading(false);
  }, []);

   // Open Confirmation Modal for Deletion
    const openDeleteConfirm = (id) => {
      setDeleteId(id);
      setIsConfirmOpen(true);
    };
  
    // Confirm Order Deletion
    const handleConfirmDelete = async () => {
      try {
        await deleteWashRecipe(deleteId);
        //toast.success("Recipe deleted successfully.");
        loadRecipes(); // Refresh list
      } catch (error) {
        toast.error("Failed to delete recipe.");
      } finally {
        setIsConfirmOpen(false); // Close confirmation modal
      }
    };

  const filteredRecipes = washRecipes.filter((recipe) =>
    recipe.orderId?.orderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.washCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(filteredRecipes);

  const closeConfirm = () => setIsConfirmOpen(false);
  
    if (isLoading) {
      return <Spinner />;
    }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Wash Recipes</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by Order No. or Wash Code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
          <Link
            to="/wash-recipes"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            style={{ backgroundColor: hoverColor }}
          >
            + New Wash Recipe
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm table-auto">
          <thead className="bg-indigo-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Wash Code</th>
              <th className="p-3 text-left">Order No</th>
              <th className="p-3 text-left">Style</th>
              <th className="p-3 text-left">Fabric Art</th>
              <th className="p-3 text-left">Wash Type</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <tr key={recipe._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{recipe.washCode || "N/A"}</td>
                  <td className="p-3">{recipe.orderId?.orderNo || "N/A"}</td>
                  <td className="p-3">{recipe.orderId?.style?.name || "N/A"}</td>
                  <td className="p-3">{recipe.orderId?.articleNo || "N/A"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${washTypeColors[recipe.washType] || "bg-gray-100"}`}>
                      {recipe.washType || "N/A"}
                    </span>
                  </td>
                  <td className="p-3">{new Date(recipe.date).toLocaleDateString()}</td>
                  <td className="p-3 flex items-center gap-2">
                    <button onClick={() => navigate(`/wash-recipes/${recipe._id}`)} className="text-blue-600 hover:text-blue-800">
                      <MdContentPasteSearch className="w-5 h-5" />
                    </button>
                    <button 
                    //onClick={() => navigate(`/wash-recipes/edit/${recipe._id}`)} 
                    className="text-green-600 hover:text-green-800">
                      <MdEdit className="w-5 h-5" />
                    </button>
                    <button onClick={() => openDeleteConfirm(recipe._id)} className="text-red-600 hover:text-red-800">
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="7">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this order?"
          onConfirm={handleConfirmDelete}
          onCancel={closeConfirm}
        />
      )}
    </div>
  );
};

export default WashRecipeList;
