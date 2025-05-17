import React, { useState, useEffect } from "react";
import StepsTable from "../StepsTable";
import { fetchOrders } from "../../services/orderService";
import { createWashRecipe } from "../../services/washService";
import { toast } from "react-toastify";
import RecipeProcessModal from "../RecipeProcessModal";
import ProcessPreview from "../RecipeProcessesPreview";
import { useStateContext } from "../../contexts/ContextProvider";
import StepsPreview from "../StepsPreview";
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
import { SortableWorkspaceItem } from "../SortableWorkspaceItem";

const WashRecipeForm = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [selectedOrder, setSelectedOrder] = useState("");
  const [washType, setWashType] = useState("");
  const [washCode, setWashCode] = useState("");
  const [washDate, setWashDate] = useState(null);
  const [error, setError] = useState(""); // State for error message
  const [steps, setSteps] = useState([]);

  const { currentColor } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15); // Slightly darken the color

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipeProcesses, setRecipeProcesses] = useState([]);

  const [workspaceItems, setWorkspaceItems] = useState([]); // Unified array for steps and processes
  const [activeId, setActiveId] = useState(null);

  // Configure the sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setOrderDetails({}); // Reset order details
    setWashType(""); // Reset wash type
    setWashCode(""); // Reset wash code
    setSteps([]); // Reset steps table
    setRecipeProcesses([]); // Reset processes card view
    setWorkspaceItems([]);
    setSelectedOrder("");
    setWashDate(null);
  };

  // const handleAddProcess = (newProcess) => {
  //   setWorkspaceItems((prev) => [...prev, newProcess]);
  //   setRecipeProcesses((prevProcesses) => [...prevProcesses, newProcess]); // Append process
  // };

  // In WashRecipeForm.js - Update the handleAddProcess function

  const handleAddProcess = (newProcess) => {
    // Calculate the next sequence number based on existing workspace items
    // Find the highest sequence number currently in use

    //const nextSequence = workspaceItems.length + 1;

    // const highestSequence = workspaceItems.length > 0
    //   ? Math.max(...workspaceItems.map(item => item.sequence || 0))
    //   : 0;

    const existingSequences = workspaceItems.map((item) => item.sequence);
    let nextSequence = 1;
    while (existingSequences.includes(nextSequence)) {
      nextSequence++;
    }

    // Assign the sequence to the new process
    const processWithSequence = {
      ...newProcess,
      sequence: nextSequence,
      //sequence: highestSequence + 1 // Increment the highest sequence number
      // Add the new process to the workspace items
    };

    // Update the workspace items
    setWorkspaceItems((prev) => [...prev, processWithSequence]);

    // Update the recipe processes list
    setRecipeProcesses((prevProcesses) => [
      ...prevProcesses,
      processWithSequence,
    ]);
  };

  // For steps, make sure StepsTable is passing this function correctly
  // If StepsTable directly manipulates workspace items, update its props
  // to include this handler instead:

  const updateWorkspaceFromSteps = (newSteps) => {
    console.log("Updating workspace from steps:", newSteps);
    // If newSteps is empty, return early
    if (!newSteps || newSteps.length === 0) {
      return;
    }
    // If workspaceItems is empty, set it to newSteps
    if (workspaceItems.length === 0) {
      setWorkspaceItems(newSteps);
      return;
    }

    // Extract all process items from current workspace
    const processItems = workspaceItems.filter(
      (item) => item.type === "process"
    );

    // Prepare workspace items with correct sequencing
    const allItems = [
      ...processItems,
      ...newSteps?.map((step) => ({ ...step, type: "step" })),
    ];

    // Sort by sequence number
    allItems.sort((a, b) => a.sequence - b.sequence);

    // Re-sequence to ensure continuous numbering
    const resequencedItems = allItems.map((item, index) => ({
      ...item,
      sequence: index + 1,
    }));

    // Update workspace items
    setWorkspaceItems(resequencedItems);

    // Update separated lists
    setSteps(resequencedItems.filter((item) => item.type === "step"));
    setRecipeProcesses(
      resequencedItems.filter((item) => item.type === "process")
    );
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      setWorkspaceItems((items) => {
        // Find the indexes of the dragged item and the target item
        const oldIndex = items.findIndex(
          (item) => item.id.toString() === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.id.toString() === over.id
        );

        // Create the new array with the items in the right order
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update sequence numbers
        newItems.forEach((item, index) => {
          item.sequence = index + 1;
        });

        // Update steps and recipeProcesses
        const stepItems = newItems.filter((item) => item.type === "step");
        const processItems = newItems.filter((item) => item.type === "process");

        setSteps(stepItems);
        setRecipeProcesses(processItems);

        return newItems;
      });
    }
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

  // Find the active item for the overlay
  const activeItem = workspaceItems.find(
    (item) => item.id.toString() === activeId
  );

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
        {/* Table for adding steps */}
        <StepsTable
          steps={steps}
          setSteps={setSteps}
          setWorkspaceItems={setWorkspaceItems}
          workspaceItems={workspaceItems} // Pass the workspace items to StepsTable
        />

        {/* <StepsTable
  steps={steps}
  setSteps={(newSteps) => {
    setSteps(newSteps);
    
    // When steps are updated, we need to update the workspace with proper sequencing
    // This could be adding a new step or modifying existing ones
    
    // Extract the last step if it's new (in case of addition)
    if (newSteps.length > steps.length) {
      const newStep = newSteps[newSteps.length - 1];
      
      // Add type field for workspace identification
      const stepWithType = {
        ...newStep,
        type: "step"
      };
      
      // Find highest sequence and append
      const highestSequence = workspaceItems.length > 0 
        ? Math.max(...workspaceItems.map(item => item.sequence || 0))
        : 0;
      
      // Create step with proper sequence
      const stepWithSequence = {
        ...stepWithType,
        sequence: highestSequence + 1
      };
      
      // Update workspace items
      setWorkspaceItems(prev => [...prev, stepWithSequence]);
    } else {
      // For modifications, full rearrangement might be needed
      // This approach maintains the separate arrays but keeps sequence numbers consistent
      const processItems = workspaceItems.filter(item => item.type === "process");
      
      // Map steps to ensure they have type field
      const typedSteps = newSteps.map(step => ({
        ...step,
        type: "step"
      }));
      
      // Combine and sort by sequence
      const combinedItems = [...processItems, ...typedSteps].sort((a, b) => 
        (a.sequence || 0) - (b.sequence || 0)
      );
      
      // Resequence to ensure continuous numbering
      const resequencedItems = combinedItems.map((item, index) => ({
        ...item,
        sequence: index + 1
      }));
      
      setWorkspaceItems(resequencedItems);
      setRecipeProcesses(resequencedItems.filter(item => item.type === "process"));
    }
  }}
  setWorkspaceItems={setWorkspaceItems}
  updateWorkspaceFromSteps={updateWorkspaceFromSteps} // Pass the function to update workspace from steps
  workspaceItems={workspaceItems} // Pass the workspace items to StepsTable
/> */}

        {/* Live preview for steps */}
        <StepsPreview steps={steps} />
      </div>

      {/* Recipe Processes and Submit */}
      <div className="mt-6 space-y-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: currentColor }}>
          Processes
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg shadow"
          style={{ backgroundColor: currentColor }}
          onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = currentColor)}
        >
          Add Recipe Process
        </button>
        <RecipeProcessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddProcess={handleAddProcess}
        />
        <ProcessPreview recipeProcesses={recipeProcesses} />

        {/* Workspace for steps and processes */}
        {workspaceItems.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={workspaceItems.map((item) => item.id.toString())}
              strategy={horizontalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                {workspaceItems.map((item) => (
                  <SortableWorkspaceItem key={item.id.toString()} item={item} />
                ))}
              </div>
            </SortableContext>

            {/* Drag overlay for showing the item being dragged */}
            <DragOverlay>
              {activeItem ? (
                <div
                  className={`p-4 rounded shadow ${
                    activeItem.type === "step" ? "bg-blue-100" : "bg-green-100"
                  } opacity-80`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">
                      {activeItem.type === "step"
                        ? `Step ${activeItem.sequence}: ${activeItem.stepName}`
                        : `Process ${activeItem.sequence}: ${activeItem.name}`}
                    </h3>
                    <span className="text-sm text-gray-500">
                      #{activeItem.sequence}
                    </span>
                  </div>
                  {activeItem.type === "step" && (
                    <div className="mt-2">
                      <p>Time: {activeItem.time} minutes</p>
                      <p>Temp: {activeItem.temp}°C</p>
                      <p>Liters: {activeItem.liters}</p>
                      {activeItem.chemicals?.length > 0 && (
                        <p>Chemicals: {activeItem.chemicals.length}</p>
                      )}
                    </div>
                  )}
                  {activeItem.type === "process" && (
                    <p className="mt-2">Remark: {activeItem.remark}</p>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <p>Add steps or processes to start building your wash recipe</p>
          </div>
        )}

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
