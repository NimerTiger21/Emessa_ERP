import React, { useState, useEffect } from "react";
import {
  fetchFabricSuppliers,
  fetchFabricCompositionItems,
  createFabric,
  updateFabric,
} from "../services/fabricService";
// } from "../services/masterDataService";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { toast } from "react-toastify";
import { 
  FiX, 
  FiTrash2, 
  FiAlertCircle, 
  FiPlus, 
  FiSave, 
  FiUpload, 
  FiFileText,
  FiActivity,
  FiInfo
} from "react-icons/fi";

const FabricModal = ({ closeModal, editFabric, refreshFabricList }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    color: "",
    supplier: "",
    compositions: [],
    technicalSpecs: {
      tensileWarp: "",
      tensileWeft: "",
      tearWarp: "",
      tearWeft: "",
      weight: "",
      elasticity: "",
    },
  });

  const [suppliers, setSuppliers] = useState([]);
  const [compositionItems, setCompositionItems] = useState([]);
  const [selectedComposition, setSelectedComposition] = useState("");
  const [percentage, setPercentage] = useState("");
  const [warning, setWarning] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [tdsFile, setTdsFile] = useState(null);
  const [existingTdsFile, setExistingTdsFile] = useState(null);

  // Fetch dropdown data
  useEffect(() => {
    fetchFabricSuppliers().then(setSuppliers);
    fetchFabricCompositionItems().then(setCompositionItems);
  }, []);

  // Populate data if editing
  useEffect(() => {
    if (editFabric) {
      setFormData({
        name: editFabric.name,
        code: editFabric.code,
        color: editFabric.color,
        supplier: editFabric.supplier?._id || "",
        compositions: editFabric.fabricCompositions?.map((comp) => ({
          compositionCode: comp.compositionItem._id,
          compositionName: comp.compositionItem.name,
          value: comp.value,
        })) || [],
        technicalSpecs: {
          tensileWarp: editFabric.technicalSpecs?.tensileWarp || "",
          tensileWeft: editFabric.technicalSpecs?.tensileWeft || "",
          tearWarp: editFabric.technicalSpecs?.tearWarp || "",
          tearWeft: editFabric.technicalSpecs?.tearWeft || "",
          weight: editFabric.technicalSpecs?.weight || "",
          elasticity: editFabric.technicalSpecs?.elasticity || "",
        },
      });
      setExistingTdsFile(editFabric.tdsFile || null);
    }
  }, [editFabric]);

  // Calculate total composition percentage
  const totalPercentage = formData.compositions
    .reduce((sum, comp) => sum + parseFloat(comp.value), 0)
    .toFixed(1);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only PDF, DOC, or DOCX files");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should not exceed 10MB");
        return;
      }
      
      setTdsFile(file);
      toast.success("TDS file selected successfully");
    }
  };

  // Add composition with limit check
  const addComposition = () => {
    if (!selectedComposition || !percentage) {
      return toast.error(
        "Please select a composition and enter a valid percentage."
      );
    }

    const isDuplicate = formData.compositions.some(
      (comp) => comp.compositionCode === selectedComposition
    );
    if (isDuplicate) {
      return toast.error("This composition is already added.");
    }

    const newTotal = parseFloat(totalPercentage) + parseFloat(percentage);

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

    setSelectedComposition("");
    setPercentage("");
    setWarning("");
  };

  // Remove a composition from the grid
  const removeComposition = (index) => {
    const updatedComps = [...formData.compositions];
    updatedComps.splice(index, 1);
    setFormData({ ...formData, compositions: updatedComps });
  };

  // Handle technical specs change
  const handleTechSpecChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      technicalSpecs: {
        ...prev.technicalSpecs,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name?.trim()) errors.push("Fabric name is required.");
    if (!formData.supplier) errors.push("Please select a supplier.");

    if (formData.compositions.length === 0) {
      errors.push("At least one composition is required.");
    }

    if (parseFloat(totalPercentage) !== 100) {
      errors.push("Total composition must be exactly 100%.");
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('code', formData.code);
      submitData.append('color', formData.color);
      submitData.append('supplier', formData.supplier);
      submitData.append('compositions', JSON.stringify(formData.compositions));
      submitData.append('technicalSpecs', JSON.stringify(formData.technicalSpecs));
      
      if (tdsFile) {
        submitData.append('tdsFile', tdsFile);
      }

      let updatedFabric;

      if (editFabric) {
        updatedFabric = await updateFabric(editFabric._id, submitData);
      } else {
        updatedFabric = await createFabric(submitData);
      }

      refreshFabricList(updatedFabric.fabric);
      closeModal();
    } catch (error) {
      toast.error("Error saving fabric");
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FiInfo },
    { id: "composition", label: "Composition", icon: FiActivity },
    { id: "technical", label: "Technical Specs", icon: FiFileText },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {editFabric ? "Edit Fabric" : "Create New Fabric"}
            </h2>
            <button
              onClick={closeModal}
              className="text-2xl hover:text-gray-200 transition-colors"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* <div className="flex-1 overflow-hidden"> */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* <div className="max-h-[60vh] overflow-y-auto p-6"> */}
          <div className="h-[60vh] overflow-y-auto p-6">
            {/* Or, if you want it responsive but never shrink below a height: */}
            {/* <div className="min-h-[60vh] max-h-[70vh] overflow-y-auto p-6"> */}
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiInfo className="text-blue-600" />
                    Basic Fabric Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fabric Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter fabric name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fabric Code
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="Enter fabric code"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="Enter color"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier *
                      </label>
                      <select
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a Supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* TDS File Upload */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiUpload className="text-green-600" />
                    Technical Data Sheet (TDS)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiUpload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> TDS file
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                    
                    {(tdsFile || existingTdsFile) && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <FiFileText className="text-blue-600 w-5 h-5" />
                          <span className="text-sm font-medium">
                            {tdsFile ? tdsFile.name : existingTdsFile?.fileName}
                          </span>
                          {tdsFile && (
                            <span className="text-xs text-gray-500">
                              ({(tdsFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Composition Tab */}
            {activeTab === "composition" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiActivity className="text-purple-600" />
                    Fabric Composition
                  </h3>
                  
                  <div className="flex gap-3 mb-4">
                    <select
                      value={selectedComposition}
                      onChange={(e) => setSelectedComposition(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Composition</option>
                      {compositionItems.map((comp) => (
                        <option key={comp._id} value={comp._id}>
                          {comp.abbrPrefix} - {comp.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="w-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      placeholder="%"
                      min="0"
                      max="100"
                      step="1"
                    />
                    <Button
                      type="button"
                      onClick={addComposition}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                      <FiPlus /> Add
                    </Button>
                  </div>

                  {warning && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                      <FiAlertCircle />
                      {warning}
                    </div>
                  )}

                  {/* Composition Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Composition</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Percentage</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.compositions.map((comp, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{comp.compositionName}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{comp.value}%</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeComposition(index)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4">
                    <Progress value={totalPercentage} className="mb-2" />
                    <p className="text-sm text-gray-600">
                      Total Composition: <span className="font-semibold">{totalPercentage}%</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Specs Tab */}
            {activeTab === "technical" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiFileText className="text-orange-600" />
                    Technical Specifications
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tensile Warp (gf)
                      </label>
                      <input
                        type="number"
                        value={formData.technicalSpecs.tensileWarp}
                        onChange={(e) => handleTechSpecChange('tensileWarp', e.target.value)}
                        placeholder="Enter tensile warp"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tensile Weft (gf)
                      </label>
                      <input
                        type="number"
                        value={formData.technicalSpecs.tensileWeft}
                        onChange={(e) => handleTechSpecChange('tensileWeft', e.target.value)}
                        placeholder="Enter tensile weft"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tear Warp (gf)
                      </label>
                      <input
                        type="number"
                        value={formData.technicalSpecs.tearWarp}
                        onChange={(e) => handleTechSpecChange('tearWarp', e.target.value)}
                        placeholder="Enter tear warp"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tear Weft (gf)
                      </label>
                      <input
                        type="number"
                        value={formData.technicalSpecs.tearWeft}
                        onChange={(e) => handleTechSpecChange('tearWeft', e.target.value)}
                        placeholder="Enter tear weft"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (oz/y²)
                      </label>
                      <input
                        type="number"
                        value={formData.technicalSpecs.weight}
                        onChange={(e) => handleTechSpecChange('weight', e.target.value)}
                        placeholder="Enter weight"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Elasticity (%)
                      </label>
                      <input
                        type="number"
                        value={formData.technicalSpecs.elasticity}
                        onChange={(e) => handleTechSpecChange('elasticity', e.target.value)}
                        placeholder="Enter elasticity"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <Button
                type="button"
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <FiX /> Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={parseFloat(totalPercentage) !== 100}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                  parseFloat(totalPercentage) !== 100
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                <FiSave />
                {editFabric ? "Update Fabric" : "Create Fabric"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FabricModal;