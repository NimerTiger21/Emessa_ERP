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
                {defects.map((defect) => (
                  <div
                    key={defect.id}
                    className={`absolute ${getSeverityColor(defect.severity)} ${getSeveritySize(defect.count)} rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform`}
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
                ))}
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

          {/* Defect Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Defect Details
              </h3>

              {selectedDefect ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Selected Defect</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">📍 Component:</span>
                        <p className="font-medium">{selectedDefect.component}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">⚙️ Position:</span>
                        <p className="font-medium">{selectedDefect.position}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Count:</span>
                        <p className="font-medium text-red-600">{selectedDefect.count}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Coordinates:</span>
                        <p className="font-medium text-xs">
                          X: {selectedDefect.mapLocation.x.toFixed(1)}%, 
                          Y: {selectedDefect.mapLocation.y.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Click on a defect marker to view details</p>
                </div>
              )}

              {/* All Defects Summary */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">All Defects ({defects.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {defects.map((defect) => (
                    <div
                      key={defect.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDefect?.id === defect.id 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedDefect(defect)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{defect.component}</p>
                          <p className="text-xs text-gray-500">{defect.position}</p>
                        </div>
                        <div className={`h-4 w-4 ${getSeverityColor(defect.severity)} rounded-full flex items-center justify-center text-white text-xs`}>
                          {defect.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarmentHeatMap;
