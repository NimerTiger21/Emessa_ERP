// src/components/DefectResolution.js
import React, { useState } from "react";
import axios from "../services/api";

const DefectResolution = ({ defectId }) => {
  const [actionTaken, setActionTaken] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/defects/${defectId}/resolution`, { actionTaken, verifiedBy });
      alert("Resolution details added successfully");
    } catch (error) {
      alert("Error adding resolution details");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-gray-700 font-semibold">Action Taken:</label>
      <textarea
        value={actionTaken}
        onChange={(e) => setActionTaken(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded"
      />

      <label className="block text-gray-700 font-semibold">Verified By:</label>
      <input
        type="text"
        value={verifiedBy}
        onChange={(e) => setVerifiedBy(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded"
      />

      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
      >
        Add Resolution
      </button>
    </form>
  );
};

export default DefectResolution;
