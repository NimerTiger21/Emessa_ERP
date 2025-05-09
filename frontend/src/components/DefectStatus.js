// src/components/DefectStatus.js
import React, { useState } from "react";
import axios from "../services/api";

const DefectStatus = ({ defectId, currentStatus, assignedTo }) => {
  const [status, setStatus] = useState(currentStatus);
  const [assignee, setAssignee] = useState(assignedTo || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/defects/${defectId}/status`, { status, assignedTo: assignee });
      alert("Defect status updated successfully");
    } catch (error) {
      alert("Error updating defect status");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-gray-700 font-semibold">Status:</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
      </select>

      <label className="block text-gray-700 font-semibold">Assign To:</label>
      <input
        type="text"
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      />

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
      >
        Update Status
      </button>
    </form>
  );
};

export default DefectStatus;
