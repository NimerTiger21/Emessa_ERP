import React from "react";
/**
 * @param 
 * Sample Styling (TailwindCSS)
    Colors for Progress
        Red (bg-red-500): Indicates low progress (0-33%).
        Yellow (bg-yellow-500): Indicates medium progress (34-66%).
        Green (bg-green-500): Indicates high progress (67-100%).} param0 
 * @returns 
 */
const ProgressBar = ({ progress, currentStage }) => {
    const stages = ["Fabric Reservation", "Cutting", "Stitching", "Finishing", "Completed"];
  // Determine progress bar color based on the percentage
  const getColor = (progress) => {
    if (progress < 33) return "bg-red-500"; // Low progress
    if (progress < 66) return "bg-yellow-500"; // Medium progress
    return "bg-green-500"; // High progress
  };

  return (
    <div className="w-full">
      <div className="text-sm font-medium text-gray-600 mb-2">{currentStage}</div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`h-full rounded-full ${getColor(progress)}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-right text-xs text-gray-600 mt-1">{progress}%</div>
    </div>
  );
};

export default ProgressBar;
