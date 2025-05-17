import React, { useState } from "react";
import { toast } from "react-toastify";

const StepChemicalsManager = ({ step, updateItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!step) return null;
  
  // Ensure chemicals array exists
  const chemicals = step.chemicals || [];
  
  const handleRemoveChemical = (chemicalId) => {
    // Filter out the chemical to be removed
    const updatedChemicals = chemicals.filter(
      (chemical) => chemical.id !== chemicalId
    );
    
    // Update the step with the new chemicals list
    updateItem(step.id, { chemicals: updatedChemicals });
    toast.success("Chemical removed successfully");
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
          {chemicals.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Chemicals List</h4>
              <div className="max-h-48 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chemicals.map((chemical) => (
                      <tr key={chemical.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap">{chemical.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {chemical.quantity} {chemical.unit}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleRemoveChemical(chemical.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Remove
                          </button>
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