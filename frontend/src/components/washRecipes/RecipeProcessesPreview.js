import React from "react";
import { Trash2, Copy, Edit } from "lucide-react";

const ProcessPreview = ({ recipeProcesses, onDeleteProcess, onCloneProcess, onEditProcess }) => {
  if (!recipeProcesses.length) {
    return (
      <p className="text-center text-gray-500 text-lg mt-4">
        🚫 No processes added yet. Add some processes to get started!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {recipeProcesses.map((process, index) => (
        <div
          key={process.id}
          className="mb-4 p-4 bg-white rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
        >
          {/* Process Header */}
          <h4 className="text-xl font-bold text-indigo-800 bg-indigo-100 py-2 px-4 rounded-lg text-center mb-4 shadow-sm">
            {process.sequence}. {process.name}
          </h4>
          
          {/* Process Content */}
          <div className="space-y-2">
            <p className="text-gray-800 text-sm">
              <span className="font-semibold text-indigo-600">📝 Remark:</span>{" "}
              <span className="text-gray-700">{process.remark}</span>
            </p>
            <p className="text-gray-800 text-sm">
              <span className="font-semibold text-indigo-600">
                🔄 Process Type:
              </span>{" "}
              {process.processType}
            </p>
          </div>
          
          {/* Action Buttons - Appear on hover */}
          <div className="absolute top-0 right-0 p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => onCloneProcess(process)}
              className="p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
              title="Clone process"
            >
              <Copy size={16} />
            </button>
            <button 
              onClick={() => onEditProcess(process)}
              className="p-1.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-200 shadow-md hover:shadow-lg"
              title="Edit process"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => onDeleteProcess(process.id)}
              className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 shadow-md hover:shadow-lg"
              title="Delete process"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          {/* Animated bottom indicator for hover state */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </div>
      ))}
    </div>
  );
};

export default ProcessPreview;