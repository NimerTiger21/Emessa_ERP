import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import ConfirmationModal from "../components/ConfirmationModal";
import { toast } from "react-toastify";
import {
  deleteOrder,
  fetchOrders,
} from "../services/orderService";
import OrderModal from "../components/OrderModal";
import ProgressBar from "../components/ProgressBar";

const OrderList = () => {
  const calculateOverallProgress = () => {
    const totalProgress = orders.reduce((sum, order) => sum + order.stageProgress, 0);
    return Math.round(totalProgress / orders.length);
  };
  const [editOrder, setEditOrder] = useState(null); // Track defect to edit
  const { currentColor } = useStateContext();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [sort, setSort] = useState({ field: "orderDate", order: "desc" });
  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
  const [deleteId, setDeleteId] = useState(null); // ID of defect to be deleted

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleOrderCreated = (newOrder) => {
    setOrders([...orders, newOrder]);
  };

  const openEditModal = (order) => {
    setEditOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditOrder(null); // Clear edit data
    setIsModalOpen(false);
  };

  // Function to update the defect in the list after editing
  const updateOrderInList = (updatedOrder) => {
    setOrders((prevDefects) =>
      prevDefects.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders({
          page: pagination.page,
          limit: pagination.limit,
          sortField: sort.field,
          sortOrder: sort.order,
          search,
          style: styleFilter,
        });
        setOrders(data.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages,
        }));
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    };
    loadOrders();
  }, [pagination.page, pagination.limit, sort, search, styleFilter]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      //order: prev.order === "asc" ? "desc" : "asc",
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteOrder(deleteId);
      setOrders(orders.filter((order) => order._id !== deleteId));
      toast.success("Order deleted successfully");
    } catch (error) {
      alert("Error deleting order");
    } finally {
      setIsConfirmOpen(false); // Close confirmation modal
    }
  };

  const openOrderDetailsModal = (order) => {
    //navigate(`/orders/${order._id}`);
    navigate(`/orders/${order._id}`, { state: { order } }); // Pass the order object
  };

  const openModal = () => setIsModalOpen(true);
  const closeConfirm = () => setIsConfirmOpen(false);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
  {/* HEADER SECTION */}
  <div className="sticky top-0 bg-gray-100 z-20 p-4 shadow-md">
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-800 flex-shrink-0">Orders</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search Orders"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
      />

      {/* Style Filter */}
      <select
        value={styleFilter}
        onChange={(e) => setStyleFilter(e.target.value)}
        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500 flex-shrink-0"
      >
        <option value="">All Styles</option>
        <option value="Cadiz">Cadiz</option>
        <option value="Caren New">Caren New</option>
        <option value="Carola">Carola</option>
        <option value="Chuck">Chuck</option>
        <option value="Lavina Joy">Lavina Joy</option>
        <option value="Lora">Lora</option>
        <option value="Luke">Luke</option>
        <option value="Maine">Maine</option>
        <option value="Mary">Mary</option>
        <option value="Patti straight">Patti straight</option>
        <option value="Shakira">Shakira</option>
        <option value="Thilo">Thilo</option>
      </select>

      {/* Create Order Button */}
      <button
        onClick={openModal}
        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-200 flex-shrink-0"
        style={{ backgroundColor: currentColor }}
      >
        Create New Order
      </button>
    </div>

    {/* Overall Progress */}
    <div className="flex items-center gap-2 flex-shrink-0 p-4 bg-white shadow rounded-lg mt-2">
      <span className="text-sm font-semibold text-gray-600">Overall Progress:</span>
      <ProgressBar progress={calculateOverallProgress()} currentStage="Overall" />
    </div>
  </div>

  {/* ORDER TABLE */}
  <div className="overflow-x-auto mt-4">
    <table className="table-auto w-full bg-white shadow-md rounded border border-gray-300">
      {/* Table Header */}
      <thead className="sticky top-[100px] bg-gray-200 z-10">
        <tr>
          <th
            onClick={() => handleSort("orderNo")}
            className="cursor-pointer border p-2"
          >
            Order No {sort.field === "orderNo" && (sort.order === "asc" ? "↑" : "↓")}
          </th>
          <th
            onClick={() => handleSort("orderQty")}
            className="cursor-pointer border p-2"
          >
            Order Qty {sort.field === "orderQty" && (sort.order === "asc" ? "↑" : "↓")}
          </th>
          <th
            onClick={() => handleSort("deliveredQty")}
            className="cursor-pointer border p-2"
          >
            Delivered Qty {sort.field === "deliveredQty" && (sort.order === "asc" ? "↑" : "↓")}
          </th>
          <th
            onClick={() => handleSort("fabricSupplier")}
            className="cursor-pointer border p-2"
          >
            Fabric Supplier {sort.field === "fabricSupplier" && (sort.order === "asc" ? "↑" : "↓")}
          </th>
          <th
            onClick={() => handleSort("fabricArt")}
            className="cursor-pointer border p-2"
          >
            Fabric Article {sort.field === "fabricArt" && (sort.order === "asc" ? "↑" : "↓")}
          </th>
          <th
            onClick={() => handleSort("style")}
            className="cursor-pointer border p-2"
          >
            Style {sort.field === "style" && (sort.order === "asc" ? "↑" : "↓")}
          </th>
          <th
            onClick={() => handleSort("line")}
            className="cursor-pointer border p-2"
          >
            Line {sort.field === "line" && (sort.order === "asc" ? "↑" : "↓")}
          </th>
          <th
            onClick={() => handleSort("orderDate")}
            className="cursor-pointer border p-2"
          >
            Order Date {sort.field === "orderDate" && (sort.order === "asc" ? "↑" : "↓")}
          </th>
          <th
            onClick={() => handleSort("currentStage")}
            className="cursor-pointer border p-2"
          >
            Progress {sort.field === "currentStage" && (sort.order === "asc" ? "↑" : "↓")}
          </th>
          <th className="border p-2">Actions</th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>
        {orders.map((order) => (
          <tr key={order._id} className="hover:bg-gray-100 transition duration-150 ease-in-out">
            <td className="border p-2">{order.orderNo}</td>
            <td className="border p-2">{order.orderQty}</td>
            <td className="border p-2">{order.deliveredQty}</td>
            <td className="border p-2">{order.fabricSupplier}</td>
            <td className="border p-2">{order.fabricArt}</td>
            <td className="border p-2">{order.style}</td>
            <td className="border p-2">{order.line}</td>
            <td className="border p-2">
              {order?.orderDate ? new Date(order.orderDate).toLocaleDateString() : "No date selected"}
            </td>
            <td className="border p-2">
              <ProgressBar progress={order.stageProgress} currentStage={order.currentStage} />
            </td>
            <td className="border p-2">
              <button
                onClick={() => openDeleteConfirm(order._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mr-2"
              >
                Delete
              </button>
              <button
                onClick={() => openEditModal(order)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                style={{ backgroundColor: currentColor }}
              >
                Update
              </button>
              <button
                onClick={() => openOrderDetailsModal(order)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 ml-2"
                style={{ backgroundColor: currentColor }}
              >
                Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between">
        <button
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
          // className="p-2 bg-blue-500 text-white rounded"
          className={`px-4 py-2 ${
            pagination.page === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
          }`}
          style={{ backgroundColor: currentColor }} // Inline style for dynamic color
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
          style={{ backgroundColor: currentColor }} // Inline style for dynamic color
        >
          Next
        </button>
      </div>

      {/* Create / Update Order Modal */}
      {isModalOpen && (
        <OrderModal
          closeModal={closeModal}
          onOrderCreated={handleOrderCreated}
          editOrder={editOrder}
          updateOrderInList={updateOrderInList}
          currentColor={currentColor}
        />
      )}

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

export default OrderList;
