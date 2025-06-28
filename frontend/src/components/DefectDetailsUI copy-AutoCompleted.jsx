// DefectDetailsUI.js - Save this as a separate component file
import React, { useState } from 'react';
import { MdAdd, MdRemove, MdDelete, MdWarning, MdCheckCircle } from 'react-icons/md';

const DefectDetailsUI = ({ 
  defectName, 
  defectType, 
  totalCount, 
  onDetailsChange,
  defectPlaces = [],
  defectProcesses = [],
  disabled = false,
  initialDetails = [] // For edit mode
}) => {
  const [details, setDetails] = useState(initialDetails);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDetail, setNewDetail] = useState({
    defectPlace: '',
    defectProcess: '',
    count: 1
  });

  // Calculate total from details
  const detailsTotal = details.reduce((sum, detail) => sum + detail.count, 0);
  const isBalanced = detailsTotal === totalCount;
  const hasExcess = detailsTotal > totalCount;
  const hasDeficit = detailsTotal < totalCount;

  // Filter processes based on selected place
  const getAvailableProcesses = (placeId) => {
    if (!placeId) return [];
    return defectProcesses.filter(process => process.place._id === placeId);
  };

  // Get place name by ID
  const getPlaceName = (placeId) => {
    return defectPlaces.find(p => p._id === placeId)?.name || '';
  };

  // Get process name by ID
  const getProcessName = (processId) => {
    return defectProcesses.find(p => p._id === processId)?.name || '';
  };

  const addDetail = () => {
    if (!newDetail.defectPlace || !newDetail.defectProcess || newDetail.count < 1) {
      return;
    }

    const detail = {
      id: Date.now(), // Temporary ID for UI
      defectPlace: newDetail.defectPlace,
      defectProcess: newDetail.defectProcess,
      count: newDetail.count,
      placeName: getPlaceName(newDetail.defectPlace),
      processName: getProcessName(newDetail.defectProcess)
    };

    const updatedDetails = [...details, detail];
    setDetails(updatedDetails);
    setNewDetail({ defectPlace: '', defectProcess: '', count: 1 });
    setShowAddForm(false);
    
    // Notify parent component
    onDetailsChange(updatedDetails);
  };

  const removeDetail = (id) => {
    const updatedDetails = details.filter(detail => detail.id !== id);
    setDetails(updatedDetails);
    onDetailsChange(updatedDetails);
  };

  const updateDetailCount = (id, newCount) => {
    if (newCount < 1) return;
    
    const updatedDetails = details.map(detail => 
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
    const firstProcess = defectProcesses.find(p => p.place._id === firstPlace._id);
    
    if (firstProcess) {
      const detail = {
        id: Date.now(),
        defectPlace: firstPlace._id,
        defectProcess: firstProcess._id,
        count: totalCount,
        placeName: firstPlace.name,
        processName: firstProcess.name
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
          <p className="text-sm text-gray-600">Break down defects by specific locations and processes</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
          isBalanced 
            ? 'bg-green-100 text-green-800' 
            : hasExcess
            ? 'bg-red-100 text-red-800'
            : 'bg-orange-100 text-orange-800'
        }`}>
          {isBalanced ? (
            <MdCheckCircle className="h-4 w-4" />
          ) : (
            <MdWarning className="h-4 w-4" />
          )}
          <span>{detailsTotal} / {totalCount}</span>
        </div>
      </div>

      {/* Summary Status */}
      <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
        isBalanced 
          ? 'bg-green-50 border border-green-200' 
          : hasExcess
          ? 'bg-red-50 border border-red-200'
          : 'bg-orange-50 border border-orange-200'
      }`}>
        {isBalanced ? (
          <MdCheckCircle className="text-green-600 h-6 w-6" />
        ) : hasExcess ? (
          <MdWarning className="text-red-600 h-6 w-6" />
        ) : (
          <MdWarning className="text-orange-600 h-6 w-6" />
        )}
        <span className="text-sm">
          {isBalanced ? 'Details are balanced.' : hasExcess ? 'Excess defects detected.' : 'Deficit in defect count.'}
        </span>
      </div>
      {/* Details Table */}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Place</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Process</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Count</th>
              {!disabled && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {details.map(detail => (
              <tr key={detail.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{detail.placeName}</td>
                <td className="px-4 py-2">{detail.processName}</td>
                <td className="px-4 py-2">
                  {disabled ? (
                    detail.count
                  ) : (
                    <input
                      type="number"
                      value={detail.count}
                      min="1"
                      onChange={(e) => updateDetailCount(detail.id, parseInt(e.target.value))}
                      className="w-full border rounded px-2 py-1"
                    />
                  )}
                </td>
                {!disabled && (
                  <td className="px-4 py-2 text-right">
                    <button 
                      onClick={() => removeDetail(detail.id)} 
                      className="text-red-600 hover:text-red-800"
                    >
                      <MdDelete />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add New Detail Form */}
      {!disabled && (
        <div className="mb-4">
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            {showAddForm ? <MdRemove className="mr-2" /> : <MdAdd className="mr-2" />}
            Add Detail
          </button>
          {showAddForm && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Defect Place</label>
                <select 
                  value={newDetail.defectPlace} 
                  onChange={(e) => setNewDetail({ ...newDetail, defectPlace: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Place</option>
                  {defectPlaces.map(place => (
                    <option key={place._id} value={place._id}>{place.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Defect Process</label>
                <select 
                  value={newDetail.defectProcess} 
                  onChange={(e) => setNewDetail({ ...newDetail, defectProcess: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Process</option>
                  {getAvailableProcesses(newDetail.defectPlace).map(process => (
                    <option key={process._id} value={process._id}>{process.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                <input 
                  type="number" 
                  value={newDetail.count} 
                  min="1" 
                  onChange={(e) => setNewDetail({ ...newDetail, count: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <button 
                onClick={addDetail} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <MdAdd className="inline-block mr-2" />
                Add Detail
              </button>
            </div>
          )}
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={quickFillRemaining} 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Quick Fill Remaining
            </button>
            <button 
              onClick={resetDetails} 
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Reset Details
            </button>
            <button 
              onClick={quickFillAll} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Quick Fill All
            </button>
          </div>
        </div>
      )}
      {disabled && (
        <div className="text-sm text-gray-500">
          Details are locked for this defect.
        </div>
      )}
    </div>
  );
}
export default DefectDetailsUI;