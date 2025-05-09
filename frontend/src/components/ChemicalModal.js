import React, { useState, useEffect } from "react";
import { fetchChemicalItems } from './../services/chemicalItemService';

const ChemicalModal = ({ isOpen, onClose, step, onChemicalAdded }) => {
  const [chemicalItems, setChemicalItems] = useState([]);
  const [selectedChemical, setSelectedChemical] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState(""); // State for error message

  const isFormValid = !error && unit && selectedChemical && quantity; // Add conditions for other fields if necessary

  // Add validation for the step
  useEffect(() => {
    if (!step?.stepId) {
      setError("Invalid step selected");
      return;
    }
  }, [step]);

  useEffect(() => {
    const loadChemicalItems = async () => {
      try {
        const response = await fetchChemicalItems();
        setChemicalItems(response);
      } catch (error) {
        console.error("Error fetching chemical items:", error);
      }
    };

    loadChemicalItems();
  }, []);

  const handleAddChemical = async () => {
    //console.log("step before adding chemical: ", step);
    // Check if the unit is selected
    if (!selectedChemical) {
      setError("Please select a chemical value."); // Set error message
      return; // Stop further execution
    }
    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }
    if (!unit) {
      setError("Please select a unit."); // Set error message
      return; // Stop further execution
    }
    if (!step?.stepId) {
      setError("Invalid step selected");
      return;
    }
    try {
      const selectedChemicalItem = chemicalItems.find(
        (chem) => chem._id === selectedChemical
      );
        /*
      const newStepItem = {
        recipeItemId: step._id || step.stepId, // Use step._id if available, fallback to step.stepId
        chemicalItemId: selectedChemical,
        quantity,
        unit,
      };
      console.error("response newChemical: ", newStepItem);
      const response = await addStepItem(newStepItem);
      console.error("response chemical: ", response);
      onChemicalAdded(response.stepItem); // Pass the data back to the parent component
*/
    const newChemical = {
        id: `chemical-${Date.now()}-${Math.random()}`, // Ensure unique ID
        chemicalItemId: selectedChemical,
        quantity: parseFloat(quantity),
        unit,
        name: selectedChemicalItem?.name || "Unknown Chemical", // Get the name for display
        stepId: step.stepId // Include the step ID for verification
      };

      // Add logic to save the newStepItem in the database if required

      onChemicalAdded(step.stepId, newChemical, step.id); // Pass the data back to the parent component | Ensure that chemicals are associated with steps using step.stepId.
      // Reset form
      setSelectedChemical("");
      setQuantity("");
      setUnit("");
      onClose();
      setError(""); // Clear error when a unit is selected
    } catch (error) {
      console.error("Error adding chemical:", error);
      setError("Failed to add chemical");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">Add Chemical</h2>
        <div className="mb-4">
          <label>Chemical:</label>
          <select
            value={selectedChemical}
            onChange={(e) => setSelectedChemical(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Chemical</option>
            {chemicalItems.map((chemical) => (
              <option key={chemical._id} value={chemical._id}>
                {chemical.name}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
        </div>
        <div className="mb-4">
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Enter quantity"
            min="0"
            step="1"
            required
          />
        </div>
        <div className="mb-4">
          <label>Unit:</label>
          <select
            id="unit"
            name="unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Enter unit"
            required
            pattern="[a-zA-Z]+"
            title="Unit should only contain alphabetic characters."
            minLength="1"
            maxLength="20"
          >
            <option value="" disabled>Select unit</option>
          <option value="Kilogram">Kilogram</option>
          <option value="Liters">Liters</option>
          <option value="Gram">Gram</option>
          <option value="Piece">Piece</option>
          </select>
          {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
        </div>

        <button
          disabled={!isFormValid}
          onClick={handleAddChemical}
          className={`px-4 py-2 rounded ${
            isFormValid ? "bg-blue-500 text-white" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Add Chemical
        </button>
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChemicalModal;
