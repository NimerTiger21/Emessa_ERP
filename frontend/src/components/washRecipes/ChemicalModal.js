import React, { useState, useEffect } from "react";
import { fetchChemicalItems } from "../../services/chemicalItemService";

const ChemicalModal = ({ isOpen, onClose, step, onChemicalAdded }) => {
  const [chemicalItems, setChemicalItems] = useState([]);
  const [selectedChemical, setSelectedChemical] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid = selectedChemical && quantity > 0 && unit;

  // Effect for step validation
  useEffect(() => {
    if (!step?.stepId) {
      setError("Invalid step selected");
      return;
    }
    setError("");
  }, [step]);

  // Effect for loading chemical items
  useEffect(() => {
    const loadChemicalItems = async () => {
      try {
        setLoading(true);
        const response = await fetchChemicalItems();
        setChemicalItems(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chemical items:", error);
        setError("Failed to load chemicals");
        setLoading(false);
      }
    };

    loadChemicalItems();
  }, []);

  // Filter chemicals based on search term
  const filteredChemicals = chemicalItems.filter((chemical) =>
    chemical.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddChemical = () => {
    // Validate inputs
    if (!selectedChemical) {
      setError("Please select a chemical");
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!unit) {
      setError("Please select a unit");
      return;
    }

    if (!step?.stepId) {
      setError("Invalid step selected");
      return;
    }

    try {
      const selectedChemicalItem = chemicalItems.find(
        (chem) => chem._id === selectedChemical
      );

      const newChemical = {
        id: `chemical-${Date.now()}-${Math.random()}`,
        chemicalItemId: selectedChemicalItem?._id,
        quantity: parseFloat(quantity),
        unit,
        name: selectedChemicalItem?.name || "Unknown Chemical",
        stepId: step.stepId,
      };
      //console.log("Adding chemical:", newChemical);

      onChemicalAdded(step.stepId, newChemical, step.id);

      // Reset form
      setSelectedChemical("");
      setQuantity("");
      setUnit("");
      setSearchTerm("");
      setError("");
      onClose();
    } catch (error) {
      console.error("Error adding chemical:", error);
      setError("Failed to add chemical");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">
            Add Chemical to Step
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Step Information */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Adding chemical to:</p>
          <p className="font-medium text-blue-700">
            {step?.stepName || "Selected Step"}
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Chemicals:
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search..."
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Chemical Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Chemical:
          </label>
          <select
            value={selectedChemical}
            onChange={(e) => {
              setSelectedChemical(e.target.value);
              setError("");
            }}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Chemical</option>
            {loading ? (
              <option disabled>Loading chemicals...</option>
            ) : (
              filteredChemicals.map((chemical) => (
                <option key={chemical._id} value={chemical._id}>
                  {chemical.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Quantity Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity:
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError("");
            }}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter quantity"
            min="0.1"
            step="0.1"
          />
        </div>

        {/* Unit Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit:
          </label>
          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setError("");
            }}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select unit</option>
            <option value="Kilogram">Kilogram</option>
            <option value="Liters">Liters</option>
            <option value="Gram">Gram</option>
            <option value="Piece">Piece</option>
            <option value="ml">ml</option>
            <option value="mg">mg</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddChemical}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-md transition-colors ${
              isFormValid
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Add Chemical
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChemicalModal;
