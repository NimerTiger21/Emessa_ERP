import React, { useState, useEffect } from "react";
import StepsTable from "./StepsTable";
import { fetchOrders } from "../../services/orderService";
import { createWashRecipe } from "../../services/washService";
import { toast } from "react-toastify";
import RecipeProcessModal from "./RecipeProcessModal";
import ProcessPreview from "./RecipeProcessesPreview";
import { useStateContext } from "../../contexts/ContextProvider";
import StepsPreview from "./StepsPreview";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { darkenColor } from "../../utils/darkenColor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableWorkspaceItem } from "./SortableWorkspaceItem";

import { useWorkspaceManager } from "./useWorkspaceManager";
import ProcessesManager from "./ProcessesManager";

const WashRecipeForm = () => {
  const {
    workspaceItems,
    steps,
    processes,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    updateProcesses,
    setWorkspaceItems,
  } = useWorkspaceManager();

  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [selectedOrder, setSelectedOrder] = useState("");
  const [washType, setWashType] = useState("");
  const [washCode, setWashCode] = useState("");
  const [washDate, setWashDate] = useState(null);
  const [error, setError] = useState(""); // State for error message
  // const [steps, setSteps] = useState([]);

  const { currentColor } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15); // Slightly darken the color

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipeProcesses, setRecipeProcesses] = useState([]);

  // const [workspaceItems, setWorkspaceItems] = useState([]); // Unified array for steps and processes
  const [activeId, setActiveId] = useState(null);

  // Configure the sensors for drag detection
  // Sensors configuration for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setOrderDetails({}); // Reset order details
    setWashType(""); // Reset wash type
    setWashCode(""); // Reset wash code
    //setSteps([]); // Reset steps table
    setRecipeProcesses([]); // Reset processes card view
    //setWorkspaceItems([]);
    setWorkspaceItems([]); // Reset workspace items
    // workspaceItems = []; // Reset workspace items
    // processes = []; // Reset processes
    // steps = []; // Reset steps

    setSelectedOrder("");
    setWashDate(null);
  };

  // Handler for adding a process
  const handleAddProcess = (newProcess) => {
    addItem(newProcess, "process");
    setIsModalOpen(false);
  };

  // New handler for updating processes (enables both add and edit)
  const handleUpdateProcesses = (updatedProcesses) => {
    console.log("Updating processes21:", updatedProcesses);
    updateProcesses(updatedProcesses);
    setIsModalOpen(false);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Find indexes of the dragged items
    const oldIndex = workspaceItems.findIndex(
      (item) => item.id.toString() === active.id.toString()
    );
    const newIndex = workspaceItems.findIndex(
      (item) => item.id.toString() === over.id.toString()
    );

    // Reorder items
    reorderItems(oldIndex, newIndex);
  };

  // Handler for adding a step
  const handleAddStep = (newStep) => {
    addItem(newStep, "step");
  };

  // Fetch orders for dropdown
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetchOrders({});
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    loadOrders();
  }, []);

  // Fetch order details when an order is selected
  const handleOrderChange = async (e) => {
    const orderId = e.target.value;
    setSelectedOrder(orderId);

    try {
      if (orderId) {
        // Fetch and set order details for the selected order
        const selectedOrderDetails = orders.find(
          (order) => order._id === orderId
        );
        setOrderDetails(selectedOrderDetails || {});
      } else {
        setOrderDetails({}); // Clear details if no order selected
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleChange = (date) => {
    setWashDate(date); // Update state with the selected date
    setError(""); // Clear error when date is selected
  };

  // Submit wash recipe
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if selectedOrder is selected
    if (!selectedOrder) {
      toast.error("Please select an Order");
      return;
    }
    // Validation: Check if washType is selected
    if (!washType) {
      toast.error("Please select a wash type");
      return;
    }
    // Check if washDate is selected
    if (!washDate) {
      setError("Please select a wash date."); // Set error message
      toast.error("Please select a wash date.");
      return; // Stop further execution
    }

    const invalidStep = steps.find((step) => !step.stepId);
    if (invalidStep) {
      toast.error("Step missing required fields.");
      return;
    }

    const recipeData = {
      orderId: selectedOrder,
      date: format(washDate, "yyyy-MM-dd"),
      washCode,
      washType,
      steps, // Includes steps and chemicals
      recipeProcess: recipeProcesses,
      workspaceItems, // Unified array
    };

    try {
      const response = await createWashRecipe(recipeData);
      toast.success(response.message);
      // Reset all states and components
      resetForm(); // Clear the form after saving
    } catch (error) {
      console.error("Error creating wash recipe:", error);
      toast.error(
        error.response?.data?.message || "Failed to save wash recipe."
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Header */}
      <h1
        className="text-2xl font-extrabold text-center text-blue-800 mb-6"
        style={{ color: hoverColor }}
      >
        Wash Recipe Form
      </h1>

      {/* Form Fields in a Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white shadow-lg rounded-lg p-6">
        {/* Select Order */}
        <div>
          <label
            htmlFor="order"
            className="block text-sm font-medium text-gray-700 mb-2"
            style={{ color: currentColor }}
          >
            Select Order
          </label>
          <select
            id="order"
            value={selectedOrder}
            onChange={handleOrderChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          >
            <option value="">Choose an Order</option>
            {orders?.map((order) => (
              <option key={order._id} value={order._id}>
                {order.orderNo} - {order.style?.styleNo} - {order.season}
              </option>
            ))}
          </select>
        </div>

        {/* Wash Type */}
        <div>
          <label
            htmlFor="wash-type"
            className="block text-sm font-medium text-gray-700 mb-2"
            style={{ color: currentColor }}
          >
            Order Type
          </label>
          <select
            id="wash-type"
            value={washType}
            onChange={(e) => setWashType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          >
            <option value="" disabled>
              Select Wash Type
            </option>
            <option value="Size set">Size Set</option>
            <option value="SMS">SMS</option>
            <option value="Proto">Proto</option>
            <option value="Production">Production</option>
            <option value="Fitting Sample">Fitting Sample</option>
          </select>
        </div>

        {/* Wash Code */}
        <div>
          <label
            htmlFor="wash-code"
            className="block text-sm font-medium text-gray-700 mb-2"
            style={{ color: currentColor }}
          >
            Wash Code
          </label>
          <input
            id="wash-code"
            type="text"
            value={washCode}
            onChange={(e) => setWashCode(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Wash Date */}
        <div>
          <label
            htmlFor="wash-date"
            className="block text-sm font-medium text-gray-700 mb-2"
            style={{ color: currentColor }}
          >
            Wash Date
          </label>
          <DatePicker
            id="wash-date"
            selected={washDate}
            onChange={handleChange}
            dateFormat="yyyy-MM-dd"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Order Details Table */}
      {selectedOrder && orderDetails && (
        <div className="mb-6 p-6 rounded bg-gray-50 border border-gray-200 shadow-sm">
          <h2
            className="text-2xl font-bold text-gray-800 mb-4"
            style={{ color: currentColor }}
          >
            Order Details
          </h2>
          <table className="min-w-full bg-white border border-gray-200 table-auto rounded-lg shadow-lg">
            <thead>
              <tr
                className="bg-blue-600 text-white text-center"
                style={{ backgroundColor: hoverColor }}
              >
                <th className="border-b-2 border-gray-200 p-2">Order No</th>
                <th className="border-b-2 border-gray-200 p-2">Style</th>
                <th className="border-b-2 border-gray-200 p-2">Fabric Art</th>
                <th className="border-b-2 border-gray-200 p-2">Key No</th>
                <th className="border-b-2 border-gray-200 p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border text-center">
                  {orderDetails.orderNo}
                </td>
                <td className="p-2 border text-center">
                  {orderDetails.style?.name}
                </td>
                <td className="p-2 border text-center">
                  {orderDetails.articleNo}
                </td>
                <td className="p-2 border text-center">{orderDetails.keyNo}</td>
                <td className="p-2 border text-center">
                  {new Date(orderDetails.orderDate).toLocaleDateString() ||
                    "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Steps Table and Preview */}
      <div className="mt-6">
        <StepsTable
          steps={steps}
          addItem={addItem}
          removeItem={removeItem}
          updateItem={updateItem}
        />
        <StepsPreview steps={steps} />
      </div>

      {/* Processes Section */}
      <div className="mt-6 space-y-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg"
        >
          Add Recipe Process
        </button>

        {/* OPTION 1: Use the new ProcessesManager component (recommended) */}
      <ProcessesManager
        processes={processes}
        updateProcesses={handleUpdateProcesses}
      />

        {/* <RecipeProcessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddProcess={handleAddProcess}
        />

        <ProcessPreview recipeProcesses={processes} /> */}

        {/* Draggable Workspace */}
        {workspaceItems.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={workspaceItems.map((item) => item.id.toString())}
              strategy={horizontalListSortingStrategy}
            >
              {/* Your existing draggable workspace rendering logic */}
              {/* Use the workspaceItems for rendering */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                {workspaceItems.map((item) => (
                  <SortableWorkspaceItem key={item.id.toString()} item={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Recipe Processes and Submit */}
      <div className="mt-6 space-y-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow"
        >
          Save Wash Recipe
        </button>
      </div>
    </div>
  );
};

export default WashRecipeForm;
