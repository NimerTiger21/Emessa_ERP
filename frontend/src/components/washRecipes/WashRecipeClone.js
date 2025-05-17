// 2. Create a new component called WashRecipeClone.js
// This will be almost identical to WashRecipeEdit.js but with a few key differences

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StepsTable from "./StepsTable";
import { fetchOrders } from "../../services/orderService";
import {
  getWashRecipeById,
  createWashRecipe,
} from "../../services/washService";
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
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableWorkspaceItem } from "./SortableWorkspaceItem";
import { useWorkspaceManager } from "./useWorkspaceManager";
import Spinner from "../Spinner";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import ProcessesManager from "./ProcessesManager";

const WashRecipeClone = () => {
  const { id } = useParams(); // Get the original recipe ID from URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [orderDetails, setOrderDetails] = useState({});
  const [washType, setWashType] = useState("");
  const [washCode, setWashCode] = useState("");
  const [washDate, setWashDate] = useState(new Date()); // Default to current date for the clone
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentColor } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15);

  // Reuse the same functions from WashRecipeEdit.js
  function normalizeStepData(step, chemicalsByStep = {}) {
    // Same implementation as in WashRecipeEdit.js
    // ...copy the entire function from WashRecipeEdit.js

    // Use the correct ID for looking up chemicals
    const stepId = step._id
      ? step._id.toString()
      : step.id
      ? step.id.toString()
      : null;

    // Get chemicals for this step from the chemicalsByStep mapping
    // This is critical as backend sends chemicals separately in chemicalsByStep
    const stepChemicals =
      stepId && chemicalsByStep[stepId]
        ? chemicalsByStep[stepId].map((chem) => {
            // Transform backend chemical format to frontend format
            return {
              id: chem._id || `temp-${Date.now()}-${Math.random()}`,
              chemicalItemId: chem.chemicalItemId || chem._id,
              name: chem.name || "",
              quantity: chem.quantity || 0,
              unit: chem.unit || "",
              supplier: chem.supplier || "",
            };
          })
        : [];

    // Create a standardized step object with a NEW ID for cloning purposes
    const normalizedStep = {
      // Generate a new temporary ID for this cloned item
      id: `clone-${Date.now()}-${Math.random()}`,

      // Keep the original step information but without _id to ensure it's treated as new
      stepId:
        typeof step.stepId === "object" && step.stepId?._id
          ? step.stepId._id
          : step.stepId,

      // Always have stepName available
      stepName:
        typeof step.stepId === "object" && step.stepId?.name
          ? step.stepId.name
          : step.stepName || "",

      // Copy all other properties
      type: step.type || "step",
      sequence: step.sequence || 0,
      time: step.time || 0,
      temp: step.temp || 0,
      liters: step.liters || 0,

      // Add the chemicals from the chemicalsByStep mapping
      // Each chemical gets a new temporary ID
      chemicals: stepChemicals.map((chem) => ({
        ...chem,
        id: `clone-chem-${Date.now()}-${Math.random()}`,
      })),

      // For process-specific properties
      name: step.name || step.laundryProcessId?.name || "",
      processType: step.processType || step.recipeProcessType || "",
      remark: step.remark || "",
      laundryProcessId:
        step.laundryProcessId?._id || step.laundryProcessId || "",

      // Don't include washRecipeId for cloning
      washRecipeId: null,
    };

    return normalizedStep;
  }

  function prepareDataForSubmission(workspaceItems) {
    // Same implementation as in WashRecipeEdit.js
    // ...copy the entire function from WashRecipeEdit.js

    // Separate steps and processes
    const steps = workspaceItems
      .filter((item) => item.type === "step")
      .map((step, index) => {
        const formattedStep = {
          sequence: index + 1, // Ensure sequential ordering
          stepId:
            typeof step.stepId === "string" && step.stepName
              ? { _id: step.stepId, name: step.stepName }
              : step.stepId,
          time: step.time || 0,
          temp: step.temp || 0,
          liters: step.liters || 0,
        };

        // For clone, we don't include _id since we want new records
        // This is different from the edit version

        return formattedStep;
      });

    // Format processes
    const processes = workspaceItems
      .filter((item) => item.type === "process")
      .map((process, index) => {
        const formattedProcess = {
          sequence: index + 1, // Ensure sequential ordering
          laundryProcessId:
            typeof process.laundryProcessId === "string" && process.name
              ? { _id: process.laundryProcessId, name: process.name }
              : process.laundryProcessId,
          recipeProcessType:
            process.processType || process.recipeProcessType || "",
          remark: process.remark || "",
        };

        // For clone, we don't include _id since we want new records
        // This is different from the edit version

        return formattedProcess;
      });

    // Create a chemicals by step mapping
    const chemicalsByStep = {};
    workspaceItems
      .filter((item) => item.type === "step" && item.id)
      .forEach((step) => {
        if (Array.isArray(step.chemicals) && step.chemicals.length > 0) {
          chemicalsByStep[step.id] = step.chemicals.map((chem) => {
            // Format chemical without temporary IDs
            const { id, ...chemData } = chem;
            return chemData;
          });
        }
      });

    return {
      steps,
      recipeProcess: processes,
      chemicalsByStep,
      workspaceItems, // Include full workspace items for reference
    };
  }

  function processRecipeDataForFrontend(recipeData) {
    // Same as WashRecipeEdit.js but with modified IDs for cloning
    // ...copy the entire function from WashRecipeEdit.js with small modifications

    // Extract the chemicalsByStep mapping
    const chemicalsByStep = recipeData.chemicalsByStep || {};

    let normalizedItems = [];

    // Get all steps and processes
    const stepsData = recipeData.steps || [];
    const processesData = recipeData.processes || [];

    // If combinedItems exists and has items, use that
    if (recipeData.combinedItems && recipeData.combinedItems.length > 0) {
      normalizedItems = recipeData.combinedItems.map((item) => {
        // Identify item type
        const itemType = item.stepId
          ? "step"
          : item.laundryProcessId
          ? "process"
          : item.type || "unknown";
        return normalizeStepData({ ...item, type: itemType }, chemicalsByStep);
      });
    } else {
      // Otherwise create combined items from steps and processes
      const stepsWithType = stepsData.map((step) => ({
        ...step,
        type: "step",
      }));
      const processesWithType = processesData.map((process) => ({
        ...process,
        type: "process",
      }));

      // Combine and sort by sequence
      const combinedItems = [...stepsWithType, ...processesWithType].sort(
        (a, b) => (a.sequence || 0) - (b.sequence || 0)
      );

      normalizedItems = combinedItems.map((item) =>
        normalizeStepData(item, chemicalsByStep)
      );
    }

    return {
      ...recipeData,
      normalizedItems,
    };
  }

  // Initialize workspace manager
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

  // Sensors configuration for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch wash recipe data and populate form
  useEffect(() => {
    const loadRecipeData = async () => {
      try {
        setIsLoading(true);
        // Fetch wash recipe by ID
        const recipeData = await getWashRecipeById(id);
        console.log("Fetched recipe data for cloning:", recipeData);

        // Fetch orders for dropdown
        const ordersResponse = await fetchOrders({});
        setOrders(ordersResponse.data);

        // Process the data for frontend compatibility
        const processedData = processRecipeDataForFrontend(recipeData);

        // Set form values from fetched recipe, but modify for cloning
        setSelectedOrder(processedData.washRecipe.orderId?._id || "");
        setOrderDetails(processedData.washRecipe.orderId || {});
        setWashType(processedData.washRecipe.washType || "");

        // Modify the wash code to indicate it's a clone
        const originalWashCode = processedData.washRecipe.washCode || "";
        setWashCode(`${originalWashCode}-COPY`);

        // Set to current date instead of original date
        setWashDate(new Date());

        // Set workspace items with normalized data that includes chemicals properly
        setWorkspaceItems(processedData.normalizedItems);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading wash recipe data for cloning:", error);
        toast.error("Failed to load wash recipe data");
        setIsLoading(false);
        navigate("/wash-recipe-list"); // Redirect on error
      }
    };

    loadRecipeData();
  }, [id, navigate, setWorkspaceItems]);

  // Handler for order selection
  const handleOrderChange = (e) => {
    const orderId = e.target.value;
    setSelectedOrder(orderId);

    try {
      if (orderId) {
        const selectedOrderDetails = orders.find(
          (order) => order._id === orderId
        );
        setOrderDetails(selectedOrderDetails || {});
      } else {
        setOrderDetails({});
      }
    } catch (error) {
      console.error("Error handling order change:", error);
    }
  };

  // Handler for date change
  const handleDateChange = (date) => {
    setWashDate(date);
    setError("");
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

  // Handler for drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Find indexes of the dragged items
    const oldIndex = workspaceItems.findIndex(
      (item) => item.id?.toString() === active.id.toString()
    );
    const newIndex = workspaceItems.findIndex(
      (item) => item.id?.toString() === over.id.toString()
    );

    // Reorder items
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderItems(oldIndex, newIndex);
    }
  };

  // Submit form to create a new wash recipe from the clone
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedOrder) {
      setError("Please select an order");
      return;
    }
    if (!washType) {
      setError("Please select a wash type");
      return;
    }
    if (!washCode) {
      setError("Please enter a wash code");
      return;
    }
    if (!washDate) {
      setError("Please select a date");
      return;
    }

    // Prepare the data for submission using our utility
    const submissionData = prepareDataForSubmission(workspaceItems);

    // Add other required fields
    const createData = {
      orderId: selectedOrder,
      date: format(washDate, "yyyy-MM-dd"),
      washCode,
      washType,
      ...submissionData,
    };

    try {
      console.log("Creating new wash recipe from clone:", createData);
      await createWashRecipe(createData);
      toast.success("New wash recipe created successfully!");
      navigate("/wash-recipe-list");
    } catch (error) {
      console.error("Error creating wash recipe:", error);
      toast.error(
        error.response?.data?.message || "Failed to create wash recipe."
      );
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Header - Changed to indicate cloning */}
      <h1
        className="text-2xl font-extrabold text-center text-blue-800 mb-6"
        style={{ color: hoverColor }}
      >
        Clone Wash Recipe
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
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
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
            onChange={handleDateChange}
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
                  {orderDetails.orderDate
                    ? new Date(orderDetails.orderDate).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Steps Table */}
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
              items={workspaceItems.map((item) => item?.id?.toString() ?? "")}
              strategy={horizontalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                {workspaceItems.map((item) => (
                  <SortableWorkspaceItem
                    key={item?.id?.toString()}
                    item={item}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Save and Cancel Buttons - Changed from "Update" to "Save as New" */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow"
        >
          Save as New Recipe
        </button>
        <button
          onClick={() => navigate("/wash-recipe-list")}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg shadow"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WashRecipeClone;
