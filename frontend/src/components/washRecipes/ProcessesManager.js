import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import ProcessPreview from "./RecipeProcessesPreview";
import RecipeProcessModal from "./RecipeProcessModal";
import { toast } from "react-toastify";

const ProcessesManager = ({ processes, updateProcesses }) => {
    console.log("ProcessesManager processes:", processes);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const openProcessModal = () => {
    setEditingProcess(null);
    setIsProcessModalOpen(true);
  };

  const closeProcessModal = () => {
    setIsProcessModalOpen(false);
    setEditingProcess(null);
  };

  const handleAddProcess = (newProcess, isEditing = false) => {
    let updatedProcesses;

    if (isEditing) {
      // If editing, replace the existing process
      updatedProcesses = processes.map(process => 
        process.id === newProcess.id ? newProcess : process
      );
    } else {
      // For new processes, add sequence number
      const sequence = processes.length + 1;
      updatedProcesses = [...processes, { ...newProcess, sequence }];
    }

    // Update process list
    updateProcesses(updatedProcesses);
  };

  const handleDeleteProcess = (processId) => {
    // Ask for confirmation
    if (!window.confirm("Are you sure you want to delete this process?")) {
      return;
    }
    
    // Filter out the process with the given ID
    const filteredProcesses = processes.filter(process => process.id !== processId);
    
    // Resequence the remaining processes
    const resequencedProcesses = filteredProcesses.map((process, index) => ({
      ...process,
      sequence: index + 1
    }));
    
    // Update the processes list
    updateProcesses(resequencedProcesses);
    toast.success("Process deleted successfully!");
  };

  const handleCloneProcess = (processToClone) => {
    // Create a deep copy of the process
    const clonedProcess = {
      ...processToClone,
      id: `process-${Date.now()}`, // New unique ID
      sequence: processes.length + 1, // Add at the end
      remark: `${processToClone.remark} (Copy)` // Indicate it's a copy
    };
    
    // Add to process list
    updateProcesses([...processes, clonedProcess]);
    toast.success("Process cloned successfully!");
  };

  const handleEditProcess = (process) => {
    setEditingProcess(process);
    setIsProcessModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
      {/* Header with toggle */}
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </span>
          Process Steps
        </h3>
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openProcessModal();
            }}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-lg mr-4 flex items-center hover:from-green-500 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Plus size={18} className="mr-1" />
            Add Process
          </button>
          {isExpanded ? (
            <ChevronUp className="text-gray-500" />
          ) : (
            <ChevronDown className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Content (collapsible) */}
      {isExpanded && (
        <div className="mt-4">
          <ProcessPreview 
            recipeProcesses={processes} 
            onDeleteProcess={handleDeleteProcess}
            onCloneProcess={handleCloneProcess}
            onEditProcess={handleEditProcess}
          />
        </div>
      )}

      {/* Process Modal */}
      <RecipeProcessModal
        isOpen={isProcessModalOpen}
        onClose={closeProcessModal}
        onAddProcess={handleAddProcess}
        editingProcess={editingProcess}
      />
    </div>
  );
};

export default ProcessesManager;