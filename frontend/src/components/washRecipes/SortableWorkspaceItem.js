import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableWorkspaceItem({ item }) {
  //console.log("SortableWorkspaceItem", item);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });
  //console.log("SortableWorkspaceItem", item);
    // Utility function

    // ! Edit
// function getStepIdValue(step) {
//   //console.log("getStepIdValue", step); 
//   if (!step.stepId) return "";
//   if (typeof step.stepId === "string") return step.stepId;
//   if (typeof step.stepId === "object" && step.stepId._id) return step.stepId.name;
//   return "";
// }

// ! Create Form
// function getStepIdValue(step) {
//     if (!step.stepId) return "";
//     if (typeof step.stepId === "string") return step.stepName || step.stepId;
//     if (typeof step.stepId === "object" && step.stepId._id) return step.stepId.name || "";
//     return "";
//   }

// Updated getStepIdValue function for SortableWorkspaceItem.js
// Replace the current function with this version

function getStepIdValue(step) {
  // For normalized data, use stepName directly
  if (step.stepName) {
    return step.stepName;
  }
  
  // For backward compatibility with non-normalized data
  if (!step.stepId) return "";
  if (typeof step.stepId === "string") return step.stepName || step.stepId;
  if (typeof step.stepId === "object" && step.stepId._id) return step.stepId.name || "";
  
  return "";
}

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none', // Prevents scrolling on touch devices while dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded shadow ${
        item.type === "step" ? "bg-blue-100" : "bg-green-100"
      } cursor-grab`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">
          {item.type === "step"
            // ? `Step ${item.sequence}: ${item.stepName}` // value={getStepIdValue(step)}
            ? `Step ${item.sequence}: ${getStepIdValue(item)}` // value={getStepIdValue(step)}
            : `Process ${item.sequence}: ${item.name}`}
        </h3>
        <span className="text-sm text-gray-500">
          #{item.sequence}
        </span>
      </div>
      {item.type === "step" && (
        <div className="mt-2">
          <p>Time: {item.time} minutes</p>
          <p>Temp: {item.temp}°C</p>
          <p>Liters: {item.liters}</p>
          {item.chemicals?.length > 0 && (
            <p>Chemicals: {item.chemicals.length}</p>
          )}
        </div>
      )}
      {item.type === "process" && (
        <p className="mt-2">Remark: {item.remark}</p>
      )}
    </div>
  );
}