import React, { useEffect, useState } from "react";
import { fetchLaundryProcesses } from "../../services/laundryProcessService";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const RecipeProcessModal = ({ isOpen, onClose, onAddProcess, editingProcess = null }) => {
  const [remark, setRemark] = useState("");
  const [laundryProcessId, setLaundryProcessId] = useState("");
  const [processType, setProcessType] = useState("");
  const [laundryProcesses, setLaundryProcesses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [processId, setProcessId] = useState(null);

  // Fetch laundry processes on load
  useEffect(() => {
    const loadProcesses = async () => {
      try {
        const response = await fetchLaundryProcesses();
        setLaundryProcesses(response);
      } catch (error) {
        console.error("Error fetching laundry processes:", error);
        toast.error("Failed to load laundry processes.");
      }
    };
    loadProcesses();
  }, []);

  // Handle editing process data
  useEffect(() => {
    if (editingProcess) {
      setRemark(editingProcess.remark || "");
      setLaundryProcessId(editingProcess.laundryProcessId || "");
      setProcessType(editingProcess.processType || "");
      setProcessId(editingProcess.id);
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [editingProcess]);

  const handleLaundryProcessChange = (id) => {
    setLaundryProcessId(id);

    const selected = laundryProcesses.find((p) => p._id === id);
    if (selected) {
      setProcessType(selected.type);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!laundryProcessId || !remark) {
      toast.error("Please fill all required fields.");
      return;
    }

    const selectedProcess = laundryProcesses.find(
      (p) => p._id === laundryProcessId
    );

    const processData = {
      name: selectedProcess?.name || "",
      remark,
      laundryProcessId,
      processType: selectedProcess?.type || "",
      type: "process",
      // ⚠️ No sequence — this will be set in the parent component
    };

    if (isEditing && processId) {
      // If editing, include the ID
      processData.id = processId;
      onAddProcess(processData, true); // Pass true to indicate editing
      toast.success("Process updated successfully!");
    } else {
      // If adding new, generate a new ID
      processData.id = `process-${Date.now()}`;
      onAddProcess(processData, false);
      toast.success("Process added successfully!");
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setRemark("");
    setLaundryProcessId("");
    setProcessType("");
    setProcessId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 transform scale-100 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-indigo-700">
            {isEditing ? "Edit Process" : "Add Recipe Process"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remark:</label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter remark"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Laundry Process:
            </label>
            <select
              value={laundryProcessId}
              onChange={(e) => handleLaundryProcessChange(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              required
            >
              <option value="">Select Laundry Process</option>
              {laundryProcesses.map((process) => (
                <option key={process._id} value={process._id}>
                  {process.name} ({process.type})
                </option>
              ))}
            </select>
          </div>

          {processType && (
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 mb-4">
              <span className="font-medium text-indigo-700">Process Type:</span>{" "}
              <span className="text-indigo-600">{processType}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isEditing ? "Update Process" : "Add Process"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeProcessModal;