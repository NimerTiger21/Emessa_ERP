import React from "react";

const StepsPreview = ({ steps }) => {
  if (!steps.length) {
    return (
      <p className="text-gray-500 text-center text-lg mt-4">
        🚫 No steps added yet. Start building your recipe!
      </p>
    );
  }
  
  // Utility function
  function getStepIdValue(step) {
    if (!step.stepId) return "";
    if (typeof step.stepId === "string") return step.stepName;
    if (typeof step.stepId === "object" && step.stepId._id)
      return step.stepId.name;
    return "";
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-blue-800">Steps Preview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="border border-blue-300 bg-blue-50 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            {/* Card Header */}
            <h3 className="text-xl font-bold mb-4 text-blue-800 bg-blue-200 py-2 px-4 rounded-lg text-center">
              Step {index + 1}: {getStepIdValue(step)}
            </h3>
            {/* Card Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-3 shadow-sm">
                <div className="text-center">
                  <p className="text-xs text-gray-500">⏱ Time</p>
                  <p className="font-semibold text-blue-600">{step.time} min</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">🌡 Temperature</p>
                  <p className="font-semibold text-blue-600">{step.temp}°C</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500"> 💧 Volume</p>
                  <p className="font-semibold text-blue-600">{step.liters} L</p>
                </div>
              </div>
              
              {/* Chemicals Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-700 mb-2 border-b pb-1">
                  🧪 Chemicals
                </h4>
                {step.chemicals && step.chemicals.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {step.chemicals.map((chemical, idx) => (
                      <div
                        key={chemical.id || idx}
                        className="flex justify-between items-center p-2 rounded-md bg-gray-50 border-l-4 border-blue-400"
                      >
                        <span className="font-medium text-gray-700">
                          {chemical.name}
                        </span>
                        <span className="text-sm text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded-full">
                          {chemical.quantity} {chemical.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center text-sm">
                    No chemicals added for this step
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsPreview;