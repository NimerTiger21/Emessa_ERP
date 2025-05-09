import React, { useState, useEffect } from "react";
import StepsTable from "./StepsTable";
import { fetchOrders } from "./../services/orderService";
import { createWashRecipe } from "../services/washService";
import { toast } from "react-toastify";
import RecipeProcessModal from "./RecipeProcessModal";
import ProcessPreview from "./RecipeProcessesPreview";
import { useStateContext } from "../contexts/ContextProvider";
import StepsPreview from "./StepsPreview";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { darkenColor } from "../utils/darkenColor";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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

  const resetForm = () => {
    //setOrders([]); // Reset order
    setOrderDetails({}); // Reset order details
    setWashType(""); // Reset wash type
    setWashCode(""); // Reset wash code
    setSteps([]); // Reset steps table
    setRecipeProcesses([]); // Reset processes card view
    setWorkspaceItems([]);
    //setLaundrySteps([]); // Reset laundry steps if needed
    setSelectedOrder("");
    setWashDate(null);

    // Reset any other states related to the form
    //setCustomState1("");
    //setCustomState2([]);
  };

  // const handleAddStep = (newStep) => {
  //   setSteps((prevSteps) => [...prevSteps, newStep]); // Append new step
  // };

  const handleAddProcess = (newProcess) => {
    setWorkspaceItems((prev) => [...prev, newProcess]); // Ensure existing processes are preserved
    //setRecipeProcesses([...recipeProcesses, newProcess]);
    setRecipeProcesses((prevProcesses) => [...prevProcesses, newProcess]); // Append process
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return; // Item not dropped in a valid location
    const items = Array.from(workspaceItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sequence after reordering
    items.forEach((item, index) => (item.sequence = index + 1));
    // Update all states
    setWorkspaceItems(items);
    // Split items by type and update respective states
  const stepItems = items.filter(item => item.type === 'step');
  const processItems = items.filter(item => item.type === 'process');
  
  setSteps(stepItems);
  setRecipeProcesses(processItems);
  console.log('handleDragEnd', items, stepItems, processItems);
  console.log('workspaceItems', workspaceItems);
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
    //loadOrders(setSelectedOrder);
    loadOrders();
  }, []);

  // Fetch order details when an order is selected
  const handleOrderChange = async (e) => {
    const orderId = e.target.value;
    setSelectedOrder(orderId);

    try {
      //const response = await axios.get(`/api/orders/${orderId}`);
      //setOrderDetails(response.data);

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

    const invalidStep = steps.find(
      //(step) => !step.stepId || !step.time || !step.temp || !step.liters
      (step) => !step.stepId
    );
    if (invalidStep) {
      //alert(`Step sequence ${invalidStep.sequence} is missing a valid step.`);
      //alert(`Step missing required fields.`);
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
      //console.log("Orders after reset:", orders);
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
  <h1 className="text-2xl font-extrabold text-center text-blue-800 mb-6" style={{ color: hoverColor }}>
    Wash Recipe Form
  </h1>

  {/* Form Fields in a Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white shadow-lg rounded-lg p-6">
    {/* Select Order */}
    <div>
      <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2" style={{ color: currentColor }}>
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
      <label htmlFor="wash-type" className="block text-sm font-medium text-gray-700 mb-2" style={{ color: currentColor }}>
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
      <label htmlFor="wash-code" className="block text-sm font-medium text-gray-700 mb-2" style={{ color: currentColor }}>
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
      <label htmlFor="wash-date" className="block text-sm font-medium text-gray-700 mb-2" style={{ color: currentColor }}>
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ color: currentColor }}>
        Order Details
      </h2>
      <table className="min-w-full bg-white border border-gray-200 table-auto rounded-lg shadow-lg">
        <thead>
          <tr className="bg-blue-600 text-white text-center" style={{ backgroundColor: hoverColor }}>
            <th className="border-b-2 border-gray-200 p-2">Order No</th>
            <th className="border-b-2 border-gray-200 p-2">Style</th>
            <th className="border-b-2 border-gray-200 p-2">Fabric Art</th>
            <th className="border-b-2 border-gray-200 p-2">Key No</th>
            <th className="border-b-2 border-gray-200 p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border text-center">{orderDetails.orderNo}</td>
            <td className="p-2 border text-center">{orderDetails.style?.name}</td>
            <td className="p-2 border text-center">{orderDetails.articleNo}</td>
            <td className="p-2 border text-center">{orderDetails.keyNo}</td>
            <td className="p-2 border text-center">
              {new Date(orderDetails.orderDate).toLocaleDateString() || "N/A"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )}



      {/* Steps Table and Preview */}
      <div className="mt-6">
        {/* Table for adding steps */}
        <StepsTable steps={steps} setSteps={setSteps} setWorkspaceItems={setWorkspaceItems}/>{" "}
        {/* Preview for steps */} {/* Live preview for steps */}
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="workspace" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6"
            >
              {workspaceItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-4 rounded shadow ${
                        item.type === "step" ? "bg-blue-100" : "bg-green-100"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">
                        {item.type === "step" 
                        ? `Step ${item.sequence}: ${item.stepName}` 
                        : `Process ${item.sequence}: ${item.name}`}
                      </h3>
                      <span className="text-sm text-gray-500">#{item.sequence}</span>
                      </div>
                      {item.type === "step" && (
                        <div className="mt-2">
                        <p>Time: {item.time} minutes</p>
                        <p>Temp: {item.temp}°C</p>
                        <p>Liters: {item.liters}</p>
                        {item.chemicals?.length > 0 && (
                          <p>Chemicals: {item.chemicals.length}</p>
                        )}
                      </div>
                      )}
                      {item.type === "process" && <p className="mt-2">Remark: {item.remark}</p>}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
