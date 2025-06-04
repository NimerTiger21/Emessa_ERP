// ImageModal.js - Create this as a separate component file
import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex, 
  onPrevious, 
  onNext,
  getSeverityColor 
}) => {
  // Memoized keyboard handler
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNext();
        break;
      default:
        break;
    }
  }, [onClose, onPrevious, onNext]);
  // Effect for keyboard listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyDown]);

  // Early return if modal is not open
  if (!isOpen || !images || images.length === 0 || currentIndex === null) {
    return null;
  }

  const currentImage = images[currentIndex];

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 p-2 text-white hover:text-gray-300 transition-colors duration-200 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 p-3 text-white hover:text-gray-300 transition-all duration-200 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 p-3 text-white hover:text-gray-300 transition-all duration-200 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl max-h-full mx-4 flex flex-col items-center">
        {/* Image Container */}
        <div className="relative mb-6 group">
          <img
            src={currentImage.src}
            alt={currentImage.title}
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
            draggable={false}
          />
          
          {/* Severity Badge */}
          <div className={`absolute top-4 right-4 px-3 py-2 rounded-full text-sm font-medium shadow-lg ${getSeverityColor(currentImage.defect.severity)}`}>
            {currentImage.defect.severity}
          </div>

          {/* Zoom Indicator */}
          <div className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Image Information Panel */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6 max-w-3xl w-full shadow-2xl">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentImage.title}
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              {currentImage.description}
            </p>
          </div>
          
          {/* Defect Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <DetailItem 
              label="Defect Count" 
              value={currentImage.defect.defectCount || 1} 
            />
            <DetailItem 
              label="Status" 
              value={currentImage.defect.status || 'Open'} 
            />
            {currentImage.defect.defectPlace && (
              <DetailItem 
                label="Location" 
                value={currentImage.defect.defectPlace.name} 
              />
            )}
            {currentImage.defect.defectProcess && (
              <DetailItem 
                label="Process" 
                value={currentImage.defect.defectProcess.name} 
              />
            )}
            {currentImage.defect.detectedDate && (
              <DetailItem 
                label="Detected" 
                value={new Date(currentImage.defect.detectedDate).toLocaleDateString()} 
              />
            )}
          </div>

          {/* Image Counter and Navigation Dots */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Image {currentIndex + 1} of {images.length}
            </div>
            
            {/* Navigation Dots */}
            {images.length > 1 && images.length <= 10 && (
              <div className="flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // You'll need to pass this handler from parent
                      const diff = index - currentIndex;
                      if (diff > 0) {
                        for (let i = 0; i < diff; i++) onNext();
                      } else if (diff < 0) {
                        for (let i = 0; i < Math.abs(diff); i++) onPrevious();
                      }
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-blue-600 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for detail items
const DetailItem = ({ label, value }) => (
  <div className="text-center">
    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </span>
    <span className="block text-sm font-semibold text-gray-900">
      {value}
    </span>
  </div>
);

export default ImageModal;