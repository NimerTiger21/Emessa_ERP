import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getWashRecipeById } from "../services/washService";
import { useStateContext } from "../contexts/ContextProvider";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
} from "reactflow";
//import ReactTooltip from "react-tooltip";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import "reactflow/dist/style.css";

const WashRecipeDetails = () => {
  const { id } = useParams(); // Get wash recipe ID from the URL
  const [washRecipe, setWashRecipe] = useState(null);
  const [steps, setSteps] = useState([]);
  const [chemicalsByStep, setChemicalsByStep] = useState({});
  const [processes, setProcesses] = useState([]);

  const { currentColor, washTypeColors } = useStateContext();

  useEffect(() => {
    const fetchWashRecipeDetails = async () => {
      try {
        const response = await getWashRecipeById(id);
        const { washRecipe, steps, chemicalsByStep, processes } = response;

        setWashRecipe(washRecipe);
        setSteps(steps);
        setChemicalsByStep(chemicalsByStep);
        setProcesses(processes);
      } catch (error) {
        console.error("Error fetching wash recipe details:", error);
        toast.error("Failed to fetch wash recipe details.");
      }
    };

    fetchWashRecipeDetails();
  }, [id]);

  // Prepare nodes and edges for React Flow
  const nodes = [
    {
      id: "start",
      type: "input",
      data: { label: "Start Wash Recipe" },
      position: { x: 0, y: 0 },
      style: { background: "#03C9D7", color: "#fff", borderRadius: 10 },
    },
    ...steps.map((step, index) => ({
      id: `step-${index}`,
      data: { label: `Step ${index + 1}: ${step.stepId.name}`,
      tooltip: `Time: ${step.time} min, Temp: ${step.temp}°C, Liters: ${step.liters}`,
     },
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
      style: { stroke: "#03C9D7" },
    })),
    {
      id: `e-end`,
      source: `step-${steps.length - 1}`,
      target: "end",
      animated: true,
      style: { stroke: "#FF5C8E" },
    },
  ];

  if (!washRecipe) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Wash Recipe Details */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Wash Recipe</h2>
        <p><strong>Wash Code:</strong> {washRecipe.washCode}</p>
        <p><strong>Wash Type:</strong>
        <span
            className={`px-2 py-1 rounded text-sm ${washTypeColors[washRecipe.washType] || "bg-gray-100 text-gray-700"}`}
            > 
         {washRecipe.washType}
         </span>
         </p>
         <p><strong>Wash Date:</strong> {new Date(washRecipe.date).toLocaleDateString()}</p>
      </div>

      {/* Order Details */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Order Details</h2>
        <p><strong>Order No:</strong> {washRecipe.orderId.orderNo}</p>
        <p><strong>Order Season:</strong> {washRecipe.orderId.season}</p>
        <p><strong>Style:</strong> {washRecipe.orderId.style}</p>
        <p><strong>Fabric Article:</strong> {washRecipe.orderId.fabricArt}</p>
        <p><strong>Fabric Supplier:</strong> {washRecipe.orderId.fabricSupplier}</p>
        <p><strong>Key Number:</strong> {washRecipe.orderId.keyNo}</p>
        <p><strong>Quantity:</strong> {washRecipe.orderId.qty}</p>
        <p><strong>Date:</strong> {washRecipe.orderId.date}</p>
      </div>

      {/* Steps Visualization */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Steps Visualization</h2>
        <div style={{ height: "500px" }}>
          <ReactFlow nodes={nodes} edges={edges}>
            <MiniMap />
            <Controls />
            <Background />
            {/* Attach data-tip and data-for attributes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              data-tip
              data-for={node.id} // Link to Tooltip ID
              style={{
                position: "absolute",
                top: node.position.y,
                left: node.position.x,
              }}
            >
              {node.data.label}
            </div>
          ))}
          </ReactFlow>
          {/* Render Tooltip */}
          {nodes.map((node) => (
        <Tooltip
        id={node.id} // Match the Tooltip ID with data-for
        key={node.id}
        place="top"
        effect="solid"
        content= "Tiger"//{node.data.tooltip} // Pass tooltip content directly
        style={{ maxWidth: "200px" }}
      />
      ))}
        </div>
      </div>

      {/* Steps */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Steps</h2>
        {steps.map((step, index) => (
          <div key={step._id} className="mb-4 p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold text-blue-700">Step {index + 1}: {step.stepId.name}</h3>
            <p><strong>Time:</strong> {step.time} minutes</p>
            <p><strong>Temperature:</strong> {step.temperature}°C</p>
            <p><strong>Liters:</strong> {step.liters}</p>
            {/* Chemicals Used */}
            {chemicalsByStep[step._id]?.length > 0 ? (
              <div>
                <h4 className="text-md font-semibold text-gray-700">Chemicals:</h4>
                <ul className="list-disc ml-5">
                  {chemicalsByStep[step._id].map((chemical, idx) => (
                    <li key={idx}>
                      {chemical.name} - {chemical.quantity} {chemical.unit} (Supplier: {chemical.supplier || "N/A"})
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500">No chemicals used.</p>
            )}
          </div>
        ))}
      </div>

      {/* Processes */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Processes</h2>
        {processes.map((process) => (
          <div key={process._id} className="mb-4 p-4 bg-white rounded shadow">
            <p><strong>Sequence:</strong> {process.sequence}</p>
            <p><strong>Remark:</strong> {process.remark}</p>
            <p><strong>Process:</strong> {process.laundryProcessId.name} ({process.laundryProcessId.type})</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WashRecipeDetails;
