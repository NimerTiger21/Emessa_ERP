import React from "react";
import { CSS } from '@dnd-kit/utilities';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

const StepsPreview = ({ id, item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  console.log("StepsPreview", item);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded shadow ${
        item?.type === "step" ? "bg-blue-100" : "bg-green-100"
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">
          {item?.type === "step" 
            ? `Step ${item?.sequence}: ${item?.stepName}` 
            : `Process ${item?.sequence}: ${item?.name}`
          }
        </h3>
        <span className="text-sm text-gray-500">#{item?.sequence}</span>
      </div>
      {item?.type === "step" && (
        <div className="mt-2">
          <p>Time: {item?.time} minutes</p>
          <p>Temp: {item?.temp}°C</p>
          <p>Liters: {item?.liters}</p>
          {item.chemicals?.length > 0 && (
            <p>Chemicals: {item?.chemicals.length}</p>
          )}
        </div>
      )}
      {item?.type === "process" && <p className="mt-2">Remark: {item?.remark}</p>}
    </div>
  );
};


export default StepsPreview;
