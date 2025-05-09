import { useEffect, useState } from "react";
import { fetchLaundrySteps } from "./../services/laundryStepService";
import ChemicalModal from "./ChemicalModal";
import { useStateContext } from "../contexts/ContextProvider";
import { darkenColor } from "../utils/darkenColor";
import { toast } from "react-toastify";

const StepsTable = ({ steps, setSteps, setWorkspaceItems }) => {
  const [laundrySteps, setLaundrySteps] = useState([]);
  const { currentColor } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15); // Slightly darken the color

  const [isChemicalModalOpen, setIsChemicalModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);

  // Open the modal for the selected step
  const openChemicalModal = (step) => {
    if (!step.stepId) {
      toast.error("Please select a valid step before adding chemicals.");
      return;
    }
    // Verify this step exists in our steps array
  const stepExists = steps.some(s => s.stepId === step.stepId);
  if (!stepExists) {
    toast.error("Invalid step selected");
    return;
  }
    setSelectedStep(step);
    setIsChemicalModalOpen(true);
  };
  const closeChemicalModal = () => {
    setSelectedStep(null);
    setIsChemicalModalOpen(false);
  };

  const handleChemicalAdded = (stepId, newChemical, stepInstanceId) => {
    // First verify we have the correct step
  const stepIndex = steps.findIndex(step => step.stepId === stepId && step.id === stepInstanceId);
  if (stepIndex === -1) {
    toast.error("Could not find the step to add chemical to");
    return;
  }
  // Create new arrays to avoid mutation
  const updatedSteps = [...steps];
  const targetStep = { ...updatedSteps[stepIndex] };

  // Initialize or update chemicals array
  targetStep.chemicals = targetStep.chemicals || []; // Ensure chemicals array is updated immutably
  targetStep.chemicals = [...targetStep.chemicals, {
    ...newChemical,
    id: `chemical-${Date.now()}-${Math.random()}` // Ensure unique ID
  }];

   // Update the step in our steps array
   updatedSteps[stepIndex] = targetStep;

   // Update steps state
  setSteps(updatedSteps);

    // Update workspaceItems state, ensuring we only update the correct step
  setWorkspaceItems(prevItems => 
    prevItems.map(item => {
      if (item.type === "step" && item.stepId === stepId && item.id === stepInstanceId) {
        return {
          ...item,
          chemicals: targetStep.chemicals
        };
      }
      return item;
    })
  );
  };

  useEffect(() => {
    const loadLaundrySteps = async () => {
      try {
        const response = await fetchLaundrySteps();
        setLaundrySteps(response);
      } catch (error) {
        console.error("Error fetching laundry steps:", error);
      }
    };
    loadLaundrySteps();
  }, []);

  //*********************************************************************************************************************** */
  const handleAddStep = () => {
    // Validate the last step before adding a new one
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      if (!lastStep.stepId || lastStep.stepId === "") {
        toast.error("Please select a valid step before adding another.");
        return;
      }
    }

    // Check for duplicate steps
    if (steps.find((step) => step.stepId === steps.stepId)) {
      toast.error("This step is already added.");
      return;
    }

    // Calculate the next sequence number based on existing steps
    const maxSequence = Math.max(...steps.map((step) => step.sequence), 0);
    const nextSequence = maxSequence + 1;

    // Add to handleAddStep before creating newStep
    if (steps.some((step) => step.sequence === nextSequence)) {
      toast.error("Sequence number conflict. Please try again.");
      return;
    }

    // Add the new step to the steps array
    const newStep = {
      id: `step-${Date.now()}`, // Ensure unique ID for drag-and-drop
      stepId: steps.stepId, // Selected step from dropdown
      stepName: steps.stepName, // Step name from dropdown
      type: "step",
      time: 0,
      temp: 0,
      liters: 0,
      //sequence: steps.length + 1,
      sequence: nextSequence,
      chemicals: [], // Initialize chemicals as an empty array
    };
    // Update the steps state, Add the new step to the steps array | Append the placeholder step to the steps array
    setSteps((prevSteps) => [...prevSteps, newStep]);
    //setWorkspaceItems((prev) => [...prev, newStep]);
    setWorkspaceItems((prevItems) => {
      // Filter out any items with the same sequence
      const filteredItems = prevItems.filter(
        (item) => item.sequence !== nextSequence
      );
      return [...filteredItems, newStep];
    });
    setSelectedStep(null); // // Reset the dropdown selection
  };
  //***********************************************************************************************************************
  const handleStepChange = (index, field, value) => {
    // Add at the start of handleStepChange
    if (field === "stepId" && !value) {
      toast.error("Please select a valid step!");
      return;
    }
    // Add to handleStepChange for numeric fields
    if (["time", "temp", "liters"].includes(field)) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        toast.error(`Invalid ${field} value`);
        return;
      }
    }
    // Create a copy of steps array to avoid mutating the original state
    const updatedSteps = [...steps];

    // Handle special case for stepId
    if (field === "stepId") {
      const selectedStep = laundrySteps.find((step) => step._id === value); // Get the step name from the dropdown
      if (selectedStep) {
        updatedSteps[index] = {
          ...updatedSteps[index],
          stepId: value,
          stepName: selectedStep.name,
        };
      }
    } else {
      // For other fields, convert to number if needed
      const processedValue = ["time", "temp", "liters"].includes(field)
        ? parseFloat(value) || 0
        : value;
      updatedSteps[index][field] = processedValue;
    }

    setSteps(updatedSteps);

    // Update workspaceItems while preserving other items
    setWorkspaceItems((prevItems) => {
      return prevItems.map((item) => {
        if (
          item.type === "step" &&
          item.sequence === updatedSteps[index].sequence
        ) {
          return { ...item, ...updatedSteps[index] };
        }
        return item;
      });
    });
  };

  const handleRemoveStep = (index) => {
    // Identify the step to be removed
    const stepToRemove = steps[index];

    // Remove the step and update sequences // Filter out the removed step and resequence remaining steps
    const updatedSteps = steps
      .filter((_, idx) => idx !== index)
      .map((step, newIdx) => ({
        ...step,
        sequence: newIdx + 1, // Resequence remaining steps // Reassign sequence numbers
      }));

    // Update the steps state
    setSteps(updatedSteps);

    // Update workspaceItems
    setWorkspaceItems((prevItems) => {
      // Remove the step from workspaceItems // Filter out the removed step from workspaceItems
      const filteredItems = prevItems.filter(
        (item) =>
          !(item.type === "step" && item.sequence === stepToRemove.sequence && item.stepId === stepToRemove.stepId)
      );

      // Resequence remaining step items while preserving process items
      return filteredItems.map((item) => {
        if (item.type === "step") {
          // Find the updated step with the same ID
          const stepIndex = updatedSteps.findIndex(
            (step) => step.id === item.id
          );
          return {
            ...item,
            sequence: stepIndex + 1, // Update sequence number based on new index
          };
        }
        return item; // Return process items unchanged
      });
    });
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
            <th className="cursor-pointer border p-2">Sequence</th>
            <th className="cursor-pointer border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, index) => (
            <tr key={index} className="hover:bg-blue-50 transition-colors">
              <td className="border p-2 text-center">
                <select
                  value={step.stepId || ""}
                  //onChange={(e) => handleStepChange(index, "stepId", e.target.value)}
                  onChange={(e) => {
                    const selectedStepId = e.target.value;
                    if (!selectedStepId) {
                      toast.error("Please select a valid step.");
                      return;
                    }
                    handleStepChange(
                      index,
                      "stepId",
                      selectedStepId,
                    );
                  }}
                  className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Step</option>
                  {laundrySteps.map((laundryStep, index) => (
                    <option key={laundryStep._id+index} value={laundryStep._id}>
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
                    handleStepChange(
                      index,
                      "time",
                      e.target.value,                    )
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
                    handleStepChange(
                      index,
                      "temp",
                      e.target.value,                    )
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
                    handleStepChange(
                      index,
                      "liters",
                      e.target.value,                    )
                  }
                  className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Liters"
                  min="0"
                />
              </td>
              <td className="border p-2 text-center">{step.sequence}</td>
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
                  onClick={() => handleRemoveStep(index)}
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
