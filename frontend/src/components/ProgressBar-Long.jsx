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
        const calculateProgress = (stage) => {
            const stageMapping = {
              "Fabric Reservation": 0,
              "Cutting": 25,
              "Stitching": 50,
              "Finishing": 75,
              "Completed": 100,
            };
            return stageMapping[stage] || 0;
          };
          
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
      <div className="flex items-center justify-between w-full">
        {stages.map((stage, index) => (
          <div
            key={index}
            className={`w-1/5 text-xs text-center ${
              stage === currentStage ? "text-green-600 font-bold" : "text-gray-500"
            }`}
          >
            {stage}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
        <div
          className="h-full rounded-full bg-green-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-right text-xs text-gray-600 mt-1">{progress}%</div>
    </div>
  );
};

export default ProgressBar;
