import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";
import { darkenColor } from "../../utils/darkenColor";

const ChemicalEditor = ({ chemical, onSave, onCancel }) => {
  const [editedChemical, setEditedChemical] = useState({ ...chemical });
  const { currentColor } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15);

  // Common units for chemicals
  const unitOptions = ["g", "kg", "ml", "L", "%", "oz", "lb"];

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for quantity to ensure it's a number
    if (name === "quantity") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setEditedChemical({ ...editedChemical, [name]: numValue });
      } else if (value === "") {
        // Allow empty string during typing
        setEditedChemical({ ...editedChemical, [name]: value });
      }
    } else {
      setEditedChemical({ ...editedChemical, [name]: value });
    }
  };

  // Handle save
  const handleSave = () => {
    // Validation
    if (!editedChemical.name || editedChemical.name.trim() === "") {
      toast.error("Chemical name is required");
      return;
    }

    if (
      editedChemical.quantity === "" ||
      isNaN(parseFloat(editedChemical.quantity)) ||
      parseFloat(editedChemical.quantity) < 0
    ) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!editedChemical.unit) {
      toast.error("Unit is required");
      return;
    }

    // Ensure quantity is a number before saving
    const finalChemical = {
      ...editedChemical,
      quantity: parseFloat(editedChemical.quantity),
    };

    onSave(finalChemical);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: currentColor }}
      >
        Edit Chemical
      </h3>

      <div className="space-y-4">
        {/* Chemical Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chemical Name:
          </label>
          <input
            type="text"
            name="name"
            value={editedChemical.name || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter chemical name"
          />
        </div>

        {/* Quantity and Unit in same row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity:
            </label>
            <input
              type="number"
              name="quantity"
              value={editedChemical.quantity}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit:
            </label>
            <select
              name="unit"
              value={editedChemical.unit || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Unit</option>
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes/Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional):
          </label>
          <textarea
            name="notes"
            value={editedChemical.notes || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional information about this chemical"
            rows="2"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-white rounded transition-colors"
            style={{ backgroundColor: currentColor }}
            onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
            onMouseOut={(e) => (e.target.style.backgroundColor = currentColor)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChemicalEditor;
