// src/pages/DefectDetail.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { getDefectById } from "../services/defectService";
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Map,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Tag,
  Layers,
  FileText,
  User,
  Package,
  Loader,
  XCircle,
  RotateCw,
  RotateCcw
} from "lucide-react";
import DefectStatus from "../components/DefectStatus";
import DefectComments from "../components/DefectComments";
import DefectAnalytics from "../components/DefectAnalytics";

const DefectDetail = () => {
  const { id: defectId } = useParams();
  const [defect, setDefect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMeasurementTool, setShowMeasurementTool] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // Fetch defect data
  useEffect(() => {
    const fetchDefect = async () => {
      try {
        setLoading(true);
        const fetchedDefect = await getDefectById(defectId);
        setDefect(fetchedDefect);
        console.log("fetchedDefect", fetchedDefect);
        setLoading(false);
      } catch (error) {
        setError("Failed to load defect details");
        setLoading(false);
        console.error("Error fetching defect details:", error);
      }
    };

    if (defectId) {
      fetchDefect();
    }
  }, [defectId]);

  // Image gallery navigation
  const nextImage = () => {
    if (!defect?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % defect.images.length);
    resetImageSettings();
  };

  const prevImage = () => {
    if (!defect?.images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + defect.images.length) % defect.images.length);
    resetImageSettings();
  };

  // Zoom functionality
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 5));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  // Reset all image viewing settings
  const resetImageSettings = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setRotationAngle(0);
  };

  // Rotation functionality
  const rotateClockwise = () => {
    setRotationAngle((prev) => (prev + 90) % 360);
  };

  const rotateCounterclockwise = () => {
    setRotationAngle((prev) => (prev - 90 + 360) % 360);
  };

  // Pan functionality
  const startDrag = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y
      });
    }
  };

  const onDrag = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle mouse wheel zoom
  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
    e.preventDefault();
  };

 // Keyboard navigation
 useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === '+') {
      zoomIn();
    } else if (e.key === '-') {
      zoomOut();
    } else if (e.key === 'r') {
      rotateClockwise();
    } else if (e.key === 'R') {
      rotateCounterclockwise();
    } else if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [isFullscreen, defect]);
  
  // Measurement tool
  const toggleMeasurementTool = () => {
    setShowMeasurementTool(!showMeasurementTool);
  };

  const addMeasurement = (e) => {
    if (showMeasurementTool) {
      const imageContainer = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - imageContainer.left) / imageContainer.width * 100;
      const y = (e.clientY - imageContainer.top) / imageContainer.height * 100;
      
      // Add measurement point
      if (measurements.length === 0 || measurements.length === 2) {
        setMeasurements([{ x, y }]);
      } else {
        setMeasurements([...measurements, { x, y }]);
        // Calculate distance logic would go here
      }
    }
  };

  // Severity badge color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500 text-white";
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-purple-100 text-purple-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="inline-block animate-spin h-8 w-8 text-blue-600 mb-4" />
          <p className="text-lg text-gray-600">Loading defect details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <XCircle className="inline-block h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/defectslist" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Defects List
          </Link>
        </div>
      </div>
    );
  }

  if (!defect) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <AlertTriangle className="inline-block h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Defect Not Found</h3>
          <p className="text-gray-600 mb-6">The requested defect could not be found or may have been removed.</p>
          <Link to="/defects" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Defects List
          </Link>
        </div>
      </div>
    );
  }

  // Main content once data is loaded
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fullscreen Image Viewer */}
      {/* Fullscreen Image Viewer */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="p-4 flex justify-between items-center bg-black bg-opacity-80">
            <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex space-x-4">
              <button onClick={zoomIn} className="text-white hover:text-gray-300">
                <ZoomIn className="h-6 w-6" />
              </button>
              <button onClick={zoomOut} className="text-white hover:text-gray-300">
                <ZoomOut className="h-6 w-6" />
              </button>
              <button onClick={rotateClockwise} className="text-white hover:text-gray-300">
                <RotateCw className="h-6 w-6" />
              </button>
              <button onClick={rotateCounterclockwise} className="text-white hover:text-gray-300">
                <RotateCcw className="h-6 w-6" />
              </button>
              <button onClick={resetImageSettings} className="text-white hover:text-gray-300">
                <span className="text-sm">Reset</span>
              </button>
            </div>
            <div className="text-white">
              {currentImageIndex + 1} / {defect.images?.length || 0}
            </div>
          </div>
          
          <div className="flex-1 relative overflow-hidden"
            onMouseDown={startDrag}
            onMouseMove={onDrag}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {defect.images && defect.images.length > 0 && (
              <img
                //src={`http://localhost:5000/${defect.images[currentImageIndex]}`}
                src={`${process.env.REACT_APP_API_URL}/${defect.images[currentImageIndex]}`}
                alt={`Defect ${currentImageIndex + 1}`}
                className="absolute"
                style={{
                  transform: `rotate(${rotationAngle}deg) scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  transformOrigin: 'center',
                  maxHeight: '100%',
                  maxWidth: '100%',
                  margin: 'auto',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              />
            )}
            
            {/* Navigation buttons */}
            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-4">
              <button 
                onClick={prevImage}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button 
                onClick={nextImage}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header/Navigation */}
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link 
              to="/defectslist" 
              className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to List</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Order #{defect.id} 
              <span className="ml-2 text-lg text-gray-500">
                | {defect.orderId?.orderNo || "No Order"}
              </span>
            </h1>
          </div>
          
          <div className="flex space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(defect.severity)}`}>
              {defect.severity} Severity
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(defect.status)}`}>
              {defect.status}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Image Gallery */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Image Viewer */}
              <div className="relative h-96">
                {defect.images && defect.images.length > 0 ? (
                  <div 
                    className="h-full w-full flex items-center justify-center relative overflow-hidden"
                    onMouseDown={startDrag}
                    onMouseMove={onDrag}
                    onMouseUp={endDrag}
                    onMouseLeave={endDrag}
                    onWheel={handleWheel}
                    onClick={addMeasurement}
                    style={{ cursor: showMeasurementTool ? 'crosshair' : (isDragging ? 'grabbing' : 'grab') }}
                  >
                    <img
                      // src={`http://localhost:5000/${defect.images[currentImageIndex]}`}
                      src={`${process.env.REACT_APP_API_URL}/${defect.images[currentImageIndex]}`}

                      alt={`Defect ${currentImageIndex + 1}`}
                      className="max-h-full max-w-full object-contain"
                      style={{
                        transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                        transformOrigin: 'center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                      }}
                    />
                    
                    {/* Measurement points overlay */}
                    {showMeasurementTool && measurements.map((point, index) => (
                      <div 
                        key={index}
                        className="absolute h-4 w-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white"
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      />
                    ))}
                    
                    {/* Measurement line */}
                    {showMeasurementTool && measurements.length === 2 && (
                      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                        <line 
                          x1={`${measurements[0].x}%`} 
                          y1={`${measurements[0].y}%`} 
                          x2={`${measurements[1].x}%`} 
                          y2={`${measurements[1].y}%`} 
                          stroke="red" 
                          strokeWidth="2" 
                          strokeDasharray="5,5"
                        />
                      </svg>
                    )}
                    
                    {/* Navigation buttons */}
                    {defect.images.length > 1 && (
                      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-4">
                        <button 
                          onClick={prevImage}
                          className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button 
                          onClick={nextImage}
                          className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </div>
                    )}
                    
                    {/* Defect indicator marker */}
                    {defect.defectLocation && (
                      <div 
                        className="absolute h-8 w-8 border-4 border-red-500 rounded-full animate-pulse"
                        style={{ 
                          left: `${defect.defectLocation.x}%`, 
                          top: `${defect.defectLocation.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>
              
              {/* Image Gallery Controls */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button 
                      onClick={zoomIn}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={zoomOut}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={rotateClockwise}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Rotate Clockwise"
                    >
                      <RotateCw className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={rotateCounterclockwise}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Rotate Counter-Clockwise"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={resetImageSettings}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded text-sm"
                      title="Reset Image"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={toggleMeasurementTool}
                      className={`p-2 rounded ${showMeasurementTool ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                      title="Measurement Tool"
                    >
                      <Map className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-4">
                      {currentImageIndex + 1} / {defect.images?.length || 0}
                    </span>
                    <button 
                      onClick={toggleFullscreen}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Fullscreen"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Rotation angle indicator */}
                {rotationAngle !== 0 && (
                  <div className="mt-2 text-sm text-gray-500 text-center">
                    Rotation: {rotationAngle}°
                  </div>
                )}
                
                {/* Thumbnail Gallery */}
                {defect.images && defect.images.length > 1 && (
                  <div className="mt-4 flex space-x-2 overflow-x-auto py-2">
                    {defect.images.map((image, index) => (
                      <button 
                        key={index}
                        className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          resetImageSettings();
                        }}
                      >
                        <img 
                          //src={`http://localhost:5000/${image}`}
                          src={`${process.env.REACT_APP_API_URL}/${image}`}
                          alt={`Thumbnail ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Measurement Data */}
                {showMeasurementTool && measurements.length === 2 && (
                  <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded text-sm">
                    <p>Measured distance: 
                      {/* Calculate actual distance based on fabric scale if available */}
                      {Math.sqrt(
                        Math.pow(measurements[1].x - measurements[0].x, 2) + 
                        Math.pow(measurements[1].y - measurements[0].y, 2)
                      ).toFixed(2)} units
                    </p>
                  </div>
                )}

                {/* Keyboard shortcuts help */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-blue-600">Keyboard shortcuts</summary>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      <div>Arrow Left: Previous image</div>
                      <div>Arrow Right: Next image</div>
                      <div>+: Zoom in</div>
                      <div>-: Zoom out</div>
                      <div>r: Rotate clockwise</div>
                      <div>R: Rotate counter-clockwise</div>
                      <div>Esc: Exit fullscreen</div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
            {/* </div>*******************************####################################************************************ */}
            
            {/* Defect Location Map */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Map className="h-5 w-5 mr-2 text-blue-600" />
                Defect Location
              </h3>
              
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                {defect.garmentMap ? (
                  <img 
                    //src={`http://localhost:5000/${defect.garmentMap}`}
                    src={`${process.env.REACT_APP_API_URL}/${defect.garmentMap}`}
                    alt="Garment Map"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Garment map not available</p>
                  </div>
                )}
                
                {/* Location marker */}
                {defect.mapLocation && (
                  <div 
                    className="absolute h-6 w-6 bg-red-500 rounded-full border-2 border-white"
                    style={{ 
                      left: `${defect.mapLocation.x}%`, 
                      top: `${defect.mapLocation.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
              </div>
              
              {/* Location details */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Component</p>
                  <p className="font-medium">{defect.defectPlace?.name || "Not specified"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium">{defect.defectProcess?.name || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Details tabs */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b">
                <button 
                  className={`px-4 py-3 font-medium ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button 
                  className={`px-4 py-3 font-medium ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Analytics
                </button>                
                {/* <button 
                  className={`px-4 py-3 font-medium ${activeTab === 'comments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                  onClick={() => setActiveTab('comments')}
                >
                  Comments
                </button> */}
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Primary Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Defect Information
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Defect Name:</span>
                            <span className="font-medium">{defect.defectName?.name || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Category:</span>
                            <span className="font-medium">{defect.defectType?.name || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Description:</span>
                            <span className="font-medium">{defect.description || "No description"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Root Cause:</span>
                            <span className="font-medium">{defect.rootCause || "Not determined"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                          <Package className="h-5 w-5 mr-2 text-blue-600" />
                          Product Information
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Order ID:</span>
                            <span className="font-medium">{defect.orderId?.orderNo || "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Season:</span>
                            <span className="font-medium">{defect.orderId?.season || "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Style Number:</span>
                            <span className="font-medium">{defect.orderId?.style?.styleNo || "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Fabric:</span>
                            <span className="font-medium">{defect.orderId?.fabric?.name || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Fabric Color:</span>
                            <span className="font-medium">
                              {defect.orderId?.fabric?.color && (
                                <span className="inline-flex items-center">
                                  <span 
                                    className="inline-block h-4 w-4 rounded-full mr-1"
                                    style={{ backgroundColor: defect.fabricColorHex || '#ccc' }}
                                  />
                                  {defect.orderId?.fabric?.color}
                                </span>
                              ) || "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Details */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
      <Layers className="h-5 w-5 mr-2 text-blue-600" />
      Production Details
    </h3>
    
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Production Line:</span>
        <span className="font-medium">{defect.productionLine || "N/A"}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Production Date:</span>
        <span className="font-medium">
          {defect.productionDate ? format(new Date(defect.productionDate), 'MMM dd, yyyy') : "N/A"}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Shift:</span>
        <span className="font-medium">{defect.shift || "N/A"}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Operator:</span>
        <span className="font-medium">{defect.operator || "N/A"}</span>
      </div>
    </div>
  </div>
  
  <div>
    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
      <User className="h-5 w-5 mr-2 text-blue-600" />
      Quality Control Info
    </h3>
    
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Detected By:</span>
        <span className="font-medium">{defect.detectedBy || "N/A"}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Detection Date:</span>
        <span className="font-medium">
          {defect.detectionDate ? format(new Date(defect.detectionDate), 'MMM dd, yyyy') : "N/A"}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">QC Checkpoint:</span>
        <span className="font-medium">{defect.qcCheckpoint || "N/A"}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">AQL Level:</span>
        <span className="font-medium">{defect.aqlLevel || "N/A"}</span>
      </div>
    </div>
  </div>
</div>

{/* Timeline */}
<div className="mt-6">
  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
    Timeline
  </h3>
  
  <div className="border-l-2 border-gray-200 pl-4 space-y-6">
    <div className="relative">
      <div className="absolute -left-6 mt-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-4 border-white"></div>
      <p className="text-sm text-gray-500">
        {defect.createdAt ? format(new Date(defect.createdAt), 'MMM dd, yyyy - h:mm a') : "Unknown"}
      </p>
      <p className="font-medium">Defect Created</p>
      <p className="text-sm text-gray-600 mt-1">
        Defect was initially reported in the system
      </p>
    </div>
  </div>
</div>
                  </div>
                )}
                {/* Analytics Tab */}
{activeTab === 'analytics' && (
  <div>
    <DefectAnalytics defectId={defectId} defectData={defect} />
  </div>
)}
{/* Comments Tab */}
{activeTab === 'comments' && (
  <div>
    <p className="text-gray-500 text-center py-8">Comments feature is currently under development.</p>
     {/* Uncomment when ready: */}
     <DefectComments defectId={defectId} />
  </div>
)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectDetail;