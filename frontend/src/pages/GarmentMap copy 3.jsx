import React, { useState, useEffect } from 'react';
import { Map, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

const DefectHeatMap = () => {
  const [selectedView, setSelectedView] = useState('front');
  
  // Sample aggregated location data from your analytics
  const locationAnalytics = {
    front: [
      { x: 20, y: 30, count: 15, severity: 'High', area: 'Left Pocket' },
      { x: 80, y: 25, count: 8, severity: 'Medium', area: 'Right Pocket' },
      { x: 50, y: 45, count: 22, severity: 'High', area: 'Center Seam' },
      { x: 35, y: 60, count: 5, severity: 'Low', area: 'Left Thigh' },
      { x: 65, y: 58, count: 12, severity: 'Medium', area: 'Right Thigh' },
      { x: 50, y: 75, count: 18, severity: 'High', area: 'Knee Area' },
      { x: 25, y: 85, count: 7, severity: 'Medium', area: 'Left Calf' },
      { x: 75, y: 88, count: 9, severity: 'Medium', area: 'Right Calf' }
    ],
    back: [
      { x: 50, y: 20, count: 11, severity: 'Medium', area: 'Waistband Back' },
      { x: 30, y: 35, count: 6, severity: 'Low', area: 'Left Back Pocket' },
      { x: 70, y: 38, count: 14, severity: 'High', area: 'Right Back Pocket' },
      { x: 50, y: 55, count: 20, severity: 'High', area: 'Back Seam' },
      { x: 40, y: 70, count: 8, severity: 'Medium', area: 'Left Hamstring' },
      { x: 60, y: 72, count: 10, severity: 'Medium', area: 'Right Hamstring' },
      { x: 45, y: 90, count: 4, severity: 'Low', area: 'Left Heel' },
      { x: 55, y: 92, count: 6, severity: 'Low', area: 'Right Heel' }
    ]
  };

  // Get heat intensity based on count (0-1 scale)
  const getHeatIntensity = (count) => {
    const maxCount = Math.max(...locationAnalytics[selectedView].map(loc => loc.count));
    return count / maxCount;
  };

  // Get color based on intensity and severity
  const getHeatColor = (count, severity) => {
    const intensity = getHeatIntensity(count);
    
    if (severity === 'High') {
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`; // Red spectrum
    } else if (severity === 'Medium') {
      return `rgba(245, 158, 11, ${0.3 + intensity * 0.7})`; // Orange spectrum
    } else {
      return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`; // Green spectrum
    }
  };

  // Get pulse animation intensity
  const getPulseIntensity = (count) => {
    const intensity = getHeatIntensity(count);
    return intensity > 0.7 ? 'animate-pulse' : '';
  };

  const totalDefects = locationAnalytics[selectedView].reduce((sum, loc) => sum + loc.count, 0);
  const highSeverityCount = locationAnalytics[selectedView].filter(loc => loc.severity === 'High').length;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Map className="h-7 w-7 mr-3 text-blue-600" />
            Defect Location Heat Map
          </h2>
          <div className="flex bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setSelectedView('front')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedView === 'front' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Front View
            </button>
            <button
              onClick={() => setSelectedView('back')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedView === 'back' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Back View
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Defects</p>
                <p className="text-2xl font-bold text-gray-800">{totalDefects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">High Severity</p>
                <p className="text-2xl font-bold text-red-600">{highSeverityCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Hot Spots</p>
                <p className="text-2xl font-bold text-green-600">
                  {locationAnalytics[selectedView].filter(loc => getHeatIntensity(loc.count) > 0.6).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heat Map Container */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="relative">
          {/* Trouser Silhouette */}
          <div className="relative mx-auto" style={{ width: '400px', height: '600px' }}>
            {/* SVG Trouser Outline */}
            <svg 
              width="400" 
              height="600" 
              viewBox="0 0 400 600" 
              className="absolute inset-0 z-10"
            >
              {selectedView === 'front' ? (
                // Front view trouser outline
                <path
                  d="M150 50 L250 50 L270 100 L280 150 L275 200 L270 250 L260 300 L250 350 L245 400 L240 450 L230 500 L220 550 L210 600 L190 600 L200 550 L210 500 L215 450 L220 400 L225 350 L230 300 L235 250 L225 200 L220 150 L200 120 L180 120 L160 150 L155 200 L165 250 L170 300 L175 350 L180 400 L185 450 L190 500 L200 550 L190 600 L170 600 L180 550 L170 500 L160 450 L155 400 L150 350 L140 300 L130 250 L125 200 L120 150 L130 100 Z"
                  fill="rgba(71, 85, 105, 0.1)"
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              ) : (
                // Back view trouser outline  
                <path
                  d="M150 50 L250 50 L270 100 L280 150 L275 200 L270 250 L260 300 L250 350 L245 400 L240 450 L230 500 L220 550 L210 600 L190 600 L200 550 L210 500 L215 450 L220 400 L225 350 L230 300 L235 250 L225 200 L220 150 L200 120 L180 120 L160 150 L155 200 L165 250 L170 300 L175 350 L180 400 L185 450 L190 500 L200 550 L190 600 L170 600 L180 550 L170 500 L160 450 L155 400 L150 350 L140 300 L130 250 L125 200 L120 150 L130 100 Z"
                  fill="rgba(71, 85, 105, 0.1)"
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
            </svg>

            {/* Heat Points */}
            {locationAnalytics[selectedView].map((location, index) => (
              <div key={index} className="absolute group">
                {/* Heat Circle */}
                <div
                  className={`absolute rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-125 ${getPulseIntensity(location.count)}`}
                  style={{
                    left: `${location.x}%`,
                    top: `${location.y}%`,
                    width: `${20 + getHeatIntensity(location.count) * 40}px`,
                    height: `${20 + getHeatIntensity(location.count) * 40}px`,
                    backgroundColor: getHeatColor(location.count, location.severity),
                    transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 ${10 + getHeatIntensity(location.count) * 20}px ${getHeatColor(location.count, location.severity)}`,
                  }}
                />
                
                {/* Count Badge */}
                <div
                  className="absolute bg-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
                  style={{
                    left: `${location.x}%`,
                    top: `${location.y}%`,
                    width: '24px',
                    height: '24px',
                    transform: 'translate(-50%, -50%)',
                    color: location.severity === 'High' ? '#dc2626' : location.severity === 'Medium' ? '#d97706' : '#16a34a',
                    zIndex: 20
                  }}
                >
                  {location.count}
                </div>

                {/* Tooltip */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30"
                  style={{
                    left: `${location.x}%`,
                    top: `${location.y - 8}%`,
                    transform: 'translate(-50%, -100%)',
                  }}>
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
                    <div className="font-semibold">{location.area}</div>
                    <div>Defects: {location.count}</div>
                    <div className={`font-medium ${
                      location.severity === 'High' ? 'text-red-400' : 
                      location.severity === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {location.severity} Severity
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center">
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Heat Map Legend</h4>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500 opacity-70"></div>
                <span className="text-sm text-gray-600">High Severity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-70"></div>
                <span className="text-sm text-gray-600">Medium Severity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500 opacity-70"></div>
                <span className="text-sm text-gray-600">Low Severity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs font-bold bg-white rounded-full w-6 h-6 flex items-center justify-center border">12</div>
                <span className="text-sm text-gray-600">Defect Count</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Issues Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Problem Areas ({selectedView} view)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locationAnalytics[selectedView]
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{location.area}</p>
                  <p className="text-sm text-gray-500">{location.severity} severity</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">{location.count}</p>
                  <p className="text-xs text-gray-500">defects</p>
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DefectHeatMap;
