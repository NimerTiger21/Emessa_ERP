import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StepsTable from "../washRecipes/StepsTable";
import { fetchOrders } from "../../services/orderService";
import {
  getWashRecipeById,
  updateWashRecipe,
} from "../../services/washService";
import { toast } from "react-toastify";
import RecipeProcessModal from "../washRecipes/RecipeProcessModal";
import ProcessPreview from "../washRecipes/RecipeProcessesPreview";
import { useStateContext } from "../../contexts/ContextProvider";
import StepsPreview from "../washRecipes/StepsPreview";
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
import { SortableWorkspaceItem } from "../washRecipes/SortableWorkspaceItem";

import { useWorkspaceManager } from "../washRecipes/useWorkspaceManager";
import Spinner from "../Spinner";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

const WashRecipeEdit = () => {
  const { id } = useParams(); // Get the recipe ID from URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [orderDetails, setOrderDetails] = useState({});
  const [washType, setWashType] = useState("");
  const [washCode, setWashCode] = useState("");
  const [washDate, setWashDate] = useState(null);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentColor } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15);

  /**
   * Normalize step data to ensure consistent structure
   * @param {Object} step - The step object to normalize
   * @param {Object} chemicalsByStep - Mapping of step IDs to chemical arrays
   * @returns {Object} Normalized step object
   */
  function normalizeStepData(step, chemicalsByStep = {}) {
    // Use the correct ID for looking up chemicals
    const stepId = step._id
      ? step._id.toString()
      : step.id
      ? step.id.toString()
      : null;

    // Get chemicals for this step from the chemicalsByStep mapping
    const stepChemicals =
      stepId && chemicalsByStep[stepId] ? chemicalsByStep[stepId] : [];

    // Create a standardized step object
    const normalizedStep = {
      // Use id as the unique identifier for all operations
      id: stepId,
      _id: stepId, // Keep _id for backward compatibility

      // Normalize stepId to always be a string
      stepId:
        typeof step.stepId === "object" && step.stepId?._id
          ? step.stepId._id
          : step.stepId,

      // Always have stepName available
      stepName:
        typeof step.stepId === "object" && step.stepId?.name
          ? step.stepId.name
          : step.stepName,

      // Copy all other properties
      type: step.type || "step",
      sequence: step.sequence || 0,
      time: step.time || 0,
      temp: step.temp || 0,
      liters: step.liters || 0,

      // Assign chemicals from the chemicalsByStep mapping with unique IDs
      chemicals: Array.isArray(stepChemicals)
        ? stepChemicals.map((chem) => ({
            ...chem,
            // Ensure each chemical has a unique ID
            id:
              chem.id || chem._id || `chemical-${Date.now()}-${Math.random()}`,
          }))
        : [],

      // Any other properties needed
      washRecipeId: step.washRecipeId || null,

      // For process-specific properties
      name: step.name || step.laundryProcessId?.name || "",
      processType: step.processType || "",
      remark: step.remark || "",
      laundryProcessId:
        step.laundryProcessId?._id || step.laundryProcessId || "",
    };

    return normalizedStep;
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
        console.log("Fetched recipe data:", recipeData);

        // Fetch orders for dropdown
        const ordersResponse = await fetchOrders({});
        setOrders(ordersResponse.data);

        // Set form values from fetched recipe
        setSelectedOrder(recipeData.washRecipe.orderId?._id || "");
        setOrderDetails(recipeData.washRecipe.orderId || {});
        setWashType(recipeData.washRecipe.washType || "");
        setWashCode(recipeData.washRecipe.washCode || "");
        setWashDate(
          recipeData.washRecipe.date
            ? new Date(recipeData.washRecipe.date)
            : null
        );

        // Extract the chemicalsByStep mapping
        const chemicalsByStep = recipeData.chemicalsByStep || {};
        console.log("Chemicals by step:", chemicalsByStep);

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
            return normalizeStepData(
              { ...item, type: itemType },
              chemicalsByStep
            );
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

        // Set workspace items
        setWorkspaceItems(normalizedItems);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading wash recipe data:", error);
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

  // Submit form to update wash recipe
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!selectedOrder) {
      toast.error("Please select an Order");
      return;
    }

    if (!washType) {
      toast.error("Please select a wash type");
      return;
    }

    if (!washDate) {
      setError("Please select a wash date.");
      toast.error("Please select a wash date.");
      return;
    }

    const invalidStep = steps.find((step) => !step.stepId);
    if (invalidStep) {
      toast.error("Step missing required fields.");
      return;
    }

    // Format steps for the API - convert to the expected structure
    const formattedSteps = steps.map((step) => {
      // Transform stepId back to object format if it was normalized
      const formattedStep = {
        ...step,
        stepId:
          typeof step.stepId === "string" && step.stepName
            ? { _id: step.stepId, name: step.stepName }
            : step.stepId,
      };

      return formattedStep;
    });

    // Prepare chemicalsByStep mapping from the normalized steps
    const chemicalsByStep = {};
    steps.forEach((step) => {
      if (
        step.id &&
        Array.isArray(step.chemicals) &&
        step.chemicals.length > 0
      ) {
        // Store chemicals under the step ID
        chemicalsByStep[step.id] = step.chemicals.map((chem) => {
          // Remove id property as it's only used for frontend tracking
          const { id, ...chemData } = chem;
          return chemData;
        });
      }
    });

    // Convert workspaceItems back to the format the server expects
    const processedWorkspaceItems = workspaceItems.map((item) => {
      // Ensure correct ID format
      if (!item) return item;

      // For steps, structure stepId back to the object format the server expects
      if (
        item.type === "step" &&
        item.stepId &&
        typeof item.stepId === "string" &&
        item.stepName
      ) {
        return {
          ...item,
          stepId: {
            _id: item.stepId,
            name: item.stepName,
          },
          // Remove chemicals from workspace items as they're handled separately
          chemicals: undefined,
        };
      }

      // For processes
      if (
        item.type === "process" &&
        item.laundryProcessId &&
        typeof item.laundryProcessId === "string"
      ) {
        return {
          ...item,
          laundryProcessId: {
            _id: item.laundryProcessId,
            name: item.name,
          },
        };
      }

      return item;
    });

    // Prepare update data
    const updateData = {
      orderId: selectedOrder,
      date: format(washDate, "yyyy-MM-dd"),
      washCode,
      washType,
      steps: formattedSteps,
      recipeProcess: processes,
      chemicalsByStep: chemicalsByStep, // Include chemicals mapping
      workspaceItems: processedWorkspaceItems,
    };

    try {
      console.log("Submitting wash recipe update:", updateData);
      // Call update service
      await updateWashRecipe(id, updateData);
      //toast.success("Wash recipe updated successfully!");
      navigate("/wash-recipe-list"); // Redirect after successful update
    } catch (error) {
      console.error("Error updating wash recipe:", error);
      toast.error(
        error.response?.data?.message || "Failed to update wash recipe."
      );
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Header */}
      <h1
        className="text-2xl font-extrabold text-center text-blue-800 mb-6"
        style={{ color: hoverColor }}
      >
        Edit Wash Recipe
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

        <RecipeProcessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddProcess={handleAddProcess}
        />

        {/* Show process preview only if we have processes */}
        {processes.length > 0 && <ProcessPreview recipeProcesses={processes} />}

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

      {/* Update and Cancel Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow"
        >
          Update Wash Recipe
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

export default WashRecipeEdit;
