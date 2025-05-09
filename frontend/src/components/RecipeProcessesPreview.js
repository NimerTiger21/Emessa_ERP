import React from "react";

const ProcessPreview = ({ recipeProcesses }) => {
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
          key={process.id+index}
          className="mb-4 p-4 bg-white rounded shadow border-l-4 border-green-500"
        >
          <h4 className="text-xl font-bold text-indigo-800 bg-indigo-200 py-2 px-4 rounded-lg text-center mb-4">
            {process.sequence}. {process.name}
          </h4>
          <div className="space-y-2">
            <p className="text-gray-800 text-sm">
              <span className="font-semibold text-indigo-600">📝 Remark:</span>{" "}
              <span className="text-gray-700">{process.remark}</span>
            </p>
            <p className="text-gray-800 text-sm">
              <span className="font-semibold text-indigo-600 🔍">
                🔄 Process Type:
              </span>{" "}
              {process.processType}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProcessPreview;
