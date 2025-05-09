import React, { useState, useEffect } from "react";
import {
  fetchFabricSuppliers,
  fetchCompositionItems,
  createFabric,
  updateFabric,
} from "../services/masterDataService";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { toast } from "react-toastify";
import { FiX, FiTrash2, FiAlertCircle, FiPlus, FiSave } from "react-icons/fi";

const FabricModal = ({ closeModal, editFabric, refreshFabricList }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    color: "",
    supplier: "",
    compositions: [],
  });

  const [suppliers, setSuppliers] = useState([]);
  const [compositionItems, setCompositionItems] = useState([]);
  const [selectedComposition, setSelectedComposition] = useState("");
  const [percentage, setPercentage] = useState("");
  const [warning, setWarning] = useState("");

  // Fetch dropdown data
  useEffect(() => {
    fetchFabricSuppliers().then(setSuppliers);
    fetchCompositionItems().then(setCompositionItems);
  }, []);

  // Populate data if editing
  useEffect(() => {
    if (editFabric) {
      setFormData({
        name: editFabric.name,
        code: editFabric.code,
        color: editFabric.color,
        supplier: editFabric.supplier?._id || "",
        compositions: editFabric.fabricCompositions.map((comp) => ({
          compositionCode: comp.compositionItem._id,
          compositionName: comp.compositionItem.name,
          value: comp.value,
        })),
      });
    }
  }, [editFabric]);

  // Calculate total composition percentage
  const totalPercentage = formData.compositions.reduce(
    (sum, comp) => sum + parseInt(comp.value),
    0
  );

  // Add composition with limit check
  const addComposition = () => {
    if (!selectedComposition || !percentage) {
      return toast.error(
        "Please select a composition and enter a valid percentage."
      );
    }

    // Check if the composition already exists
    const isDuplicate = formData.compositions.some(
        (comp) => comp.compositionCode === selectedComposition
      );
      if (isDuplicate) {
        return toast.error("This composition is already added.");
      }

    const newTotal = totalPercentage + parseInt(percentage);

    if (newTotal > 100) {
      setWarning("Total composition cannot exceed 100%.");
      return;
    }

    const selectedCompItem = compositionItems.find(
      (item) => item._id === selectedComposition
    );
    if (selectedCompItem) {
      setFormData((prev) => ({
        ...prev,
        compositions: [
          ...prev.compositions,
          {
            compositionCode: selectedComposition,
            compositionName: selectedCompItem.name,
            value: percentage,
          },
        ],
      }));
    }

    // Clear inputs
    setSelectedComposition("");
    setPercentage("");
    setWarning(""); // Clear warning if valid
  };

  // Remove a composition from the grid
  const removeComposition = (index) => {
    const updatedComps = [...formData.compositions];
    updatedComps.splice(index, 1);
    setFormData({ ...formData, compositions: updatedComps });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalPercentage !== 100)
      return toast.error("Total composition must be exactly 100%.");

    try {
      let updatedFabric;

      if (editFabric) {
        updatedFabric = await updateFabric(editFabric._id, formData);
        //toast.success("Fabric updated successfully");
      } else {
        updatedFabric = await createFabric(formData);
        //toast.success("Fabric created successfully");
      }

      refreshFabricList(updatedFabric.fabric);
      closeModal();
    } catch (error) {
      toast.error("Error saving fabric");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg relative">
        {/* 🔷 Modal Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-lg font-semibold">
            {editFabric ? "Edit Fabric" : "Add New Fabric"}
          </h2>
          <button
            onClick={closeModal}
            className="text-2xl hover:text-gray-300 transition-all"
          >
            <FiX />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto space-y-6 p-4"
        >
          {/* 🔹 Fabric Details */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Fabric Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Fabric Name"
                className="input-field"
                required
              />
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Fabric Code"
                className="input-field"
                required
              />
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="Color"
                className="input-field"
                required
              />
              <select
                name="supplier"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="select-field"
                required
              >
                <option value="" disabled>
                  Select a Supplier
                </option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🔹 Composition Section */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Fabric Composition
            </h3>
            <div className="flex gap-2">
              <select
                value={selectedComposition}
                onChange={(e) => setSelectedComposition(e.target.value)}
                className="select-field"
              >
                <option value="">Select Composition</option>
                {compositionItems.map((comp) => (
                  <option key={comp._id} value={comp._id}>
                    {comp.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="input-field w-24"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="%"
                min="0"
                max="100"
                step="1"
              />
              <button
                type="button" // Prevent form submission
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={addComposition}
              >
                <FiPlus /> Add
              </button>
            </div>
            {warning && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><FiAlertCircle /> {warning}</p>}

            {/* Composition Grid */}
            <div className="border rounded-lg p-3 bg-gray-50 mt-3">
              <table className="w-full text-sm">
              <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="p-2 text-left">Composition</th>
                    <th className="p-2 text-left">%</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.compositions.map((comp, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{comp.compositionName}</td>
                      <td className="p-2">{comp.value}%</td>
                      <td className="p-2">
                        <FiTrash2
                          className="text-red-500 cursor-pointer"
                          onClick={() => removeComposition(index)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Progress value={totalPercentage} className="my-3" />
            <p className="text-sm text-gray-600">Total: {totalPercentage}%</p>
          </div>
          {/* Footer Buttons - Fixed UI Issue */}
          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <Button
            type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
              disabled={totalPercentage !== 100}
              onClick={handleSubmit}
            >
              <FiSave /> {editFabric ? "Update Fabric" : "Save Fabric"}
            </Button>
            <Button
              type="button"
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded flex items-center gap-2"
              onClick={closeModal}
            >
              <FiX /> Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FabricModal;
