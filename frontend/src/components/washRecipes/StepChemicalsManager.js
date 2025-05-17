import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ChemicalEditor from "./ChemicalEditor";
import { useStateContext } from "../../contexts/ContextProvider";
import { darkenColor } from "../../utils/darkenColor";

const StepChemicalsManager = ({ step, updateItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingChemical, setEditingChemical] = useState(null);
  const { currentColor } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15);

  const chemicals = Array.isArray(step.chemicals) ? step.chemicals : [];
  // 1. Call hooks FIRST
  useEffect(() => {
    if (chemicals?.length > 0) setIsExpanded(true);
  }, [chemicals?.length]); // ✅ Safe dependency

  if (!step) return null;

  // 2. Then handle variables/conditionals

  // Ensure chemicals array exists
  //const chemicals = step.chemicals || [];

  // // Ensure chemicals array exists and is properly initialized
  // const chemicals = Array.isArray(step.chemicals) ? step.chemicals : [];

  // // Automatically expand if there are chemicals
  // useEffect(() => {
  //   if (chemicals.length > 0) {
  //     setIsExpanded(true);
  //   }
  // }, [chemicals.length]);

  // const handleRemoveChemical = (chemicalId) => {
  //   // Filter out the chemical to be removed
  //   const updatedChemicals = chemicals.filter(
  //     (chemical) => chemical.id !== chemicalId
  //   );

  //   // Update the step with the new chemicals list
  //   updateItem(step.id, { chemicals: updatedChemicals });
  //   toast.success("Chemical removed successfully");
  // };

  const handleRemoveChemical = (chemicalId) => {
    const updatedChemicals = chemicals.filter((chem) => {
      // Keep only chemicals that don't match the ID
      // Also ensure we don't filter out chemicals without IDs (new ones)
      return !chemicalId || chem.id !== chemicalId;
    });

    updateItem(step.id, { chemicals: updatedChemicals });
    toast.success("Chemical removed successfully");
  };

  const handleEditChemical = (chemical) => {
    setEditingChemical(chemical);
  };

  const handleSaveChemical = (updatedChemical) => {
    // Find the index of the chemical being edited
    const chemicalIndex = chemicals.findIndex(
      (chem) => chem.id === updatedChemical.id
    );

    if (chemicalIndex === -1) {
      toast.error("Chemical not found");
      return;
    }

    // Create a new array with the updated chemical
    const updatedChemicals = [...chemicals];
    updatedChemicals[chemicalIndex] = updatedChemical;

    // Update the step with the new chemicals list
    updateItem(step.id, { chemicals: updatedChemicals });
    toast.success("Chemical updated successfully");

    // Exit edit mode
    setEditingChemical(null);
  };

  const handleCancelEdit = () => {
    setEditingChemical(null);
  };

  return (
    <div className="mt-2 w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
      >
        <span className="font-medium">
          {chemicals.length} Chemical{chemicals.length !== 1 ? "s" : ""}
        </span>
        <span className="text-blue-600">
          {isExpanded ? "▲ Hide" : "▼ Show"}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2 border border-gray-200 rounded-md p-4 bg-white">
          {editingChemical ? (
            <ChemicalEditor
              chemical={editingChemical}
              onSave={handleSaveChemical}
              onCancel={handleCancelEdit}
            />
          ) : chemicals.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Chemicals List</h4>
              <div className="max-h-48 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chemicals.map((chemical) => (
                      <tr
                        key={chemical.id || `temp-${Math.random()}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          {chemical.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {chemical.quantity} {chemical.unit}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                          {chemical.notes || "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditChemical(chemical)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              style={{ color: currentColor }}
                              onMouseOver={(e) =>
                                (e.target.style.color = hoverColor)
                              }
                              onMouseOut={(e) =>
                                (e.target.style.color = currentColor)
                              }
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveChemical(chemical.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-2">
              No chemicals added yet
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StepChemicalsManager;
