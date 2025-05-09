import React, { useState, useEffect } from "react";
import { fetchFabrics, deleteFabric, fetchFabricSuppliers } from "../services/masterDataService";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Spinner from "../components/Spinner";
import FabricModal from "../components/FabricModal";

const FabricList = () => { //{ openEditModal }
  const [editFabric, setEditFabric] = useState(null);
  const [fabrics, setFabrics] = useState([]);
  const [filteredFabrics, setFilteredFabrics] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
  const [deleteId, setDeleteId] = useState(null); // ID of Fabric to be deleted

  // State for the modal
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
            //supplier: filteredFabrics,
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
  }, [pagination.page, pagination.limit, sort, search,]);


    // Handle Sorting
    const handleSort = (field) => {
      setSort((prev) => ({
        field,
        //order: prev.order === "asc" ? "desc" : "asc",
        order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
      }));
    };

      // Handle Pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Filter fabrics by supplier
  useEffect(() => {
    if (selectedSupplier) {
      setFilteredFabrics(fabrics.filter((fabric) => fabric.supplier?._id === selectedSupplier));
    } else {
      setFilteredFabrics(fabrics);
    }
  }, [selectedSupplier, fabrics]);

  // Function to update the fabric in the list after editing
    const updateFabricList = async (updatedFabric) => {
      if (!updatedFabric || !updatedFabric._id) {
        console.error("Invalid updated fabric:", updatedFabric);
        toast.error("Invalid updated fabric");
        return;
      }
      setFabrics((prevFabrics) => {
        // Check if the fabric already exists in the list
        const fabricExists = prevFabrics.some((fabric) => fabric._id === updatedFabric._id);
    
        if (fabricExists) {
          // Update the existing fabric
          return prevFabrics.map((fabric) =>
            fabric._id === updatedFabric._id ? updatedFabric : fabric
          );
        } else {
          // Add the new fabric to the list
          return [...prevFabrics, updatedFabric];
        }
      });
    };

    // Open Confirmation Modal for Deletion
    const openDeleteConfirm = (id) => {
      setDeleteId(id);
      setIsConfirmOpen(true);
    };
  
    // Confirm Order Deletion
    const handleConfirmDelete = async () => {
      try {
        await deleteFabric(deleteId);
        setFabrics(fabrics.filter((fabric) => fabric._id !== deleteId));
        toast.success("Fabric deleted successfully");
        //loadFabrics();
      } catch (error) {
        alert("Error deleting fabric");
      } finally {
        setIsConfirmOpen(false); // Close confirmation modal
      }
    };

     // Open Edit Modal
  const openEditModal = (fabric) => {
    setEditFabric(fabric);
    setIsModalOpen(true);
  };
     // Close Modal
  const closeModal = () => {
    setEditFabric(null); // Clear edit data
    setIsModalOpen(false);
  };

    const openModal = () => setIsModalOpen(true);
    const closeConfirm = () => setIsConfirmOpen(false);

    if (isLoading) {
        return <Spinner />;
      }
    
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* 🔹 Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Fabric List</h1>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search Fabrics..."
          //value={search}
          defaultValue={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
        />
        <select
          className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-500"
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
        {/* Create Button */}
        <button
          onClick={openModal}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-200 flex-shrink-0"
        >
          Create New Fabric
        </button>
      </div>

      {/* 🔹 Fabric Table */}
      <Card className="p-4 shadow-lg rounded-lg bg-white border border-gray-300">
        <table className="table-auto w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th  onClick={() => handleSort("name")} className="border cursor-pointer p-3 text-left">Fabric Name {" "}
              {sort.field === "name" && (sort.order === "asc" ? "↑" : "↓")}</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Color</th>
              <th className="p-3 text-left">Supplier</th>
              <th className="p-3 text-left">Composition</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFabrics?.map((fabric) => (
              <tr key={fabric._id} className="border-b hover:bg-gray-100">
                <td className="p-3">{fabric.name}</td>
                <td className="p-3">{fabric.code}</td>
                <td className="p-3">{fabric.color}</td>
                <td className="p-3">{fabric.supplier?.name || "N/A"}</td>
                <td className="p-3">
                  {/* {fabric.fabricCompositions?.length > 0
                    ? fabric.fabricCompositions.map((comp) => `${comp.compositionItem?.abbrPrefix || ""}${comp.value}`).join(", ")
                    : "No Composition"} */}
                    {fabric.compositionString?.length > 0
                    ? fabric.compositionString
                    : "No Composition"}
                </td>
                <td className="p-3 flex justify-center gap-2">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => openEditModal(fabric)}>
                    <FiEdit />
                  </Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" 
                  onClick={() => openDeleteConfirm(fabric._id)}>
                    <FiTrash2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls */}
      <div className="mt-4 flex justify-between">
        <button
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
          // className="p-2 bg-blue-500 text-white rounded"
          className={`px-4 py-2 ${
            pagination.page === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
          }`}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
          // className="p-2 bg-blue-500 text-white rounded"
          className={`px-4 py-2 ${
            pagination.page === pagination.totalPages
              ? "bg-gray-300"
              : "bg-blue-500 text-white"
          }`}
        >
          Next
        </button>
      </div>
      </Card>
      {/* Create / Update Order Modal */}
      {isModalOpen && (
        <FabricModal
          closeModal={closeModal}
        //   onOrderCreated={handleOrderCreated}
          editFabric={editFabric}
          refreshFabricList = {updateFabricList}
        //   updateOrderInList={updateOrderInList}
        />
      )}
      {/* �� Confirmation Modal */}
      <div className={`fixed bottom-0 right-0 z-50 ${isConfirmOpen? "block" : "hidden"}`}>
        <div className="p-4 bg-white shadow-lg rounded-lg max-w-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Delete Fabric</h2>
          <p>Are you sure you want to delete this fabric?</p>
          <div className="flex justify-end gap-4">
            <button className="bg-gray-300 hover:bg-gray-400 text-white px-4 py-2 rounded" onClick={closeConfirm}>
              Cancel
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onClick={handleConfirmDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
      </div>
  );
};

export default FabricList;
