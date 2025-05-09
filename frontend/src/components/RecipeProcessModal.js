import React, { useEffect, useState } from "react";
import { fetchLaundryProcesses } from "../services/laundryProcessService";
import { toast } from "react-toastify";

const RecipeProcessModal = ({ isOpen, onClose, onAddProcess }) => {
  const [sequence, setSequence] = useState("");
  const [remark, setRemark] = useState("");
  const [laundryProcessId, setLaundryProcessId] = useState("");
  const [processType, setProcessType] = useState("");
  const [laundryProcesses, setLaundryprocesses] = useState([]);

  // Fetch predefined laundry processes
  useEffect(() => {
    const loadLaundryprocesses = async () => {
      try {
        const response = await fetchLaundryProcesses();
        setLaundryprocesses(response);
      } catch (error) {
        console.error("Error fetching laundry processes:", error);
      }
    };
    loadLaundryprocesses();
  }, []);

  // Handle laundry process change
  const handleLaundryProcessChange = (id) => {
    setLaundryProcessId(id);

    // Find the selected laundry process
    const selectedProcess = laundryProcesses.find(
      (process) => process._id === id
    );
    if (selectedProcess) {
      setProcessType(selectedProcess.type); // e.g., DRY PROCESS or SPRAY PROCESS
    }
  };

  // Add process
  const handleAddProcess = (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    if (sequence && remark && laundryProcessId) {
      const selectedProcess = laundryProcesses.find(
        (process) => process._id === laundryProcessId
      );
      const newProcess = {
        id: `process-${Date.now()}`, // Ensure unique ID for drag-and-drop
        sequence: parseInt(sequence),
        remark,
        laundryProcessId,
        processType: selectedProcess?.type || "",
        name: selectedProcess?.name || "", // Include process name
        type: "process",
      };
      onAddProcess(newProcess); // Add process to parent state
      console.log("Processes:", newProcess);

      // Reset modal fields // Reset form //resets its fields only after ensuring the new process is successfully added to the parent state.
      setSequence("");
      setRemark("");
      setLaundryProcessId("");
      setProcessType("");
    } else {
      toast.error("Please fill all fields before adding a process.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">Add Recipe Process</h2>
        <form onSubmit={handleAddProcess}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Sequence:</label>
            <input
              type="number"
              min="1"
              step="1"
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="Enter sequence number"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Remark:</label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter remark"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Laundry Process:
            </label>
            <select
              value={laundryProcessId}
              //onChange={(e) => setLaundryProcessId(e.target.value)}
              onChange={(e) => handleLaundryProcessChange(e.target.value)}
              className="w-full p-2 border rounded"
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
          <div>
            <strong>Process Type:</strong> <span>{processType || "N/A"}</span>
          </div>
          {/* <button onClick={handleAddProcess}>Add Process</button> */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Process
          </button>
          <button
            type="button"
            className="bg-gray-600 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecipeProcessModal;
