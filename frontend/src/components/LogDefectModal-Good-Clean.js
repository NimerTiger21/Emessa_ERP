import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { createDefect, updateDefect } from "../services/defectService";
import { fetchOrders } from "../services/orderService";
import { fetchDefectNames, fetchDefectTypes, fetchDefectPlaces, fetchDefectProcesses } from "../services/masterDataService";
import { MdDelete, MdRestore } from 'react-icons/md';
import DefectDetailsUI from './DefectDetailsUI'; // 1. IMPORT THE COMPONENT

const LogDefectModal = ({
  closeModal,
  onDefectCreated,
  editDefect,
  updateDefectInList,
  currentColor,
}) => {
  const [formData, setFormData] = useState({
    orderId: editDefect?.orderId?._id || editDefect?.orderId || "",
    defectType: "",
    defectName: "",
    defectPlace: undefined,
    defectProcess: undefined,
    holesOrOperation: "",
    defectCount: 1,
    description: "",
    severity: "Low",
    detectedDate: new Date().toLocaleDateString(),
    productionLine: "",
  });

  const [orders, setOrders] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);
  const [defectNames, setDefectNames] = useState([]);
  const [filteredDefectNames, setFilteredDefectNames] = useState([]);
  const [defectPlaces, setDefectPlaces] = useState([]);
  const [defectProcesses, setDefectProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. ADD DEFECT DETAILS STATE
  const [defectDetails, setDefectDetails] = useState([]);
  
  // Active images that will be displayed in the UI
  const [activeImages, setActiveImages] = useState([]);
  
  // Trash bin for temporarily deleted images (can be restored)
  const [trashedImages, setTrashedImages] = useState([]);
  
  // Keep track of UI state during drag operations
  const [draggedImage, setDraggedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadDefects = async () => {
      setIsLoading(true);
      try {
        const [typeRes, nameRes, placeRes, processRes] = await Promise.all([
          fetchDefectTypes(),
          fetchDefectNames(),
          fetchDefectPlaces(),
          fetchDefectProcesses()
        ]);
        setDefectTypes(typeRes);
        setDefectNames(nameRes);
        setDefectPlaces(placeRes);
        setDefectProcesses(processRes);
      } catch (error) {
        console.error("Error fetching defects:", error);
        toast.error("Failed to load defect data");
      } finally {
        setIsLoading(false);
      }
    };
    loadDefects();
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders({});
        setOrders(data.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    loadOrders();
  }, []);

  // Update filtered defect names when defect type changes
  useEffect(() => {
    if (formData.defectType) {
      setIsLoading(true);
      const filtered = defectNames?.filter(name => 
        name.type._id === formData.defectType
      );
      setFilteredDefectNames(filtered);
      
      // Reset defect name when type changes
      setFormData(prev => ({ ...prev, defectName: '' }));
      setIsLoading(false);
    } else {
      setFilteredDefectNames([]);
    }
  }, [formData.defectType, defectNames]);
  
  // 3. UPDATE THE EDIT DEFECT USEEFFECT TO HANDLE DETAILS
  useEffect(() => {
    if (editDefect) {
      console.log("editDefect: ", editDefect);
      setFormData({
        ...editDefect,
        orderId: editDefect?.orderId?._id || editDefect?.orderId || "",
        defectType: editDefect?.defectType?._id || editDefect?.defectType || "",
        defectName: editDefect?.defectName?._id || editDefect?.defectName || "",
        defectPlace: editDefect?.defectPlace === null ? undefined : 
                   (editDefect?.defectPlace?._id || editDefect?.defectPlace || undefined),
        defectProcess: editDefect?.defectProcess?._id || editDefect?.defectProcess || undefined,
        holesOrOperation: editDefect?.holesOrOperation || "",
        defectCount: editDefect?.defectCount || 1,
        description: editDefect?.description || "",
        severity: editDefect?.severity || "Low",
        detectedDate: editDefect?.detectedDate || new Date().toLocaleDateString(),
        productionLine: editDefect?.productionLine || "",
      });
      
      // 4. HANDLE EXISTING DEFECT DETAILS FOR EDIT MODE
      if (editDefect.details && editDefect.details.length > 0) {
        const formattedDetails = editDefect.details.map((detail, index) => ({
          id: `existing-${index}`, // Generate UI ID
          defectPlace: detail.defectPlace?._id || detail.defectPlace,
          defectProcess: detail.defectProcess?._id || detail.defectProcess,
          count: detail.count,
          // Add display names for UI
          placeName: detail.defectPlace?.name || 
                    defectPlaces.find(p => p._id === (detail.defectPlace?._id || detail.defectPlace))?.name || '',
          processName: detail.defectProcess?.name || 
                      defectProcesses.find(p => p._id === (detail.defectProcess?._id || detail.defectProcess))?.name || ''
        }));
        setDefectDetails(formattedDetails);
      } else {
        setDefectDetails([]);
      }
      
      // Set active images for edit mode with proper URLs
      if (editDefect.images && editDefect.images.length > 0) {
        const imageObjects = editDefect.images.map(img => {
          const filename = img.split('/').pop();
          return {
            url: `${process.env.REACT_APP_API_URL || ''}/${img}`,
            name: filename,
            isExisting: true
          };
        });
        console.log("Setting active images:", imageObjects);
        setActiveImages(imageObjects);
      }
    } else {
      // 5. RESET DETAILS FOR NEW DEFECT
      setDefectDetails([]);
    }
  }, [editDefect, defectTypes, defectNames, defectProcesses, defectPlaces]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log("Form Data: ", formData);
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, detectedDate: date });
  };

  // 6. ADD HANDLER FOR DEFECT DETAILS CHANGES
  const handleDefectDetailsChange = (details) => {
    console.log("Defect details updated:", details);
    setDefectDetails(details);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + activeImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveImages(prev => [...prev, {
          url: reader.result,
          name: file.name,
          file,
          isExisting: false
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = null;
  };

  const moveImageToTrash = (index) => {
    const imageToTrash = activeImages[index];
    setActiveImages(prev => prev.filter((_, i) => i !== index));
    setTrashedImages(prev => [...prev, imageToTrash]);
    toast.info(`Image moved to trash bin`, { autoClose: 2000 });
  };

  const restoreImage = (index) => {
    const imageToRestore = trashedImages[index];
    setTrashedImages(prev => prev.filter((_, i) => i !== index));
    setActiveImages(prev => [...prev, imageToRestore]);
    toast.info(`Image restored`, { autoClose: 2000 });
  };

  const handleDragStart = (e, index) => {
    setDraggedImage(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedImage === null) return;
    
    const newActiveImages = [...activeImages];
    const draggedItem = newActiveImages[draggedImage];
    newActiveImages.splice(draggedImage, 1);
    newActiveImages.splice(index, 0, draggedItem);
    
    setActiveImages(newActiveImages);
    setDraggedImage(index);
  };

  const handleDragEnd = () => {
    setDraggedImage(null);
    setIsDragging(false);
  };

  // 7. UPDATE THE SUBMIT HANDLER TO INCLUDE DETAILS
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 8. VALIDATE DEFECT DETAILS IF PROVIDED
    const totalDetailsCount = defectDetails.reduce((sum, detail) => sum + detail.count, 0);
    if (defectDetails.length > 0 && totalDetailsCount !== formData.defectCount) {
      toast.error(`Detail count (${totalDetailsCount}) must match total defect count (${formData.defectCount})`);
      return;
    }

    const formDataWithImages = new FormData();
    
    // Append basic form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataWithImages.append(key, value);
      }
    });

    // 9. APPEND DEFECT DETAILS TO FORM DATA
    if (defectDetails.length > 0) {
      formDataWithImages.append("details", JSON.stringify(
        defectDetails.map(detail => ({
          count: detail.count,
          defectPlace: detail.defectPlace,
          defectProcess: detail.defectProcess
        }))
      ));
      console.log("Appending defect details:", defectDetails);
    }

    // Append new files only
    activeImages.forEach((img) => {
      if (!img.isExisting && img.file) {
        formDataWithImages.append("images", img.file);
      }
    });

    // Append existing image filenames
    const existingImages = activeImages
      .filter(img => img.isExisting)
      .map(img => img.name);
    
    formDataWithImages.append("existingImages", JSON.stringify(existingImages));
    
    const imagesToDelete = trashedImages
      .filter(img => img.isExisting)
      .map(img => img.name);
      
    formDataWithImages.append("imagesToDelete", JSON.stringify(imagesToDelete));

    try {
      if (editDefect) {
        const updatedDefect = await updateDefect({ editDefect, formDataWithImages });
        updateDefectInList(updatedDefect);
        toast.success("Defect updated successfully");
      } else {
        const newDefect = await createDefect({ formDataWithImages });
        onDefectCreated(newDefect.populatedDefect);
        toast.success(newDefect.message);
      }
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log/update defect.");
    }
  };

  const filteredDefectProcesses = defectProcesses?.filter(process => process.place._id === formData.defectPlace);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl p-4 rounded-lg shadow-lg relative max-h-[90vh] overflow-hidden">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {editDefect ? "Edit Defect" : "Log New Defect"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">General Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Order ID:</label>
                  <select name="orderId" value={formData.orderId} onChange={handleChange} required className="w-full p-2 mb-4 border border-gray-300 rounded">
                    <option value="" disabled>Select an Order</option>
                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>{order.orderNo} - {order.season}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Defect Type:</label>
                  <select name="defectType" value={formData.defectType} onChange={handleChange} required className="w-full p-2 mb-4 border border-gray-300 rounded">
                    <option value="" disabled>Select Defect Type</option>
                    {defectTypes?.map((type) => (
                      <option key={type._id} value={type._id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Defect Name:</label>
                  <select name="defectName" value={formData.defectName || ""} onChange={handleChange} required 
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                    disabled={!formData.defectType || isLoading} >
                    <option value="" disabled>Select Defect Name</option>
                    {filteredDefectNames?.length > 0 ? (
                      filteredDefectNames?.map((name) => (
                        <option key={name._id} value={name._id}>{name.name}</option>
                      ))
                    ) : (
                      <option disabled>No options available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Defect Count:</label>
                  <input type="number" min="1" step="1" name="defectCount" value={formData.defectCount} onChange={handleChange} placeholder="Enter defect quantity" required className="w-full p-2 mb-4 border border-gray-300 rounded" />
                </div>

                <div>
                  <label className="block mb-2">Severity:</label>
                  <select name="severity" value={formData.severity} required onChange={handleChange} className="w-full p-2 mb-4 border border-gray-300 rounded">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Sewing Or Holes:</label>
                  <select name="holesOrOperation" value={formData.holesOrOperation} required onChange={handleChange} className="w-full p-2 mb-4 border border-gray-300 rounded">
                    <option value="">Select Sewing Or Holes</option>
                    {["Holes", "Operation"].map((hOrO) => (
                      <option key={hOrO} value={hOrO}>{hOrO}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Defect Place:</label>
                  <select name="defectPlace" value={formData.defectPlace || ""} onChange={handleChange} className="w-full p-2 mb-4 border border-gray-300 rounded">
                    <option value="" disabled hidden>Select Defect Place</option>
                    {defectPlaces?.map((place) => (
                      <option key={place._id} value={place._id}>{place.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Defect Process:</label>
                  <select name="defectProcess" value={formData.defectProcess || ""} onChange={handleChange} required 
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                    disabled={!formData.defectPlace || isLoading} >
                    <option value="" disabled>Select Defect Process</option>
                    {filteredDefectProcesses?.length > 0 ? (
                      filteredDefectProcesses?.map((process) => (
                        <option key={process._id} value={process._id}>{process.name}</option>
                      ))
                    ) : (
                      <option disabled>No options available</option>
                    )}
                  </select>
                </div>
              </div>

              <label className="block mb-2">Description:</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 mb-4 border border-gray-300 rounded" placeholder="Optional: Describe the defect in detail" rows="3" />
            </div>

            {/* 10. INSERT THE DEFECT DETAILS UI COMPONENT HERE */}
            {formData.defectName && formData.defectCount > 0 && (
              <div className="mb-6">
                <DefectDetailsUI
                  defectName={formData.defectName}
                  defectType={formData.defectType}
                  totalCount={formData.defectCount}
                  onDetailsChange={handleDefectDetailsChange}
                  defectPlaces={defectPlaces}
                  defectProcesses={defectProcesses}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">Additional Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Line of Production:</label>
                  <select name="productionLine" value={formData.productionLine} onChange={handleChange} className="w-full p-2 mb-4 border border-gray-300 rounded">
                    <option value="">Select Line</option>
                    {["Line 1", "Line 2", "Line 3", "Line 4", "Line 5", "Line 6", "Line 7"].map((line) => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Inspection Date:</label>
                  <DatePicker 
                    selected={formData.detectedDate} 
                    onChange={handleDateChange} 
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                    dateFormat="yyyy-MM-dd" 
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-gray-600">Defect Images</h3>
              
              <div className="mb-4">
                <label className="block mb-2">Upload Images (Max 5):</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  multiple
                  className="w-full mb-4 border border-gray-300 rounded"
                  disabled={activeImages.length >= 5}
                />
                <p className="text-sm text-gray-500">
                  Upload multiple images to document the defect (drag to reorder)
                </p>
              </div>

              {/* Active Images Section */}
              {activeImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Active Images</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {activeImages.map((image, index) => (
                      <div 
                        key={index} 
                        className={`relative group border-2 rounded p-1 ${isDragging && draggedImage === index ? 'border-blue-500 opacity-50' : 'border-gray-200'}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <img
                          src={image.url} 
                          alt={image.name} 
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => moveImageToTrash(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Move to trash"
                        >
                          <MdDelete className="h-4 w-4" />
                        </button>
                        <div className="text-xs text-gray-500 truncate mt-1">{image.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trash Bin Section */}
              {trashedImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <span>Trashed Images</span>
                    <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{trashedImages.length}</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-4 bg-gray-100 p-2 rounded">
                    {trashedImages.map((image, index) => (
                      <div key={index} className="relative group opacity-60 hover:opacity-100">
                        <img
                          src={image.url} 
                          alt={image.name} 
                          className="w-full h-16 object-cover rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => restoreImage(index)}
                          className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Restore image"
                        >
                          <MdRestore className="h-4 w-4" />
                        </button>
                        <div className="text-xs text-gray-600 truncate mt-1">{image.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex justify-between space-x-2 px-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 text-white rounded hover:bg-indigo-700" style={{ backgroundColor: currentColor }}>
              {editDefect ? "Update Defect" : "Save Defect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogDefectModal;