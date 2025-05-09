import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { createDefect, updateDefect } from "../services/defectService";
import { fetchOrders } from "../services/orderService";
import { fetchDefectNames, fetchDefectTypes, fetchDefectPlaces, fetchDefectProcesses } from "../services/masterDataService";
import { MdDelete, MdRestore, MdAddCircle, MdCheckCircle, MdArrowBack, MdArrowForward, MdError, MdHelp } from 'react-icons/md';
import { FiCamera, FiImage, FiInfo } from 'react-icons/fi';
import { AiOutlineDrag, AiOutlineWarning } from 'react-icons/ai';
import { motion, AnimatePresence } from "framer-motion";
// import Tooltip from "../components/common/Tooltip"; // Assume this component exists

const LogDefectModal = ({
  closeModal,
  onDefectCreated,
  editDefect,
  updateDefectInList,
  currentColor,
}) => {
  // Form data state
  const [formData, setFormData] = useState({
    orderId: editDefect?.orderId?._id || editDefect?.orderId || "",
    defectType: "",
    defectName: "",
    defectPlace: undefined,
    defectProcess: null,
    holesOrOperation: "",
    defectCount: 1,
    description: "",
    severity: "Low",
    detectedDate: new Date().toLocaleDateString(),
    productionLine: "",
  });

  // Form state management
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({}); 
  const [orders, setOrders] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);
  const [defectNames, setDefectNames] = useState([]);
  const [defectPlaces, setDefectPlaces] = useState([]);
  const [defectProcesses, setDefectProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Image management states
  const [activeImages, setActiveImages] = useState([]);
  const [trashedImages, setTrashedImages] = useState([]);
  const [draggedImage, setDraggedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Form step titles for wizard
  const steps = [
    { number: 1, title: "Basic Information" },
    { number: 2, title: "Defect Details" },
    { number: 3, title: "Images & Final Details" }
  ];

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
  
  useEffect(() => {
    if (editDefect) {
      setFormData({
        ...editDefect,
        orderId: editDefect?.orderId?._id || editDefect?.orderId || "",
        defectType: editDefect?.defectType?._id || editDefect?.defectType || "",
        defectName: editDefect?.defectName?._id || editDefect?.defectName || "",
        defectPlace: editDefect?.defectPlace === null ? undefined : 
                  (editDefect?.defectPlace?._id || editDefect?.defectPlace || undefined)
      });
      
      // Set active images for edit mode with proper URLs
      if (editDefect.images && editDefect.images.length > 0) {
        const imageObjects = editDefect.images.map(img => {
          // Get just the filename
          const filename = img.split('/').pop();
          
          return {
            // Make sure URL is properly formatted with API base URL
            url: `${process.env.REACT_APP_API_URL || ''}/${img}`,
            name: filename,
            isExisting: true
          };
        });
        
        setActiveImages(imageObjects);
      }
    }
  }, [editDefect]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
    setTouched({ ...touched, [name]: true });
  };

  // Field validation
  const validateField = (name, value) => {
    let errors = { ...formErrors };
    
    switch (name) {
      case "orderId":
        if (!value) errors.orderId = "Order ID is required";
        else delete errors.orderId;
        break;
        
      case "defectType":
        if (!value) errors.defectType = "Defect type is required";
        else delete errors.defectType;
        break;
        
      case "defectName":
        if (!value) errors.defectName = "Defect name is required";
        else delete errors.defectName;
        break;
        
      case "defectCount":
        if (!value || value < 1) errors.defectCount = "Count must be at least 1";
        else delete errors.defectCount;
        break;
        
      case "defectProcess":
        if (!value) errors.defectProcess = "Process is required";
        else delete errors.defectProcess;
        break;
        
      case "holesOrOperation":
        if (!value) errors.holesOrOperation = "This field is required";
        else delete errors.holesOrOperation;
        break;
        
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate current step
  const validateStep = (step) => {
    let isValid = true;
    let newErrors = {};
    let fieldsToValidate = [];
    
    // Define required fields for each step
    switch(step) {
      case 1:
        fieldsToValidate = ["orderId", "defectType", "defectName"];
        break;
      case 2:
        fieldsToValidate = ["defectCount", "defectProcess", "holesOrOperation", "severity"];
        break;
      case 3:
        // No required fields in step 3
        return true;
      default:
        return true;
    }
    
    // Check each field
    fieldsToValidate.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
        isValid = false;
      }
    });
    
    // Special validation for defectCount
    if (fieldsToValidate.includes("defectCount") && formData.defectCount < 1) {
      newErrors.defectCount = "Count must be at least 1";
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, detectedDate: date });
  };

  // Move between form steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark all fields in this step as touched to show validation errors
      let newTouched = { ...touched };
      if (currentStep === 1) {
        newTouched = { ...newTouched, orderId: true, defectType: true, defectName: true };
      } else if (currentStep === 2) {
        newTouched = { ...newTouched, defectCount: true, defectProcess: true, holesOrOperation: true, severity: true };
      }
      setTouched(newTouched);
      toast.error("Please fill in all required fields", { autoClose: 2000 });
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Image handling functions
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + activeImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    files.forEach(file => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} exceeds 5MB limit`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveImages(prev => [...prev, {
          url: reader.result,
          name: file.name,
          file, // Keep the file object for uploading
          isExisting: false
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset the file input to allow selecting the same file again
    e.target.value = null;
  };

  const moveImageToTrash = (index) => {
    const imageToTrash = activeImages[index];
    setActiveImages(prev => prev.filter((_, i) => i !== index));
    setTrashedImages(prev => [...prev, imageToTrash]);
    toast.info(`Image moved to trash`, { autoClose: 2000 });
  };

  const restoreImage = (index) => {
    const imageToRestore = trashedImages[index];
    setTrashedImages(prev => prev.filter((_, i) => i !== index));
    setActiveImages(prev => [...prev, imageToRestore]);
    toast.info(`Image restored`, { autoClose: 2000 });
  };

  const previewImageHandler = (image) => {
    setPreviewImage(image);
    setIsImagePreviewOpen(true);
  };

  // Drag and drop functionality for image reordering
  const handleDragStart = (e, index) => {
    setDraggedImage(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedImage === null) return;
    
    // Reorder the images
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

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    let allFieldsValid = true;
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        allFieldsValid = false;
        setCurrentStep(step);
        break;
      }
    }
    
    if (!allFieldsValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formDataWithImages = new FormData();
    
    // Append basic form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataWithImages.append(key, value);
      }
    });

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
    
    // For trashed existing images that need permanent deletion
    const imagesToDelete = trashedImages
      .filter(img => img.isExisting)
      .map(img => img.name);
      
    formDataWithImages.append("imagesToDelete", JSON.stringify(imagesToDelete));

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Filter dropdown options based on parent selections
  const filteredDefectNames = defectNames?.filter(name => name.type._id === formData.defectType);
  const filteredDefectProcesses = defectProcesses?.filter(process => process.place._id === formData.defectPlace);

  // Helper function for field classes
  const getFieldClasses = (fieldName) => {
    const baseClasses = "w-full p-3 transition-all duration-200 border rounded focus:outline-none focus:ring-2";
    
    if (touched[fieldName] && formErrors[fieldName]) {
      return `${baseClasses} border-red-400 focus:ring-red-400 bg-red-50`;
    } else if (touched[fieldName] && !formErrors[fieldName]) {
      return `${baseClasses} border-green-400 focus:ring-green-400 bg-green-50`;
    }
    
    return `${baseClasses} border-gray-300 focus:ring-blue-400`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl rounded-xl shadow-2xl relative overflow-hidden"
      >
        {/* Header with title and step indicator */}
        <div 
          className="px-6 py-4 flex justify-between items-center shadow-sm"
          style={{ backgroundColor: currentColor, color: 'white' }}
        >
          <h2 className="text-xl font-bold">
            {editDefect ? "Edit Defect" : "Log New Defect"}
          </h2>
          <button onClick={() => setShowHelp(!showHelp)} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full">
            <MdHelp size={24} />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep > step.number 
                    ? `bg-green-500 text-white` 
                    : currentStep === step.number
                    ? `bg-${currentColor.replace('#', '')} text-white`
                    : 'bg-gray-200 text-gray-500'
                }`}
                style={currentStep === step.number ? { backgroundColor: currentColor } : {}}
              >
                {currentStep > step.number ? <MdCheckCircle size={18} /> : step.number}
              </div>
              <span className={`ml-2 text-sm ${currentStep === step.number ? 'font-medium' : 'text-gray-500'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`mx-2 flex-grow h-0.5 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`} style={{ width: '40px' }}></div>
              )}
            </div>
          ))}
        </div>

        {/* Help section - conditionally rendered */}
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-50 px-6 py-3 text-sm text-blue-800"
            >
              <div className="flex items-start">
                <FiInfo className="mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">How to use this form:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Fill in the required fields marked with a <span className="text-red-500">*</span></li>
                    <li>Navigate between steps using the Next and Back buttons</li>
                    <li>You can upload up to 5 images to document the defect</li>
                    <li>Drag and drop images to reorder them</li>
                    <li>Click on images to preview them in larger size</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto px-6 py-4 custom-scrollbar">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <span className="mr-2 bg-gray-200 text-gray-600 w-6 h-6 rounded-full text-xs flex items-center justify-center">1</span>
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Order ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        name="orderId" 
                        value={formData.orderId} 
                        onChange={handleChange}
                        className={getFieldClasses("orderId")}
                      >
                        <option value="" disabled>Select an Order</option>
                        {orders.map((order) => (
                          <option key={order._id} value={order._id}>{order.orderNo} - {order.season}</option>
                        ))}
                      </select>
                      {touched.orderId && formErrors.orderId && (
                        <div className="absolute right-3 top-3 text-red-500">
                          <MdError size={20} />
                        </div>
                      )}
                    </div>
                    {touched.orderId && formErrors.orderId && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.orderId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Defect Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        name="defectType" 
                        value={formData.defectType} 
                        onChange={handleChange}
                        className={getFieldClasses("defectType")}
                      >
                        <option value="" disabled>Select Defect Type</option>
                        {defectTypes?.map((type) => (
                          <option key={type._id} value={type._id}>{type.name}</option>
                        ))}
                      </select>
                      {touched.defectType && formErrors.defectType && (
                        <div className="absolute right-3 top-3 text-red-500">
                          <MdError size={20} />
                        </div>
                      )}
                    </div>
                    {touched.defectType && formErrors.defectType && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.defectType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Defect Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        name="defectName" 
                        value={formData.defectName || ""} 
                        onChange={handleChange}
                        disabled={!formData.defectType || isLoading}
                        className={getFieldClasses("defectName")}
                      >
                        <option value="" disabled>Select Defect Name</option>
                        {filteredDefectNames?.length > 0 ? (
                          filteredDefectNames?.map((name) => (
                            <option key={name._id} value={name._id}>{name.name}</option>
                          ))
                        ) : (
                          <option disabled>No options available</option>
                        )}
                      </select>
                      {touched.defectName && formErrors.defectName && (
                        <div className="absolute right-3 top-3 text-red-500">
                          <MdError size={20} />
                        </div>
                      )}
                    </div>
                    {touched.defectName && formErrors.defectName && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.defectName}</p>
                    )}
                    {!formData.defectType && (
                      <p className="mt-1 text-xs text-gray-500">First select a defect type</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium">Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      placeholder="Provide any additional details about the defect"
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-24"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Defect Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <span className="mr-2 bg-gray-200 text-gray-600 w-6 h-6 rounded-full text-xs flex items-center justify-center">2</span>
                  Defect Details
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Defect Count <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="1" 
                          step="1" 
                          name="defectCount" 
                          value={formData.defectCount} 
                          onChange={handleChange} 
                          placeholder="Count"
                          className={getFieldClasses("defectCount")}
                        />
                        {touched.defectCount && formErrors.defectCount && (
                          <div className="absolute right-3 top-3 text-red-500">
                            <MdError size={20} />
                          </div>
                        )}
                      </div>
                      {touched.defectCount && formErrors.defectCount && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.defectCount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Severity <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-2">
                        {["Low", "Medium", "High"].map((level) => (
                          <label 
                            key={level}
                            className={`flex-1 flex items-center justify-center p-2 border rounded cursor-pointer ${
                              formData.severity === level 
                                ? 'bg-blue-100 border-blue-400 text-blue-700' 
                                : 'border-gray-300 text-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="severity"
                              value={level}
                              checked={formData.severity === level}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <span className="flex items-center">
                              <AiOutlineWarning 
                                className={`mr-1 ${
                                  level === 'Low' ? 'text-green-500' : 
                                  level === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                                }`} 
                              />
                              {level}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Sewing Or Holes <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        name="holesOrOperation" 
                        value={formData.holesOrOperation} 
                        onChange={handleChange}
                        className={getFieldClasses("holesOrOperation")}
                      >
                        <option value="">Select Sewing Or Holes</option>
                        {["Holes", "Operation"].map((hOrO) => (
                          <option key={hOrO} value={hOrO}>{hOrO}</option>
                        ))}
                      </select>
                      {touched.holesOrOperation && formErrors.holesOrOperation && (
                        <div className="absolute right-3 top-3 text-red-500">
                          <MdError size={20} />
                        </div>
                      )}
                    </div>
                    {touched.holesOrOperation && formErrors.holesOrOperation && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.holesOrOperation}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Defect Place
                    </label>
                    <select 
                      name="defectPlace" 
                      value={formData.defectPlace || ""} 
                      onChange={handleChange} 
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled hidden>Select Defect Place</option>
                      {defectPlaces?.map((place) => (
                        <option key={place._id} value={place._id}>{place.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Defect Process <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        name="defectProcess" 
                        value={formData.defectProcess || ""} 
                        onChange={handleChange}
                        disabled={!formData.defectPlace || isLoading}
                        className={getFieldClasses("defectProcess")}
                      >
                        <option value="" disabled>Select Defect Process</option>
                        {filteredDefectProcesses?.length > 0 ? (
                          filteredDefectProcesses?.map((process) => (
                            <option key={process._id} value={process._id}>{process.name}</option>
                          ))
                        ) : (
                          <option disabled>No options available</option>
                        )}
                      </select>
                      {touched.defectProcess && formErrors.defectProcess && (
                        <div className="absolute right-3 top-3 text-red-500">
                          <MdError size={20} />
                        </div>
                      )}
                    </div>
                    {touched.defectProcess && formErrors.defectProcess && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.defectProcess}</p>
                    )}
                    {!formData.defectPlace && (
                      <p className="mt-1 text-xs text-gray-500">First select a defect place</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Images & Final Details */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <span className="mr-2 bg-gray-200 text-gray-600 w-6 h-6 rounded-full text-xs flex items-center justify-center">3</span>
                  Images & Final Details
                </h3>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Line of Production</label>
                      <select 
                        name="productionLine" 
                        value={formData.productionLine} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select Line</option>
                        {["Line 1", "Line 2", "Line 3", "Line 4", "Line 5", "Line 6", "Line 7"].map((line) => (
                          <option key={line} value={line}>{line}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">Inspection Date</label>
                      <div className="relative">
                        <DatePicker 
                          selected={formData.detectedDate instanceof Date ? formData.detectedDate : new Date(formData.detectedDate)} 
                          onChange={handleDateChange} 
                          dateFormat="yyyy-MM-dd"
                          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700 flex items-center">
                        <FiCamera className="mr-2" /> 
                        Defect Images
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {activeImages.length}/5
                        </span>
                      </h4>
                      <div>
                        <label className="inline-block px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer transition-colors">
                          <FiImage className="inline-block mr-1" /> 
                          Add Images
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            multiple
                            className="hidden"
                            disabled={activeImages.length >= 5}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Image upload instructions */}
                    <div className="mb-3 flex items-start bg-blue-50 p-3 rounded-md text-sm">
                      <FiInfo className="text-blue-500 mr-2 mt-0.5" />
                      <div className="text-blue-700">
                        <span className="font-medium">Image Tips:</span> Upload clear, well-lit photos showing the defect. Maximum 5 images allowed (max 5MB each). Drag to reorder images.
                      </div>
                    </div>

                    {/* Active Images Section */}
                    {activeImages.length > 0 ? (
                      <div className="mb-4">
                        <div className="grid grid-cols-3 gap-3">
                          {activeImages.map((image, index) => (
                            <div 
                              key={index} 
                              className={`relative group border-2 rounded p-1 ${
                                isDragging && draggedImage === index 
                                  ? 'border-blue-500 opacity-50' 
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="relative">
                                <img
                                  src={image.url} 
                                  alt={image.name} 
                                  className="w-full h-24 object-cover rounded cursor-pointer"
                                  onClick={() => previewImageHandler(image)}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
                                  <AiOutlineDrag className="text-white opacity-0 group-hover:opacity-100" size={24} />
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <div className="text-xs text-gray-500 truncate w-3/4">{image.name}</div>
                                <button
                                  type="button"
                                  onClick={() => moveImageToTrash(index)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Move to trash"
                                >
                                  <MdDelete size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FiImage className="text-gray-400 mb-2" size={32} />
                        <p className="text-gray-500">No images added yet</p>
                        <p className="text-sm text-gray-400">Add images to better document the defect</p>
                      </div>
                    )}

                    {/* Trash Bin Section - Only show if there are trashed images */}
                    {trashedImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2 flex items-center text-gray-600">
                          <MdDelete className="mr-1" /> 
                          Removed Images
                          <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{trashedImages.length}</span>
                        </h4>
                        <div className="grid grid-cols-4 gap-2 bg-gray-100 p-2 rounded">
                          {trashedImages.map((image, index) => (
                            <div key={index} className="relative group opacity-60 hover:opacity-100">
                              <img
                                src={image.url} 
                                alt={image.name} 
                                className="w-full h-14 object-cover rounded border border-gray-300"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => restoreImage(index)}
                                  className="bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Restore image"
                                >
                                  <MdRestore className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="text-xs text-gray-600 truncate mt-1 text-center">{image.name.substring(0, 10)}{image.name.length > 10 ? '...' : ''}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Image Preview Modal */}
          {isImagePreviewOpen && previewImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
                 onClick={() => setIsImagePreviewOpen(false)}>
              <div className="relative bg-white p-2 rounded max-w-2xl max-h-2xl" onClick={e => e.stopPropagation()}>
                <img src={previewImage.url} alt={previewImage.name} className="max-h-96 object-contain" />
                <button 
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md" 
                  onClick={() => setIsImagePreviewOpen(false)}
                >
                  <MdDelete size={20} />
                </button>
                <div className="text-center mt-2 text-sm">{previewImage.name}</div>
              </div>
            </div>
          )}

          {/* Navigation and Submit Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={prevStep} 
                className="flex items-center text-gray-600 border border-gray-300 rounded px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <MdArrowBack className="mr-1" /> Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="ml-auto flex items-center text-white rounded px-4 py-2 hover:bg-opacity-90 transition-colors"
                style={{ backgroundColor: currentColor }}
              >
                Next <MdArrowForward className="ml-1" />
              </button>
            ) : (
              <div className="ml-auto flex space-x-3">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-6 py-2 text-white rounded hover:bg-opacity-90 transition-colors flex items-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: currentColor }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editDefect ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <><MdCheckCircle className="mr-1" /> {editDefect ? "Update Defect" : "Save Defect"}</>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Optional Tooltip Component - shown on demand */}
        {/* <Tooltip /> */}
      </motion.div>
    </div>
  );
};

export default LogDefectModal;