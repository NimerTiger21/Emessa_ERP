import React from "react";

const StepsPreview = ({ steps }) => {
  if (!steps.length) {
    return (
      <p className="text-gray-500 text-center text-lg mt-4">
        🚫 No steps added yet. Start building your recipe!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {steps.map((step, index) => (
        <div
          key={step.id+index}
          // className="mb-4 p-4 bg-white rounded shadow border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300"
          className="border border-blue-300 bg-blue-50 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          {/* Card Header */}
          <h3 className="text-xl font-bold mb-4 text-blue-800 bg-blue-200 py-2 px-4 rounded-lg text-center">
            Step {index + 1}: {step.stepName}
          </h3>
          {/* Card Details */}
          <div className="space-y-2">
            <p className="text-gray-800">
              <span className="font-semibold text-blue-600">⏱ Time:</span>{" "}
              {step.time} min
            </p>
            <p className="text-gray-800">
              <span className="font-semibold text-blue-600">
                🌡 Temperature:
              </span>{" "}
              {step.temp}°C
            </p>
            <p className="text-gray-800">
              <span className="font-semibold text-blue-600">💧 LR:</span>{" "}
              {step.liters}
            </p>
            <p className="text-gray-800">
              <span className="font-semibold text-blue-600">🧪 Chemicals:</span>
            </p>
            {/* Chemicals */}
            {step.chemicals && step.chemicals.length > 0 ? (
              <ul className="list-disc ml-6 space-y-1">
                {step.chemicals.map((chemical, idx) => (
                  <li
                    key={idx}
                    className="text-gray-700 flex items-center space-x-2"
                  >
                    <span>•</span>
                    <span className="font-medium">
                      {chemical.name} - {chemical.quantity} {chemical.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No chemicals added yet.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepsPreview;
