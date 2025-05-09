import React from "react";

export const Progress = ({ value, max = 100 }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full h-2 bg-gray-200 rounded-lg overflow-hidden">
      <div
        className={`h-full transition-all ${percentage === 100 ? "bg-green-500" : "bg-blue-500"}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};
