// hooks/useImageGallery.js - Create this custom hook file
import { useState, useMemo, useCallback } from 'react';

export const useImageGallery = (defects) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  // Memoized flattened images array
  const allImages = useMemo(() => {
    const images = [];
    
    defects.forEach((defect, defectIndex) => {
      if (defect.images && defect.images.length > 0) {
        defect.images.forEach((imgPath, imgIndex) => {
          images.push({
            src: `${process.env.REACT_APP_API_URL}/${imgPath}`,
            defect: defect,
            defectIndex: defectIndex,
            imageIndex: imgIndex,
            title: defect.defectType?.name || 'Defect Image',
            description: defect.defectName?.name || defect.description || 'No description available'
          });
        });
      }
    });
    
    return images;
  }, [defects]);

  // Open modal with specific image
  const openModal = useCallback((defectIndex, imageIndex = 0) => {
    // Find the global index for this specific image
    let globalIndex = 0;
    let found = false;
    
    for (let i = 0; i < defects.length && !found; i++) {
      if (i === defectIndex) {
        globalIndex += imageIndex;
        found = true;
      } else if (defects[i].images && defects[i].images.length > 0) {
        globalIndex += defects[i].images.length;
      }
    }
    
    if (found && globalIndex < allImages.length) {
      setCurrentImageIndex(globalIndex);
      setIsModalOpen(true);
    }
  }, [defects, allImages.length]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentImageIndex(null);
  }, []);

  // Navigate to previous image
  const goToPrevious = useCallback(() => {
    if (currentImageIndex !== null && allImages.length > 0) {
      setCurrentImageIndex(prevIndex => 
        prevIndex > 0 ? prevIndex - 1 : allImages.length - 1
      );
    }
  }, [currentImageIndex, allImages.length]);

  // Navigate to next image
  const goToNext = useCallback(() => {
    if (currentImageIndex !== null && allImages.length > 0) {
      setCurrentImageIndex(prevIndex => 
        prevIndex < allImages.length - 1 ? prevIndex + 1 : 0
      );
    }
  }, [currentImageIndex, allImages.length]);

  // Jump to specific image index
  const goToImage = useCallback((index) => {
    if (index >= 0 && index < allImages.length) {
      setCurrentImageIndex(index);
    }
  }, [allImages.length]);

  return {
    // State
    isModalOpen,
    currentImageIndex,
    allImages,
    
    // Actions
    openModal,
    closeModal,
    goToPrevious,
    goToNext,
    goToImage,
    
    // Computed values
    hasImages: allImages.length > 0,
    currentImage: currentImageIndex !== null ? allImages[currentImageIndex] : null
  };
};