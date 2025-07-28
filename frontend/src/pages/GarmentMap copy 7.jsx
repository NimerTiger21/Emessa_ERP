import React, { useState } from 'react';
import { Map, MapPin, Info, Plus } from 'lucide-react';

const GarmentHeatMap = () => {
  const [defects, setDefects] = useState([
    {
      id: 1,
      component: "Back",
      position: "Back rise",
      count: 2,
      mapLocation: { x: 50, y: 25 },
      severity: "high"
    },
    {
      id: 2,
      component: "Front",
      position: "Waistband",
      count: 1,
      mapLocation: { x: 50, y: 15 },
      severity: "medium"
    },
    {
      id: 3,
      component: "Left Leg",
      position: "Inseam",
      count: 3,
      mapLocation: { x: 35, y: 60 },
      severity: "high"
    }
  ]);

  const [selectedDefect, setSelectedDefect] = useState(null);
  const [isAddingDefect, setIsAddingDefect] = useState(false);

  const handleImageClick = (e) => {
    if (!isAddingDefect) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newDefect = {
      id: defects.length + 1,
      component: "New Component",
      position: "New Position",
      count: 1,
      mapLocation: { x, y },
      severity: "medium"
    };
    
    setDefects([...defects, newDefect]);
    setIsAddingDefect(false);
    setSelectedDefect(newDefect);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeveritySize = (count) => {
    if (count >= 3) return 'h-8 w-8';
    if (count >= 2) return 'h-6 w-6';
    return 'h-4 w-4';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Map className="h-6 w-6 mr-3 text-blue-600" />
            Garment Defect Heat-Map
          </h2>
          <button
            onClick={() => setIsAddingDefect(!isAddingDefect)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isAddingDefect 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAddingDefect ? 'Cancel Adding' : 'Add Defect'}
          </button>
        </div>

        {isAddingDefect && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-sm">
              Click anywhere on the garment image to mark a new defect location
            </p>
          </div>
        )}

        {/* Main Heat-Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Garment Image with Heat-Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Defect Location Map
              </h3>
              
              <div 
                className="relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden cursor-pointer"
                style={{ height: '500px' }}
                onClick={handleImageClick}
              >
                {/* Garment SVG Illustration */}
                <svg
                  viewBox="0 0 200 300"
                  className="w-full h-full"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                >
                  {/* Trouser Outline */}
                  <g fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2">
                    {/* Waistband */}
                    <rect x="60" y="30" width="80" height="10" rx="2" />
                    
                    {/* Main body */}
                    <path d="M65 40 L135 40 L130 120 L120 120 L115 180 L125 280 L105 280 L95 180 L85 180 L95 280 L75 280 L85 180 L80 120 L70 120 Z" />
                    
                    {/* Inseams */}
                    <line x1="95" y1="180" x2="95" y2="280" strokeDasharray="3,3" opacity="0.6" />
                    <line x1="105" y1="180" x2="105" y2="280" strokeDasharray="3,3" opacity="0.6" />
                  </g>
                  
                  {/* Component Labels */}
                  <text x="100" y="25" textAnchor="middle" className="text-xs fill-gray-600" fontSize="8">Front</text>
                  <text x="100" y="50" textAnchor="middle" className="text-xs fill-gray-600" fontSize="8">Back Rise</text>
                  <text x="50" y="130" textAnchor="middle" className="text-xs fill-gray-600" fontSize="8">Left Leg</text>
                  <text x="150" y="130" textAnchor="middle" className="text-xs fill-gray-600" fontSize="8">Right Leg</text>
                </svg>

                {/* Defect Markers */}
                {defects.map((defect) => {
                  const isSelected = selectedDefect?.id === defect.id;
                  return (
                    <div key={defect.id}>
                      {/* Main marker */}
                      <div
                        className={`absolute ${getSeverityColor(defect.severity)} ${getSeveritySize(defect.count)} rounded-full border-2 ${
                          isSelected ? 'border-yellow-400 border-4' : 'border-white'
                        } cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-300 ${
                          isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                        }`}
                        style={{
                          left: `${defect.mapLocation.x}%`,
                          top: `${defect.mapLocation.y}%`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDefect(defect);
                        }}
                      >
                        {defect.count}
                      </div>
                      
                      {/* Pulsing ring animation for selected marker */}
                      {isSelected && (
                        <div
                          className="absolute rounded-full border-2 border-yellow-400 animate-ping transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${defect.mapLocation.x}%`,
                            top: `${defect.mapLocation.y}%`,
                            width: '3rem',
                            height: '3rem',
                          }}
                        />
                      )}
                      
                      {/* Location label for selected marker */}
                      {isSelected && (
                        <div
                          className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg transform -translate-x-1/2 z-30"
                          style={{
                            left: `${defect.mapLocation.x}%`,
                            top: `${defect.mapLocation.y - 15}%`,
                          }}
                        >
                          <div className="text-center">
                            <div className="font-bold">📍 {defect.component}</div>
                            <div className="text-xs opacity-90">⚙️ {defect.position}</div>
                            <div className="text-xs text-yellow-400">Count: {defect.count}</div>
                          </div>
                          {/* Arrow pointing to marker */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-red-500 rounded-full mr-2"></div>
                  <span>High Severity (3+ defects)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-orange-500 rounded-full mr-2"></div>
                  <span>Medium Severity (2 defects)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Low Severity (1 defect)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Defect List Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Defect Locations ({defects.length})
              </h3>

              <div className="space-y-3">
                {defects.map((defect) => (
                  <div
                    key={defect.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                      selectedDefect?.id === defect.id 
                        ? 'bg-blue-50 border-blue-300 shadow-md transform scale-105' 
                        : 'bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => setSelectedDefect(defect)}
                  >
                    {/* Component */}
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">Component</span>
                      <div className="flex items-center mt-1">
                        <span className="text-lg">📍</span>
                        <span className="font-bold text-gray-800 ml-2">{defect.component}</span>
                      </div>
                    </div>
                    
                    {/* Position */}
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">Position</span>
                      <div className="flex items-center mt-1">
                        <span className="text-lg">⚙️</span>
                        <span className="font-semibold text-gray-700 ml-2">{defect.position}</span>
                      </div>
                    </div>
                    
                    {/* Count */}
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">Count:</span>
                      <span className="font-bold text-red-600 ml-1 text-lg">{defect.count}</span>
                    </div>
                    
                    {/* Location indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Location {defect.id}
                      </span>
                      <div className="flex items-center">
                        <div className={`h-3 w-3 ${getSeverityColor(defect.severity)} rounded-full mr-2`}></div>
                        <span className="text-xs text-gray-500">
                          Click to show on map
                        </span>
                      </div>
                    </div>
                    
                    {/* Show coordinates when selected */}
                    {selectedDefect?.id === defect.id && (
                      <div className="mt-3 pt-3 border-t border-blue-200 bg-blue-25">
                        <div className="text-xs text-blue-700">
                          <span className="font-medium">Map Coordinates:</span>
                          <br />
                          X: {defect.mapLocation.x.toFixed(1)}%, Y: {defect.mapLocation.y.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  💡 Click on any defect above to highlight its location on the garment map
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarmentHeatMap;
