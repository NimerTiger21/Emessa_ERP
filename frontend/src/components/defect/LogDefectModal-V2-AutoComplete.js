import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PRODUCTION_LINES } from "../../data/dummy";
import DatePicker from "react-datepicker";
import { createDefect, updateDefect } from "../../services/defectService";
import { fetchOrders } from "../../services/orderService";
import {
  fetchDefectNames,
  fetchDefectTypes,
  fetchDefectPlaces,
  fetchDefectProcesses,
} from "../../services/masterDataService";
import { MdDelete, MdRestore } from "react-icons/md";
import { 
  X, 
  AlertTriangle, 
  Package, 
  Calendar, 
  Factory, 
  Image as ImageIcon,
  Camera,
  Trash2,
  RotateCcw,
  Plus,
  ChevronDown,
  Info,
  RefreshCcw
} from "lucide-react";
import DefectDetailsUI from "./DefectDetailsUI";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Defect details state
  const [defectDetails, setDefectDetails] = useState([]);

  // Active images that will be displayed in the UI
  const [activeImages, setActiveImages] = useState([]);

  // Trash bin for temporarily deleted images (can be restored)
  const [trashedImages, setTrashedImages] = useState([]);

  // Keep track of UI state during drag operations
  const [draggedImage, setDraggedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // UI state for better UX
  const [expandedSection, setExpandedSection] = useState('general');

  useEffect(() => {
    const loadDefects = async () => {
      setIsLoading(true);
      try {
        const [typeRes, nameRes, placeRes, processRes] = await Promise.all([
          fetchDefectTypes(),
          fetchDefectNames(),
          fetchDefectPlaces(),
          fetchDefectProcesses(),
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
      const filtered = defectNames?.filter(
        (name) => name.type._id === formData.defectType
      );
      setFilteredDefectNames(filtered);

      // Reset defect name when type changes
      setFormData((prev) => ({ ...prev, defectName: "" }));
      setIsLoading(false);
    } else {
      setFilteredDefectNames([]);
    }
  }, [formData.defectType, defectNames]);

  // Update the edit defect useEffect to handle details
  useEffect(() => {
    if (editDefect) {
      setFormData({
        ...editDefect,
        orderId: editDefect?.orderId?._id || editDefect?.orderId || "",
        defectType: editDefect?.defectType?._id || editDefect?.defectType || "",
        defectName: editDefect?.defectName?._id || editDefect?.defectName || "",
        defectPlace:
          editDefect?.defectPlace === null
            ? undefined
            : editDefect?.defectPlace?._id ||
              editDefect?.defectPlace ||
              undefined,
        defectProcess:
          editDefect?.defectProcess?._id ||
          editDefect?.defectProcess ||
          undefined,
        holesOrOperation: editDefect?.holesOrOperation || "",
        defectCount: editDefect?.defectCount || 1,
        description: editDefect?.description || "",
        severity: editDefect?.severity || "Low",
        detectedDate:
          editDefect?.detectedDate || new Date().toLocaleDateString(),
        productionLine: editDefect?.productionLine || "",
      });

      // Handle existing defect details for edit mode
      if (editDefect.details && editDefect.details.length > 0) {
        const formattedDetails = editDefect.details.map((detail, index) => ({
          id: `existing-${index}`,
          defectPlace: detail.defectPlace?._id || detail.defectPlace,
          defectProcess: detail.defectProcess?._id || detail.defectProcess,
          count: detail.count,
          placeName:
            detail.defectPlace?.name ||
            defectPlaces.find(
              (p) => p._id === (detail.defectPlace?._id || detail.defectPlace)
            )?.name ||
            "",
          processName:
            detail.defectProcess?.name ||
            defectProcesses.find(
              (p) =>
                p._id === (detail.defectProcess?._id || detail.defectProcess)
            )?.name ||
            "",
        }));
        setDefectDetails(formattedDetails);
      } else {
        setDefectDetails([]);
      }

      // Set active images for edit mode with proper URLs
      if (editDefect.images && editDefect.images.length > 0) {
        const imageObjects = editDefect.images.map((img) => {
          const filename = img.split("/").pop();
          return {
            url: `${process.env.REACT_APP_API_URL || ""}/${img}`,
            name: filename,
            isExisting: true,
          };
        });
        setActiveImages(imageObjects);
      }
    } else {
      // Reset details for new defect
      setDefectDetails([]);
    }
  }, [editDefect, defectTypes, defectNames, defectProcesses, defectPlaces]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, detectedDate: date });
  };

  // Handler for defect details changes
  const handleDefectDetailsChange = (details) => {
    setDefectDetails(details);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + activeImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveImages((prev) => [
          ...prev,
          {
            url: reader.result,
            name: file.name,
            file,
            isExisting: false,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = null;
  };

  const moveImageToTrash = (index) => {
    const imageToTrash = activeImages[index];
    setActiveImages((prev) => prev.filter((_, i) => i !== index));
    setTrashedImages((prev) => [...prev, imageToTrash]);
    toast.info(`Image moved to trash bin`, { autoClose: 2000 });
  };

  const restoreImage = (index) => {
    const imageToRestore = trashedImages[index];
    setTrashedImages((prev) => prev.filter((_, i) => i !== index));
    setActiveImages((prev) => [...prev, imageToRestore]);
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

  // Update the submit handler to include details
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validate defect details if provided
    const totalDetailsCount = defectDetails.reduce(
      (sum, detail) => sum + detail.count,
      0
    );

    if (
      defectDetails.length > 0 &&
      Number(totalDetailsCount) !== Number(formData.defectCount)
    ) {
      toast.error(
        `Detail count (${totalDetailsCount}) must match total defect count (${formData.defectCount})`
      );
      setIsSubmitting(false);
      return;
    }

    const formDataWithImages = new FormData();

    // Append basic form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataWithImages.append(key, value);
      }
    });

    // Append defect details to form data
    if (defectDetails.length > 0) {
      formDataWithImages.append(
        "details",
        JSON.stringify(
          defectDetails.map((detail) => ({
            count: detail.count,
            defectPlace: detail.defectPlace,
            defectProcess: detail.defectProcess,
          }))
        )
      );
    }

    // Append new files only
    activeImages.forEach((img) => {
      if (!img.isExisting && img.file) {
        formDataWithImages.append("images", img.file);
      }
    });

    // Append existing image filenames
    const existingImages = activeImages
      .filter((img) => img.isExisting)
      .map((img) => img.name);

    formDataWithImages.append("existingImages", JSON.stringify(existingImages));

    const imagesToDelete = trashedImages
      .filter((img) => img.isExisting)
      .map((img) => img.name);

    formDataWithImages.append("imagesToDelete", JSON.stringify(imagesToDelete));

    try {
      if (editDefect) {
        const updatedDefect = await updateDefect({
          editDefect,
          formDataWithImages,
        });
        updateDefectInList(updatedDefect);
        toast.success("Defect updated successfully");
      } else {
        const newDefect = await createDefect({ formDataWithImages });
        onDefectCreated(newDefect.populatedDefect);
        toast.success(newDefect.message);
      }
      closeModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to log/update defect."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDefectProcesses = defectProcesses?.filter(
    (process) => process.place._id === formData.defectPlace
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case "Medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "Low":
        return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  const sections = [
    { id: 'general', title: 'General Details', icon: Package },
    { id: 'production', title: 'Production Info', icon: Factory },
    { id: 'images', title: 'Defect Images', icon: ImageIcon },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl w-full max-w-6xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 relative max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-2xl shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {editDefect ? "Edit Defect" : "Log New Defect"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {editDefect ? "Update defect information" : "Record a new production defect"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
            
            {/* General Details Section */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-100/50 dark:border-blue-800/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  General Details
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Package className="w-4 h-4" />
                    Order Selection
                  </label>
                  <select
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  >
                    <option value="" disabled>
                      Select an Order
                    </option>
                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>
                        {order.orderNo} - {order.season}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Defect Count */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="w-4 h-4" />
                    Defect Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="defectCount"
                    value={formData.defectCount}
                    onChange={handleChange}
                    placeholder="Enter defect quantity"
                    required
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>

                {/* Defect Type */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Defect Type
                  </label>
                  <select
                    name="defectType"
                    value={formData.defectType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="" disabled>
                      Select Defect Type
                    </option>
                    {defectTypes?.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Defect Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Defect Name
                  </label>
                  <select
                    name="defectName"
                    value={formData.defectName || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 text-gray-900 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    disabled={!formData.defectType || isLoading}
                  >
                    <option value="" disabled>
                      Select Defect Name
                    </option>
                    {filteredDefectNames?.length > 0 ? (
                      filteredDefectNames?.map((name) => (
                        <option key={name._id} value={name._id}>
                          {name.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No options available</option>
                    )}
                  </select>
                </div>

                {/* Severity */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Low', 'Medium', 'High'].map((severity) => (
                      <label
                        key={severity}
                        className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.severity === severity
                            ? getSeverityColor(severity)
                            : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="severity"
                          value={severity}
                          checked={formData.severity === severity}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="font-medium">{severity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sewing or Holes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Holes', 'Operation'].map((category) => (
                      <label
                        key={category}
                        className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.holesOrOperation === category
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="holesOrOperation"
                          value={category}
                          checked={formData.holesOrOperation === category}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="font-medium">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Info className="w-4 h-4" />
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none"
                  placeholder="Describe the defect in detail..."
                  rows="3"
                />
              </div>
            </div>

            {/* Defect Details UI */}
            {formData.defectName && formData.defectCount > 0 && (
              <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border border-purple-100/50 dark:border-purple-800/30">
                <DefectDetailsUI
                  defectName={formData.defectName}
                  defectType={formData.defectType}
                  totalCount={Number(formData.defectCount)}
                  onDetailsChange={handleDefectDetailsChange}
                  defectPlaces={defectPlaces}
                  defectProcesses={defectProcesses}
                  disabled={isLoading}
                  initialDetails={defectDetails}
                />
              </div>
            )}

            {/* Production Info Section */}
            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-100/50 dark:border-green-800/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
                  <Factory className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Production Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Defect Place */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Defect Place
                  </label>
                  <select
                    name="defectPlace"
                    value={formData.defectPlace || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="" disabled hidden>
                      Select Defect Place
                    </option>
                    {defectPlaces?.map((place) => (
                      <option key={place._id} value={place._id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Defect Process */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Defect Process
                  </label>
                  <select
                    name="defectProcess"
                    value={formData.defectProcess || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 text-gray-900 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    disabled={!formData.defectPlace || isLoading}
                  >
                    <option value="" disabled>
                      Select Defect Process
                    </option>
                    {filteredDefectProcesses?.length > 0 ? (
                      filteredDefectProcesses?.map((process) => (
                        <option key={process._id} value={process._id}>
                          {process.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No options available</option>
                    )}
                  </select>
                </div>

                {/* Production Line */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
                    <Factory className="w-4 h-4" />
                    Production Line
                  </label>
                  <select
                    name="productionLine"
                    value={formData.productionLine}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="" disabled>
                      Select Production Line
                    </option>
                    {PRODUCTION_LINES.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Detected Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Detected Date
                  </label>
                  <DatePicker
                    selected={new Date(formData.detectedDate)}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            {/* Images Section */}
            <div className="bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/10 dark:to-amber-900/10 rounded-2xl p-6 border border-yellow-100/50 dark:border-yellow-800/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl">
                  <Camera className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Defect Images
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="imageUpload"
                    className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      activeImages.length >= 5
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                        : "bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-700"
                    }`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span className="font-medium">Add Images</span>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={activeImages.length >= 5}
                    />
                  </label>
                  {activeImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveImages([])}
                      className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-800 transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                      Clear All
                    </button>
                  )}
                </div>

                {/* Active Images Display */}
                {activeImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                    {activeImages.map((img, index) => (
                      <div
                        key={index}
                        className={`relative group rounded-lg overflow-hidden shadow-lg transition-transform duration-200 ${
                          isDragging ? "opacity-50" : ""
                        }`}
                        draggable={!img.isExisting}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {!img.isExisting && (
                            <button
                              type="button"
                              onClick={() => moveImageToTrash(index)}
                              className="p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Trashed Images Display */}
                {trashedImages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Trashed Images
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                      {trashedImages.map((img, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden shadow-lg"
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              type="button"
                              onClick={() => restoreImage(index)}
                              className="p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-800 transition-all duration-200"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                            {img.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Footer with Submit Button */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-8 py-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-full text-white font-semibold transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              }`}
            >
              {isSubmitting ? "Submitting..." : editDefect ? "Update Defect" : "Log Defect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LogDefectModal;
