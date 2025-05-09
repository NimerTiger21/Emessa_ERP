import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import ConfirmationModal from "../components/ConfirmationModal";
import { toast } from "react-toastify";
import { deleteOrder, fetchOrders } from "../services/orderService";
import OrderModal from "../components/OrderModal";
//import ProgressBar from "../components/ProgressBar";
import Spinner from "./../components/Spinner";
import { fetchStyles } from "../services/masterDataService";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react"; // Import icons
import FabricModal from "../components/FabricModal";
import StyleModal from "../components/StyleModal";

const OrderList = () => {
  // const calculateOverallProgress = () => {
  //   const totalProgress = orders.reduce(
  //     (sum, order) => sum + order.stageProgress,
  //     0
  //   );
  //   return Math.round(totalProgress / orders.length);
  // };

  const [editOrder, setEditOrder] = useState(null); // Track defect to edit
  const { currentColor } = useStateContext();
  // Order Management States
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [sort, setSort] = useState({ field: "orderDate", order: "desc" });
  const [search, setSearch] = useState("");

  const [styles, setStyles] = useState([]);
  const [styleFilter, setStyleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
  const [deleteId, setDeleteId] = useState(null); // ID of defect to be deleted

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCearteFabricModalOpen, setIsCearteFabricModalOpen] = useState(false);
  const [isCreateStyleModalOpen, setIsCreateStyleModalOpen] = useState(false);

  const navigate = useNavigate();

  // Load styles on component mount
  useEffect(() => {
    loadStyles();
  }, []);
  const loadStyles = async () => {
    try {
      const styleData = await fetchStyles();
      setStyles(styleData);
    } catch (error) {
      console.error("Failed to load styles");
    }
  };

  const handleOrderCreated = (newOrder) => {
    setOrders([...orders, newOrder]);
  };

  // Open Edit Modal
  const openEditModal = (order) => {
    setEditOrder(order);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setEditOrder(null); // Clear edit data
    setIsModalOpen(false);
    setIsCearteFabricModalOpen(false);
    setIsCreateStyleModalOpen(false);
  };

  // Function to update the defect in the list after editing
  const updateOrderInList = async (updatedOrder) => {
    console.log("Updating order: ", updatedOrder);
    if (!updatedOrder || !updatedOrder._id) {
      console.error("Invalid updated order:", updatedOrder);
      toast.error("Invalid updated order");
      return; // Exit if updatedOrder is invalid
    }
    setOrders((prevDefects) =>
      prevDefects.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    //await loadOrders(); // Optionally refetch orders if needed
  };

  // Fetch orders from API
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
        //setIsLoading(true);
        //console.log("***************** data: ", data);
        setOrders(data.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages,
        }));
      } catch (error) {
        console.error("Error loading orders:", error);
        setIsLoading(false);
      }
    };
    loadOrders();
    setIsLoading(false);
  }, [pagination.page, pagination.limit, sort, search, styleFilter]);

  // Handle Pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle Sorting
  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      //order: prev.order === "asc" ? "desc" : "asc",
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Open Confirmation Modal for Deletion
  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  // Confirm Order Deletion
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

  // Open Order Details
  const openOrderDetailsModal = (order) => {
    //navigate(`/orders/${order._id}`);
    navigate(`/orders/${order._id}`, { state: { order } }); // Pass the order object
  };

  const openModal = () => setIsModalOpen(true);
  const openCreateFabricModal = () => setIsCearteFabricModalOpen(true);
  const openCreateStyleModal = () => setIsCreateStyleModalOpen(true);
  const closeConfirm = () => setIsConfirmOpen(false);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header and Overall Progress Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Header */}
        <h1 className="text-xl font-bold text-gray-800 flex-shrink-0">
          Orders
        </h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search Orders..."
          //value={search}
          defaultValue={search}
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
          {styles.map((style) => (
            <option key={style._id} value={style._id}>
              {style.name}
            </option>
          ))}
        </select>

        {/* Create Button */}
        <button
          onClick={openModal}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-200 flex-shrink-0"
          style={{ backgroundColor: currentColor }}
        >
          Create New Order
        </button>

        {/* Create Button */}
        <button
          onClick={openCreateFabricModal}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-200 flex-shrink-0"
          style={{ backgroundColor: currentColor }}
        >
          Create New Fabric
        </button>

        {/* Create Style Button */}
        <button
          onClick={openCreateStyleModal}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-200 flex-shrink-0"
          style={{ backgroundColor: currentColor }}
        >
          Create New Style
        </button>

        {/* Overall Progress */}
        {/* <div className="flex items-center gap-2 flex-shrink-0 p-4 bg-white shadow rounded-lg mb-2">
          <span className="text-sm font-semibold text-gray-600">
            Overall Progress:
          </span>
          <ProgressBar
            progress={calculateOverallProgress()}
            currentStage="Overall"
          />
        </div> */}
      </div>
      {/* Order Table */} {/* Order List Section */}
      <table className="table-auto w-full bg-white shadow-md rounded border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th
              onClick={() => handleSort("orderNo")}
              className="cursor-pointer border p-2"
            >
              Order No{" "}
              {sort.field === "orderNo" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("customer")}
              className="cursor-pointer border p-2"
            >
              Customer{" "}
              {sort.field === "customer" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("brand")}
              className="cursor-pointer border p-2"
            >
              Brand{" "}
              {sort.field === "brand" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("style")} className="cursor-pointer">
              Style{" "}
              {sort.field === "style" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("StyleNo")}
              className="cursor-pointer"
            >
              StyleNo{" "}
              {sort.field === "StyleNo" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("keyNo")}
              className="cursor-pointer border p-2"
            >
              Key No{" "}
              {sort.field === "keyNo" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("season")}
              className="cursor-pointer border p-2"
            >
              Season{" "}
              {sort.field === "season" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("articleNo")}
              className="cursor-pointer border p-2"
            >
              Article#{" "}
              {sort.field === "articleNo" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("fabric")}
              className="cursor-pointer border p-2"
            >
              Fabric{" "}
              {sort.field === "fabric" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("fabricComposition")}
              className="cursor-pointer border p-2"
            >
              Fabric Composition{" "}
              {sort.field === "fabricComposition" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("orderDate")}
              className="cursor-pointer"
            >
              Order Date{" "}
              {sort.field === "orderDate" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("orderQty")}
              className="cursor-pointer border p-2"
            >
              O-Qty{" "}
              {sort.field === "orderQty" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("fabricCode")}
              className="cursor-pointer border p-2"
            >
              Fabric Code{" "}
              {sort.field === "fabricCode" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("fabricSupplier")}
              className="cursor-pointer border p-2"
            >
              Fabric Supplier{" "}
              {sort.field === "fabricSupplier" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>
            {/* <th
              onClick={() => handleSort("currentStage")}
              className="cursor-pointer"
            >
              Progress{" "}
              {sort.field === "currentStage" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th> */}
            <th>Actions</th>
            {/* New Actions Column */}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id}
              className="hover:bg-gray-100 transition duration-150 ease-in-out"
            >
              <td className="border p-2">{order.orderNo}</td>
              <td className="border p-2">{order.customer?.name}</td>
              <td className="border p-2">{order.brand?.name || "No Brand"}</td>
              <td className="border p-2">{order.style?.name}</td>
              <td className="border p-2">{order.styleNo}</td>
              <td className="border p-2">{order.keyNo}</td>
              <td className="border p-2">{order.season}</td>
              <td className="border p-2">{order.articleNo}</td>
              <td className="border p-2">{order.fabric?.name}</td>
              <td className="border p-2">
                <td className="p-2">
                  {order.fabric?.fabricCompositions?.length > 0
                    ? (() => {
                        const compositionString =
                          order.fabric.fabricCompositions
                            .map(
                              (fc) =>
                                `${fc.value}%${fc.compositionItem?.name || "Unknown"}`
                            )
                            .join(", ");
                        return compositionString.length > 30
                          ? compositionString.slice(0, 30) + "..."
                          : compositionString;
                      })()
                    : "No Composition"}
                </td>
              </td>
              <td className="border p-2">
                {order?.orderDate
                  ? new Date(order.orderDate).toLocaleDateString()
                  : "No date selected"}
              </td>
              <td className="border p-2">{order.orderQty}</td>
              <td className="border p-2">{order.fabric?.code || "N/A"}</td>
              <td className="border p-2">{order.fabricSupplier?.name}</td>
              {/* Progress Bar */}
              {/* Place ProgressBar inside a td */}
              {/* <td className="border p-2">
                <ProgressBar
                  progress={order.stageProgress}
                  currentStage={order.currentStage}
                />
              </td> */}
              {/* Actions */}
              <td className="border p-2 hidden">
                {/* Delete Button */}
                <button
                  onClick={() => openDeleteConfirm(order._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mr-2"
                >
                  Delete
                </button>
                {/* Update Button Placeholder */}
                <button
                  onClick={() => openEditModal(order)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  style={{ backgroundColor: currentColor }} // Inline style for dynamic color
                >
                  Update
                </button>
                {/* Order Details Button Placeholder */}
                <button
                  onClick={() => openOrderDetailsModal(order)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 ml-2"
                  style={{ backgroundColor: currentColor }} // Inline style for dynamic color
                >
                  Details
                </button>
              </td>

              <td className="border p-2 text-center">
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="inline-flex w-full justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none">
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
                    <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        {/* View Details */}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => openOrderDetailsModal(order)}
                              className={`${
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700"
                              } group flex w-full items-center px-4 py-2 text-sm`}
                            >
                              <Eye className="mr-2 h-5 w-5 text-gray-500" />
                              View Details
                            </button>
                          )}
                        </Menu.Item>

                        {/* Edit Order */}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => openEditModal(order)}
                              className={`${
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700"
                              } group flex w-full items-center px-4 py-2 text-sm`}
                            >
                              <Edit className="mr-2 h-5 w-5 text-blue-500" />
                              Edit Order
                            </button>
                          )}
                        </Menu.Item>

                        {/* Delete Order */}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => openDeleteConfirm(order._id)}
                              className={`${
                                active
                                  ? "bg-red-100 text-red-700"
                                  : "text-red-500"
                              } group flex w-full items-center px-4 py-2 text-sm`}
                            >
                              <Trash2 className="mr-2 h-5 w-5 text-red-500" />
                              Delete Order
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
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
      {/* Create Fabric Modal */}
      {isCearteFabricModalOpen && (
        <FabricModal closeModal={closeModal} refreshFabricList={loadStyles} />
        // <FabricCompositionForm />
      )}
      {/* Create Style Modal */}
      {isCreateStyleModalOpen && (
        <StyleModal
          closeModal={closeModal}
          isOpen={isCreateStyleModalOpen}
          //editStyle={editStyle}
          refreshStyleList={loadStyles}
        />
        // <FabricCompositionForm />
      )}
    </div>
  );
};

export default OrderList;
