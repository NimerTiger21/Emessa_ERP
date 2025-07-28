// DefectDetailsUI.jsx - Complete implementation
import React, { useState, useEffect } from "react";
import {
  MdAdd,
  MdRemove,
  MdDelete,
  MdWarning,
  MdCheckCircle,
  MdLocationOn,
  MdBuild,
} from "react-icons/md";

const DefectDetailsUI = ({
  defectName,
  defectType,
  totalCount,
  onDetailsChange,
  defectPlaces = [],
  defectProcesses = [],
  disabled = false,
  initialDetails = [], // For edit mode
}) => {
  // console.log("DefectDetailsUI rendered with:", {
  //   defectName,
  //   defectType,
  //   totalCount,
  //   defectPlaces,
  //   defectProcesses,
  //   disabled,
  //   initialDetails,
  // });
  const [details, setDetails] = useState(initialDetails);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDetail, setNewDetail] = useState({
    defectPlace: "",
    defectProcess: "",
    count: 1,
  });

  // Update details when initialDetails prop changes (for edit mode)
  useEffect(() => {
    if (initialDetails && initialDetails.length > 0) {
      setDetails(initialDetails);
    }
  }, [initialDetails]);

  // Calculate total from details
  const detailsTotal = details.reduce((sum, detail) => sum + detail.count, 0);
  // console.log("Details total:", detailsTotal, "Type:", typeof detailsTotal);
  // console.log("Total Count:", totalCount, "Type:", typeof totalCount);
  // console.log("Double equals:", detailsTotal == totalCount); // loose equality
  // console.log("Triple equals:", detailsTotal === totalCount); // strict equality
  const isBalanced = detailsTotal === totalCount;
  // const isBalanced = Number(detailsTotal) === Number(totalCount);
  const hasExcess = detailsTotal > totalCount;
  const hasDeficit = detailsTotal < totalCount;

  // Filter processes based on selected place
  const getAvailableProcesses = (placeId) => {
    if (!placeId) return [];
    return defectProcesses.filter((process) => process.place._id === placeId);
  };

  // Get place name by ID
  const getPlaceName = (placeId) => {
    return defectPlaces.find((p) => p._id === placeId)?.name || "";
  };

  // Get process name by ID
  const getProcessName = (processId) => {
    return defectProcesses.find((p) => p._id === processId)?.name || "";
  };

  const addDetail = () => {
    if (
      !newDetail.defectPlace ||
      !newDetail.defectProcess ||
      newDetail.count < 1
    ) {
      return;
    }

    const detail = {
      id: Date.now(), // Temporary ID for UI
      defectPlace: newDetail.defectPlace,
      defectProcess: newDetail.defectProcess,
      count: newDetail.count,
      placeName: getPlaceName(newDetail.defectPlace),
      processName: getProcessName(newDetail.defectProcess),
    };

    const updatedDetails = [...details, detail];
    setDetails(updatedDetails);
    setNewDetail({ defectPlace: "", defectProcess: "", count: 1 });
    setShowAddForm(false);

    // Notify parent component
    onDetailsChange(updatedDetails);
  };

  const removeDetail = (id) => {
    const updatedDetails = details.filter((detail) => detail.id !== id);
    setDetails(updatedDetails);
    onDetailsChange(updatedDetails);
  };

  const updateDetailCount = (id, newCount) => {
    if (newCount < 1) return;

    const updatedDetails = details.map((detail) =>
      detail.id === id ? { ...detail, count: newCount } : detail
    );
    setDetails(updatedDetails);
    onDetailsChange(updatedDetails);
  };

  const quickFillRemaining = () => {
    const remaining = totalCount - detailsTotal;
    if (remaining > 0 && details.length > 0) {
      const lastDetail = details[details.length - 1];
      updateDetailCount(lastDetail.id, lastDetail.count + remaining);
    }
  };

  const resetDetails = () => {
    setDetails([]);
    onDetailsChange([]);
  };

  // Auto-fill with single detail if user wants simple entry
  const quickFillAll = () => {
    if (!defectPlaces.length || !defectProcesses.length) return;

    const firstPlace = defectPlaces[0];
    const firstProcess = defectProcesses.find(
      (p) => p.place._id === firstPlace._id
    );

    if (firstProcess) {
      const detail = {
        id: Date.now(),
        defectPlace: firstPlace._id,
        defectProcess: firstProcess._id,
        count: totalCount,
        // count: Number(totalCount), // Force conversion here | The issue where you're seeing 06 instead of 6
        placeName: firstPlace.name,
        processName: firstProcess.name,
      };

      const updatedDetails = [detail];
      setDetails(updatedDetails);
      onDetailsChange(updatedDetails);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-800">Defect Location Details</h4>
          <p className="text-sm text-gray-600">
            Break down defects by specific locations and processes
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
            isBalanced
              ? "bg-green-100 text-green-800"
              : hasExcess
              ? "bg-red-100 text-red-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {isBalanced ? (
            <MdCheckCircle className="h-4 w-4" />
          ) : (
            <MdWarning className="h-4 w-4" />
          )}
          <span>
            {detailsTotal} / {totalCount}
          </span>
        </div>
      </div>

      {/* Summary Status */}
      <div
        className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
          isBalanced
            ? "bg-green-50 border border-green-200"
            : hasExcess
            ? "bg-red-50 border border-red-200"
            : "bg-orange-50 border border-orange-200"
        }`}
      >
        {isBalanced ? (
          <MdCheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <MdWarning className="h-5 w-5 text-orange-600" />
        )}
        <div className="flex-1">
          {isBalanced && (
            <p className="text-green-800 text-sm font-medium">
              ✓ Details match total count perfectly
            </p>
          )}
          {hasExcess && (
            <p className="text-red-800 text-sm font-medium">
              Details exceed total count by {detailsTotal - totalCount}
            </p>
          )}
          {hasDeficit && (
            <p className="text-orange-800 text-sm font-medium">
              {totalCount - detailsTotal} defects remaining to allocate
            </p>
          )}
        </div>

        {/* Quick Action Buttons */}
        {hasDeficit && details.length > 0 && (
          <button
            type="button"
            onClick={quickFillRemaining}
            className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded hover:bg-orange-300"
            disabled={disabled}
          >
            Fill Remaining
          </button>
        )}
      </div>

      {/* Quick Fill Options */}
      {details.length === 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm mb-2">Quick start options:</p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={quickFillAll}
              className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded hover:bg-blue-300"
              disabled={
                disabled || !defectPlaces.length || !defectProcesses.length
              }
            >
              Fill All in One Location
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
              disabled={disabled}
            >
              Add Details Manually
            </button>
          </div>
        </div>
      )}

      {/* Existing Details List */}
      {details.length > 0 && (
        <div className="mb-4">
          <div className="space-y-2">
            {details.map((detail) => (
              <div
                key={detail.id}
                className="flex items-center space-x-3 p-3 bg-white border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <MdLocationOn className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{detail.placeName}</span>
                    <MdBuild className="h-4 w-4 text-gray-500" />
                    <span>{detail.processName}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateDetailCount(detail.id, detail.count - 1)
                    }
                    className="p-1 rounded-full hover:bg-gray-100"
                    disabled={disabled || detail.count <= 1}
                  >
                    <MdRemove className="h-4 w-4 text-gray-600" />
                  </button>

                  <span className="w-8 text-center font-medium">
                    {detail.count}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateDetailCount(detail.id, detail.count + 1)
                    }
                    className="p-1 rounded-full hover:bg-gray-100"
                    disabled={disabled}
                  >
                    <MdAdd className="h-4 w-4 text-gray-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeDetail(detail.id)}
                    className="p-1 rounded-full hover:bg-red-100 text-red-600"
                    disabled={disabled}
                  >
                    <MdDelete className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              disabled={disabled}
            >
              <MdAdd className="h-4 w-4" />
              <span>Add Another Location</span>
            </button>

            <button
              type="button"
              onClick={resetDetails}
              className="text-sm text-red-600 hover:text-red-800"
              disabled={disabled}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Add New Detail Form */}
      {showAddForm && (
        <div className="border-t pt-4">
          <h5 className="font-medium text-gray-800 mb-3">
            Add New Location Detail
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Defect Place
              </label>
              <select
                value={newDetail.defectPlace}
                onChange={(e) =>
                  setNewDetail({
                    ...newDetail,
                    defectPlace: e.target.value,
                    defectProcess: "", // Reset process when place changes
                  })
                }
                className="w-full p-2 border border-gray-300 rounded text-sm"
                disabled={disabled}
              >
                <option value="">Select Place</option>
                {defectPlaces.map((place) => (
                  <option key={place._id} value={place._id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Defect Process
              </label>
              <select
                value={newDetail.defectProcess}
                onChange={(e) =>
                  setNewDetail({ ...newDetail, defectProcess: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded text-sm"
                disabled={disabled || !newDetail.defectPlace}
              >
                <option value="">Select Process</option>
                {getAvailableProcesses(newDetail.defectPlace).map((process) => (
                  <option key={process._id} value={process._id}>
                    {process.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Count
              </label>
              <input
                type="number"
                min="1"
                max={totalCount}
                value={newDetail.count}
                onChange={(e) =>
                  setNewDetail({
                    ...newDetail,
                    count: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded text-sm"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addDetail}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              disabled={
                disabled ||
                !newDetail.defectPlace ||
                !newDetail.defectProcess ||
                newDetail.count < 1
              }
            >
              Add Detail
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewDetail({ defectPlace: "", defectProcess: "", count: 1 });
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              disabled={disabled}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          💡 <strong>Tip:</strong> Details help track exactly where defects
          occur. The total count of all details must match your defect count (
          {totalCount}).
        </p>
      </div>
    </div>
  );
};

export default DefectDetailsUI;
