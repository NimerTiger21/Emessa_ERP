import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getWashRecipeById } from "../services/washService";
import { useStateContext } from "../contexts/ContextProvider";

import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import { darkenColor } from "../utils/darkenColor";
import { FaRegCheckCircle } from "react-icons/fa";
import { FcProcess } from "react-icons/fc";


const WashRecipeDetails = () => {
  const { id } = useParams();
  const [washRecipe, setWashRecipe] = useState(null);
  const [steps, setSteps] = useState([]);
  const [chemicalsByStep, setChemicalsByStep] = useState({});
  const [processes, setProcesses] = useState([]);
  const [combinedItems, setCombinedItems] = useState([]);

  const { currentColor, washTypeColors } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15); // Slightly darken the color

  useEffect(() => {
    const fetchWashRecipeDetails = async () => {
      try {
        const response = await getWashRecipeById(id);
        const { washRecipe, steps, chemicalsByStep, processes, combinedItems } = response;

        setWashRecipe(washRecipe);
        setSteps(steps);
        setChemicalsByStep(chemicalsByStep);
        setProcesses(processes);
        setCombinedItems(combinedItems);
      } catch (error) {
        console.error("Error fetching wash recipe details:", error);
        toast.error("Failed to fetch wash recipe details.");
      }
    };
    console.log("Combined Items:", combinedItems);

    fetchWashRecipeDetails();
  }, [id]);

  // Prepare nodes and edges for React Flow
  /*const nodes = [
    {
      id: "start",
      type: "input",
      data: { label: "Start Wash Recipe" },
      position: { x: 0, y: 0 },
      style: { background: currentColor, color: "#fff", borderRadius: 10 },
    },
    ...steps
    // .sort((a, b) => a.sequence - b.sequence)
    .map((step, index) => ({
      id: `step-${index}`,
      data: { label: `Step ${index + 1}: ${step.stepId.name}` },
      position: { x: index * 200, y: 100 },
      style: { background: "#1A97F5", color: "#fff", borderRadius: 10 },
    })),
    {
      id: "end",
      type: "output",
      data: { label: "End Wash Recipe" },
      position: { x: steps.length * 200, y: 0 },
      style: { background: "#FF5C8E", color: "#fff", borderRadius: 10 },
    },
  ];

  const edges = [
    ...steps.map((_, index) => ({
      id: `e-start-step-${index}`,
      source: index === 0 ? "start" : `step-${index - 1}`,
      target: `step-${index}`,
      animated: true,
      style: { stroke: currentColor },
    })),
    {
      id: `e-end`,
      source: `step-${steps.length - 1}`,
      target: "end",
      animated: true,
      style: { stroke: "#FF5C8E" },
    },
  ];*/

  const nodes = [
    {
      id: "start",
      type: "input",
      data: { label: "Start" },
      position: { x: 0, y: 0 },
      style: { background: "#5A67D8", color: "#fff", borderRadius: "8px" },
    },
    ...combinedItems?.map((item, index) => ({
      id: `item-${item?._id}`,
      data: {
        label: item?.stepId
          ? `Step ${item?.sequence}: ${item?.stepId?.name}`
          : `Process ${item?.sequence}: ${item?.laundryProcessId?.name}`,
      },
      position: { x: index * 200, y: 100 },
      style: {
        background: item?.stepId ? "#1A97F5" : "#F59E0B", // Blue for steps, yellow for processes
        color: "#fff",
        borderRadius: "8px",
      },
    })),
    {
      id: "end",
      type: "output",
      data: { label: "End" },
      position: { x: combinedItems?.length * 200, y: 0 },
      style: { background: "#FF5C8E", color: "#fff", borderRadius: "8px" },
    },
  ];
  
  const edges = [
    ...combinedItems?.map((_, index) => ({
      id: `e-item-${index}`,
      source: index === 0 ? "start" : `item-${combinedItems[index - 1]?._id}`,
      target: `item-${combinedItems[index]?._id}`,
      animated: true,
      style: { stroke: "#1A97F5" },
    })),
    {
      id: `e-end`,
      source: `item-${combinedItems[combinedItems.length - 1]?._id}`,
      target: "end",
      animated: true,
      style: { stroke: "#FF5C8E" },
    },
  ];
  console.log(washRecipe);

  if (!washRecipe) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800" style={{ color: hoverColor }}>Wash Recipe Details</h1>
        <p className="text-gray-600">Overview of the selected wash recipe.</p>
      </div>

      {/* Wash Recipe and Order Details */}
<div className="mb-6 p-6 bg-white rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ color: currentColor }}>
    Wash Recipe & Order Details
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Wash Recipe Details */}
      <div className="mb-6 p-6 rounded bg-gray-50 border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ color: currentColor }}>Wash Recipe</h2>
        <table className="min-w-full bg-white border border-gray-200 table-auto rounded-lg shadow-lg">
      <thead>
          <tr className="bg-blue-600 text-white text-center" style={{ backgroundColor: hoverColor }}>
          <th className="py-2 px-4 border-b border-gray-200 cursor-pointer border p-2">Wash Code</th>
          <th className="py-2 px-4 border-b border-gray-200 cursor-pointer border p-2">Wash Type</th>
          <th className="py-2 px-4 border-b border-gray-200 cursor-pointer border p-2">Wash Date</th>
        </tr>
      </thead>
      <tbody>
          <td className="py-2 px-4 border text-center">{washRecipe.washCode || "N/A"}</td>
          <td className="py-2 px-4 border text-center"><span
           className={`px-2 py-1 rounded text-sm ${
            washTypeColors[washRecipe.washType] || "bg-gray-100 text-gray-700"
          }`}
          >{washRecipe.washType}</span></td>        
          <td className="py-2 px-4 border text-center">{new Date(washRecipe.date).toLocaleDateString() || "N/A"}</td>
      </tbody>
    </table>
        
      </div>
{/* Order Details */}
<div className="mb-6 p-6 rounded bg-gray-50 border border-gray-200 shadow-sm">
  <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ color: currentColor }}>Order Details</h2>
  {/* <div className="overflow-x-auto"> */}
  <table className="min-w-full bg-white border border-gray-200 table-auto rounded-lg shadow-lg">
      <thead>
        <tr className="bg-blue-600 text-white text-center" style={{ backgroundColor: hoverColor }}>
          <th className="border-b-2 border-gray-200 cursor-pointer border p-2">Order No</th>
          <th className="border-b-2 border-gray-200 cursor-pointer border p-2">style</th>
          <th className="border-b-2 border-gray-200 cursor-pointer border p-2">fabricArt</th>
          {/* <th className="py-2 px-4 border-b border-gray-200">fabricSupplier</th> */}
          <th className="border-b-2 border-gray-200 cursor-pointer border p-2">KeyNo</th>
          {/* <th className="py-2 px-4 border-b border-gray-200">qty</th> */}
          <th className="border-b-2 border-gray-200 cursor-pointer border p-2">Date</th>
        </tr>
      </thead>
      <tbody>
          <td className="p-2 border text-center">{washRecipe.orderId.orderNo}</td>
          <td className="p-2 border text-center">{washRecipe.orderId?.style?.name || "N/A"}</td>
          <td className="p-2 border text-center">{washRecipe.orderId?.articleNo || "N/A"}</td>
          {/* <td className="py-2 px-4">{washRecipe.orderId.fabricSupplier}</td> */}
          <td className="p-2 border text-center">{washRecipe.orderId.keyNo}</td>
          {/* <td className="py-2 px-4">{washRecipe.orderId.qty}</td> */}
          <td className="p-2 border text-center">{new Date(washRecipe.orderId.orderDate).toLocaleDateString() || "N/A"}</td>
      </tbody>
    </table>
  {/* </div> */}
</div>

</div>
</div>
      {/* Steps Visualization */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ color: currentColor }}>
          Steps Visualization
        </h2>
        <div style={{ height: "500px" }} className="rounded-lg shadow-lg p-4">
          <ReactFlow nodes={nodes} edges={edges}>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ color: currentColor }}>Steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <div
            key={step._id}
            className="mb-4 p-6 bg-white rounded-lg shadow-md flex flex-col gap-2 border-l-4 border-blue-500 hover:shadow-lg hover:scale-105 transition-transform duration-300"
          >
            <h3 className="text-lg font-semibold text-blue-700 flex items-center mb-2">
            <span className="mr-2">
            <FaRegCheckCircle className="text-green-500" />
            </span> {/* Example icon */}
              Step {index + 1}: {step.stepId.name}
            </h3>
            <p className="text-sm text-gray-600">
              <strong>⏱ Time:</strong> {step.time} minutes
            </p>
            <p className="text-sm text-gray-600">
              <strong>🌡 Temperature:</strong> {step.temperature}°C
            </p>
            <p className="text-sm text-gray-600">
              <strong>💧Liters:</strong> {step.liters}
            </p>
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                🧪 Chemicals:
                </h4>
            {chemicalsByStep[step._id]?.length > 0 ? (
              <div>
                <ul className="list-none">
                  {chemicalsByStep[step._id].map((chemical, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="block w-2 h-2 bg-indigo-500 rounded-full"></span>
                      {chemical.name} - {chemical.quantity} {chemical.unit}{" "}
                      (Supplier: {chemical.supplier || "N/A"})
                    </li>
                  ))}
                </ul>
              </div>
            ): (
              <p className="text-sm text-gray-600">🚫 No chemicals added for this step</p>
            )}
          </div>
        ))}
      </div>
      </div>

      {/* Processes */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ color: currentColor }}>Processes</h2>
        {processes.length === 0 ? (
          <p className="text-gray-600">🚫 No processes added !</p>
        ) : 
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {processes.map((process) => (
          <div
            key={process._id}
            className="mb-4 p-6 bg-white rounded-lg shadow-md border-l-4 border-green-500"
          >
             <h3 className="text-lg font-semibold text-blue-700 flex items-center">
             <span className="mr-2">
            <FcProcess className="text-green-500" />
            </span> {/* Example icon */}
             {process.laundryProcessId.name}
             </h3>
            <p>
              <strong>Sequence:</strong> {process.sequence}
            </p>
            <p>
              <strong>Process Type: </strong> 
              {process.laundryProcessId.type}
            </p>
            <p>
            <strong>Remark:</strong> {process.remark || "No remarks provided"}
            </p>
          </div>
        ))}
      </div>
        }
    </div>

    <div className="mb-6">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">Steps and Processes</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {combinedItems.map((item, index) => (
      <div
        key={item._id}
        className={`p-4 bg-white rounded shadow-md border-l-4 ${
          item.stepId ? "border-blue-500" : "border-yellow-500"
        }`}
      >
        <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {item.stepId
            ? `Step ${item.sequence}: ${item.stepId.name}`
            : `Process ${item.sequence}: ${item.laundryProcessId.name}`}
        </h3>
        <span className="text-sm text-gray-500">#{item.sequence}</span>
        </div>
        {item.stepId && (
          <>
            <p>⏱ Time: {item.time} minutes</p>
            <p>🌡 Temperature: {item.temperature}°C</p>
            <p>💧 Liters: {item.liters}</p>
            {item.chemicals?.length > 0 && (
              <div className="mt-2">
                <strong>Chemicals:</strong>
                <ul className="list-disc ml-5">
                  {item.chemicals.map((chemical, idx) => (
                    <li key={idx}>
                      {chemical.chemicalItemId.name} - {chemical.quantity}{" "}
                      {chemical.unit}{" "}
                      <span className="italic text-gray-500">
                        (Supplier: {chemical.chemicalItemId.supplier || "N/A"})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        {!item.stepId && (
          <>
            <p>🔄 Type: {item.laundryProcessId.type}</p>
            <p>📝 Remark: {item.remark}</p>
          </>
        )}
      </div>
    ))}
  </div>
</div>
</div>
  );
};

export default WashRecipeDetails;
