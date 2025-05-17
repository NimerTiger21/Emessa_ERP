import { useEffect, useState } from "react";
import { fetchLaundrySteps } from "../../services/laundryStepService";
import ChemicalModal from "../washRecipes/ChemicalModal";
import { useStateContext } from "../../contexts/ContextProvider";
import { darkenColor } from "../../utils/darkenColor";
import { toast } from "react-toastify";

const StepsTable = ({ steps, addItem, removeItem, updateItem }) => {
  const [laundrySteps, setLaundrySteps] = useState([]);
  const { currentColor } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15); // Slightly darken the color

  const [isChemicalModalOpen, setIsChemicalModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);

  //console.log("Steps:", steps);

  // Utility function
  // function getStepIdValue(step) {
  //   if (!step.stepId) return "";
  //   if (typeof step.stepId === "string") return step.stepId;
  //   if (typeof step.stepId === "object" && step.stepId._id) return step.stepId._id;
  //   return "";
  // }

  // Updated getStepIdValue function for StepsTable.js
  // Replace the current function with this version

  function getStepIdValue(step) {
    // If step has been normalized, use stepId directly
    if (step.stepId && typeof step.stepId === "string") {
      return step.stepId;
    }

    // For backward compatibility with non-normalized data
    if (!step.stepId) return "";
    if (typeof step.stepId === "object" && step.stepId._id)
      return step.stepId._id;

    return "";
  }

  // Open the modal for the selected step
  const openChemicalModal = (step) => {
    if (!step.stepId) {
      toast.error("Please select a valid step before adding chemicals.");
      return;
    }
    // Make sure we're storing the complete step object with the proper ID
    //console.log("Selected Step:", step); // stepId:"677104598bbb3e4eee7780ce" | stepName:"towel random permanaganate فوط برمنجانات"
    //console.log("Selected Step ID:", step.stepId); //677104598bbb3e4eee7780ce
    setSelectedStep(step);
    setIsChemicalModalOpen(true);
  };

  const closeChemicalModal = () => {
    setSelectedStep(null);
    setIsChemicalModalOpen(false);
  };

  // Updated handleChemicalAdded function for StepsTable.js
  // Replace the current function with this version

  const handleChemicalAdded = (stepId, newChemical) => {
    // Find the step to update using the consistent id property
    const stepToUpdate = steps.find((step) => step.id === selectedStep.id);

    if (!stepToUpdate) {
      toast.error("Could not find the step to add chemical to");
      return;
    }

    // Create new chemicals array
    const updatedChemicals = [
      ...(stepToUpdate.chemicals || []),
      {
        ...newChemical,
        id: `chemical-${Date.now()}-${Math.random()}`, // Ensure unique ID
      },
    ];

    // Update the step with new chemicals
    updateItem(stepToUpdate.id, { chemicals: updatedChemicals });
  };

  useEffect(() => {
    const loadLaundrySteps = async () => {
      try {
        const response = await fetchLaundrySteps();
        setLaundrySteps(response);
        //console.log("Laundry Steps:", response);
      } catch (error) {
        console.error("Error fetching laundry steps:", error);
      }
    };
    loadLaundrySteps();
  }, []);

  const handleAddStep = () => {
    // Validate the last step before adding a new one
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      if (!lastStep.stepId || lastStep.stepId === "") {
        toast.error("Please select a valid step before adding another.");
        return;
      }
    }

    // Add the new step
    const newStep = {
      stepId: "", // Start with empty stepId
      type: "step",
      time: 0,
      temp: 0,
      liters: 0,
      chemicals: [], // Initialize chemicals as an empty array
    };

    addItem(newStep, "step");
  };

  // Updated handleStepChange function for StepsTable.js
  // Replace the current function with this version

  const handleStepChange = (stepId, field, value) => {
    // Find the step to update using the normalized id
    const stepToUpdate = steps.find((step) => step.id === stepId);

    if (!stepToUpdate) {
      toast.error("Step not found");
      return;
    }

    // Validation
    if (field === "stepId" && !value) {
      toast.error("Please select a valid step!");
      return;
    }

    // Numeric field validation
    if (["time", "temp", "liters"].includes(field)) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        toast.error(`Invalid ${field} value`);
        return;
      }
    }

    // Special handling for stepId to get step name
    if (field === "stepId") {
      const selectedStep = laundrySteps.find(
        (laundryStep) => laundryStep._id === value
      );
      if (selectedStep) {
        // Update both stepId and stepName
        updateItem(stepId, {
          stepId: value,
          stepName: selectedStep.name,
        });
      }
    } else {
      // For other fields
      const processedValue = ["time", "temp", "liters"].includes(field)
        ? parseFloat(value) || 0
        : value;

      updateItem(stepId, { [field]: processedValue });
    }
  };

  const handleRemoveStep = (stepId) => {
    removeItem(stepId);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4" style={{ color: currentColor }}>
        Steps
      </h2>
      <table className="table-auto w-full border border-gray-300 rounded-lg shadow-lg">
        <thead>
          <tr
            style={{ backgroundColor: currentColor, color: "white" }}
            className="text-center"
          >
            <th className="cursor-pointer border p-2">Step</th>
            <th className="cursor-pointer border p-2">Time</th>
            <th className="cursor-pointer border p-2">Temp</th>
            <th className="cursor-pointer border p-2">Liters</th>
            <th className="cursor-pointer border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, index) => (
            <tr
              key={step.id + index}
              className="hover:bg-blue-50 transition-colors"
            >
              {console.log("nimer=> ", step)}
              <td className="border p-2 text-center">
                <select
                  //value={step.stepId._id || ""}
                  //value={step.stepId || ""}
                  value={getStepIdValue(step)}
                  onChange={(e) => {
                    const selectedStepId = e.target.value;
                    if (!selectedStepId) {
                      toast.error("Please select a valid step.");
                      return;
                    }
                    handleStepChange(step.id, "stepId", selectedStepId);
                  }}
                  className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Step</option>
                  {laundrySteps.map((laundryStep, index) => (
                    <option
                      key={laundryStep._id + index}
                      value={laundryStep._id}
                    >
                      {laundryStep.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border p-2 text-center">
                <input
                  type="number"
                  value={step.time}
                  onChange={(e) =>
                    handleStepChange(step.id, "time", e.target.value)
                  }
                  className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Minutes"
                  min="0"
                  step="1"
                />
              </td>
              <td className="border p-2 text-center">
                <input
                  type="number"
                  value={step.temp}
                  onChange={(e) =>
                    handleStepChange(step.id, "temp", e.target.value)
                  }
                  className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="°C"
                />
              </td>
              <td className="border p-2 text-center">
                <input
                  type="number"
                  value={step.liters}
                  onChange={(e) =>
                    handleStepChange(step.id, "liters", e.target.value)
                  }
                  className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Liters"
                  min="0"
                />
              </td>
              <td className="border p-2 text-center space-y-2 space-x-2">
                {/* Add Chemicals Button */}
                <button
                  onClick={() => openChemicalModal(step)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  style={{
                    backgroundColor: currentColor,
                    hover: { backgroundColor: hoverColor },
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = hoverColor)
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = currentColor)
                  }
                >
                  Add Chemicals
                </button>
                {/* Delete Button */}
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Chemical Modal */}
      {isChemicalModalOpen && (
        <ChemicalModal
          isOpen={isChemicalModalOpen}
          onClose={closeChemicalModal}
          step={selectedStep}
          onChemicalAdded={handleChemicalAdded}
        />
      )}
      {/* Add Step Button */}
      <button
        onClick={handleAddStep}
        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
      >
        Add Step
      </button>
    </div>
  );
};

export default StepsTable;
