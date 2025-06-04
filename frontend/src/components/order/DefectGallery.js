// components/DefectGallery.js - Create this as a separate component
import React from 'react';
import { Search, Calendar } from 'lucide-react';
//import '../styles/animations.css'; // Assuming you have a CSS file for animations

const DefectGallery = ({ 
  defects, 
  onImageClick, 
  onViewDetails, 
  getSeverityColor, 
  currentColor 
}) => {
  if (!defects || defects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Search className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No defects have been reported for this order</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {defects.map((defect, defectIndex) => (
        <DefectCard
          key={defect._id}
          defect={defect}
          defectIndex={defectIndex}
          onImageClick={onImageClick}
          onViewDetails={onViewDetails}
          getSeverityColor={getSeverityColor}
          currentColor={currentColor}
        />
      ))}
    </div>
  );
};

const DefectCard = ({ 
  defect, 
  defectIndex, 
  onImageClick, 
  onViewDetails, 
  getSeverityColor, 
  currentColor 
}) => {
  const hasImages = defect.images && defect.images.length > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {hasImages ? (
          <ImageGallerySection
            defect={defect}
            defectIndex={defectIndex}
            onImageClick={onImageClick}
            getSeverityColor={getSeverityColor}
          />
        ) : (
          <PlaceholderImage 
            defect={defect} 
            getSeverityColor={getSeverityColor} 
          />
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <DefectCardHeader defect={defect} />
        <DefectCardDetails defect={defect} />
        <DefectCardFooter 
          defect={defect} 
          onViewDetails={() => onViewDetails(defectIndex)}
          currentColor={currentColor}
        />
      </div>
    </div>
  );
};

const ImageGallerySection = ({ defect, defectIndex, onImageClick, getSeverityColor }) => (
  <div className="flex space-x-2 overflow-x-auto p-2 w-full">
    {defect.images.map((imgPath, imgIndex) => (
      <div
        key={imgIndex}
        className="relative group flex-shrink-0 cursor-pointer overflow-hidden rounded-lg shadow-md"
        onClick={() => onImageClick(defectIndex, imgIndex)}
      >
        <img
          src={`${process.env.REACT_APP_API_URL}/${imgPath}`}
          alt={defect.defectType?.name || "Defect Image"}
          className="w-32 h-40 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
        />
        
        {/* Severity Badge */}
        {imgIndex === 0 && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(defect.severity)}`}>
            {defect.severity}
          </div>
        )}
        
        {/* Image Label */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
          <span className="text-white text-xs font-medium">
            {defect.defectName?.name || `Image ${imgIndex + 1}`}
          </span>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <Search className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    ))}
  </div>
);

const PlaceholderImage = ({ defect, getSeverityColor }) => (
  <>
    <img
      src={`/api/placeholder/400/300?text=${encodeURIComponent(defect.defectType?.name || 'Defect')}`}
      alt={defect.defectType?.name || 'Defect'}
      className="object-cover w-full h-full"
    />
    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(defect.severity)}`}>
      {defect.severity}
    </div>
  </>
);

const DefectCardHeader = ({ defect }) => (
  <div className="flex justify-between items-start mb-2">
    <h4 className="font-semibold text-gray-900 text-lg">
      {defect.defectType?.name || 'Unknown Defect'}
    </h4>
    <div className="text-xs text-gray-500 flex items-center">
      <Calendar className="w-3 h-3 mr-1" />
      {defect.createdAt
        ? new Date(defect.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString()}
    </div>
  </div>
);

const DefectCardDetails = ({ defect }) => (
  <div className="space-y-2 mb-4">
    <p className="text-sm text-gray-600 line-clamp-2">
      {defect.defectName?.name || 'No description available'}
    </p>
    
    {(defect.defectPlace || defect.defectProcess) && (
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {defect.defectPlace && (
          <span className="bg-gray-100 px-2 py-1 rounded">
            📍 {defect.defectPlace.name}
          </span>
        )}
        {defect.defectProcess && (
          <span className="bg-gray-100 px-2 py-1 rounded">
            ⚙️ {defect.defectProcess.name}
          </span>
        )}
      </div>
    )}
    
    {defect.defectCount && (
      <div className="text-sm font-medium text-gray-700">
        Count: <span className="text-red-600">{defect.defectCount}</span>
      </div>
    )}
  </div>
);

const DefectCardFooter = ({ defect, onViewDetails, currentColor }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs font-medium bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
      {defect.status || 'Open'}
    </span>
    <button
      className="text-sm font-medium hover:underline transition-colors duration-200"
      style={{ color: currentColor }}
      onClick={onViewDetails}
    >
      View Details
    </button>
  </div>
);

export default DefectGallery;