import React, { useState, useEffect, useRef } from 'react';
import { Map, AlertCircle, Eye, Filter, BarChart3, Thermometer } from 'lucide-react';

const TrouserDefectHeatMap = () => {
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [viewMode, setViewMode] = useState('front'); // 'front' or 'back'
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const canvasRef = useRef(null);

  // Mock defect data with coordinates
  const mockDefects = [
    {
      _id: '1',
      defectPlace: { name: 'Back', _id: 'place1' },
      defectProcess: { name: 'Back rise', _id: 'process1' },
      severity: 'High',
      defectCount: 2,
      coordinates: { x: 50, y: 25, side: 'back' }, // Back rise area
      status: 'Open'
    },
    {
      _id: '2',
      defectPlace: { name: 'Front', _id: 'place2' },
      defectProcess: { name: 'Zipper', _id: 'process2' },
      severity: 'Medium',
      defectCount: 1,
      coordinates: { x: 50, y: 40, side: 'front' }, // Zipper area
      status: 'In Progress'
    },
    {
      _id: '3',
      defectPlace: { name: 'Front', _id: 'place2' },
      defectProcess: { name: 'Coin pocket', _id: 'process3' },
      severity: 'Low',
      defectCount: 3,
      coordinates: { x: 65, y: 45, side: 'front' }, // Coin pocket area
      status: 'Open'
    },
    {
      _id: '4',
      defectPlace: { name: 'Back', _id: 'place1' },
      defectProcess: { name: 'Back pocket', _id: 'process4' },
      severity: 'High',
      defectCount: 1,
      coordinates: { x: 35, y: 45, side: 'back' }, // Back pocket area
      status: 'Resolved'
    },
    {
      _id: '5',
      defectPlace: { name: 'Front', _id: 'place2' },
      defectProcess: { name: 'J-stitch', _id: 'process5' },
      severity: 'Medium',
      defectCount: 2,
      coordinates: { x: 45, y: 55, side: 'front' }, // J-stitch area
      status: 'Open'
    }
  ];

  // Trouser outline paths
  const trouserPaths = {
    front: "M150 50 Q160 45 170 50 L170 80 Q175 85 175 90 L175 120 Q180 125 180 130 L180 200 Q185 210 185 220 L185 280 L180 380 L175 480 L170 580 Q165 590 160 590 L140 590 Q135 590 130 585 L125 580 L120 480 L115 380 L110 280 L110 220 Q110 210 115 200 L115 130 Q115 125 120 120 L120 90 Q120 85 125 80 L125 50 Q135 45 150 50 Z",
    back: "M150 50 Q160 45 170 50 L170 80 L170 120 L170 200 L170 280 L165 380 L160 480 L155 580 Q150 590 145 590 L135 590 Q130 590 125 585 L120 580 L115 480 L110 380 L105 280 L105 200 L105 120 L105 80 L105 50 Q115 45 135 50 L150 50 Z"
  };

  // Heat map intensity calculation
  const calculateHeatIntensity = (x, y, side) => {
    const relevantDefects = mockDefects.filter(d => 
      d.coordinates.side === side &&
      filterSeverity === 'All' || d.severity === filterSeverity
    );
    
    let intensity = 0;
    relevantDefects.forEach(defect => {
      const distance = Math.sqrt(
        Math.pow(defect.coordinates.x - x, 2) + 
        Math.pow(defect.coordinates.y - y, 2)
      );
      const influence = Math.max(0, 1 - distance / 30); // 30px influence radius
      intensity += influence * defect.defectCount * getSeverityWeight(defect.severity);
    });
    
    return Math.min(intensity, 1);
  };

  const getSeverityWeight = (severity) => {
    switch(severity) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 1;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'High': return 'rgb(239, 68, 68)';
      case 'Medium': return 'rgb(245, 158, 11)';
      case 'Low': return 'rgb(34, 197, 94)';
      default: return 'rgb(107, 114, 128)';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Open': return '🔴';
      case 'In Progress': return '🟡';
      case 'Resolved': return '🟢';
      default: return '⚪';
    }
  };

  // Draw heat map on canvas
  useEffect(() => {
    if (showHeatMap && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      
      for (let x = 0; x < canvas.width; x += 4) {
        for (let y = 0; y < canvas.height; y += 4) {
          const mapX = (x / canvas.width) * 100;
          const mapY = (y / canvas.height) * 100;
          const intensity = calculateHeatIntensity(mapX, mapY, viewMode);
          
          if (intensity > 0.1) {
            const alpha = Math.min(intensity * 0.7, 0.7);
            const red = Math.floor(255 * intensity);
            const blue = Math.floor(255 * (1 - intensity));
            
            for (let dx = 0; dx < 4 && x + dx < canvas.width; dx++) {
              for (let dy = 0; dy < 4 && y + dy < canvas.height; dy++) {
                const index = ((y + dy) * canvas.width + (x + dx)) * 4;
                imageData.data[index] = red;
                imageData.data[index + 1] = 50;
                imageData.data[index + 2] = blue;
                imageData.data[index + 3] = alpha * 255;
              }
            }
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
  }, [showHeatMap, viewMode, filterSeverity]);

  const currentDefects = mockDefects.filter(d => 
    d.coordinates.side === viewMode &&
    (filterSeverity === 'All' || d.severity === filterSeverity)
  );

  const totalDefects = currentDefects.reduce((sum, d) => sum + d.defectCount, 0);
  const severityBreakdown = mockDefects.reduce((acc, d) => {
    acc[d.severity] = (acc[d.severity] || 0) + d.defectCount;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Thermometer className="h-6 w-6 mr-2 text-red-500" />
            Trouser Defect Heat Map
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHeatMap(!showHeatMap)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showHeatMap
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              {showHeatMap ? 'Hide Heat Map' : 'Show Heat Map'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">View:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="front">Front View</option>
              <option value="back">Back View</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <label className="font-medium text-gray-700">Severity:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total Defects</h3>
            <p className="text-2xl font-bold text-blue-900">{totalDefects}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800">High Severity</h3>
            <p className="text-2xl font-bold text-red-900">{severityBreakdown.High || 0}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Medium Severity</h3>
            <p className="text-2xl font-bold text-yellow-900">{severityBreakdown.Medium || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Low Severity</h3>
            <p className="text-2xl font-bold text-green-900">{severityBreakdown.Low || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Defect List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-600" />
            Defect List - {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
          </h2>
          <div className="space-y-3">
            {currentDefects.map((defect) => (
              <div
                key={defect._id}
                onClick={() => setSelectedDefect(selectedDefect?._id === defect._id ? null : defect)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedDefect?._id === defect._id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      📍 {defect.defectPlace.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ⚙️ {defect.defectProcess.name}
                    </p>
                    <p className="text-sm font-medium">
                      Count: <span className="text-red-600">{defect.defectCount}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: getSeverityColor(defect.severity) + '20',
                          color: getSeverityColor(defect.severity)
                        }}
                      >
                        {defect.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getStatusIcon(defect.status)} {defect.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trouser Visualization */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Map className="h-5 w-5 mr-2 text-green-600" />
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View Defect Map
          </h2>
          
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            {/* SVG Trouser Outline */}
            <svg 
              viewBox="0 0 300 600" 
              className="w-full h-full"
              style={{ filter: showHeatMap ? 'brightness(0.7)' : 'none' }}
            >
              {/* Trouser outline */}
              <path
                d={trouserPaths[viewMode]}
                fill="#E5E7EB"
                stroke="#9CA3AF"
                strokeWidth="2"
              />
              
              {/* Defect markers */}
              {currentDefects.map((defect) => (
                <g key={defect._id}>
                  <circle
                    cx={defect.coordinates.x * 3}
                    cy={defect.coordinates.y * 6}
                    r={selectedDefect?._id === defect._id ? "12" : "8"}
                    fill={getSeverityColor(defect.severity)}
                    stroke="white"
                    strokeWidth="2"
                    className={`cursor-pointer transition-all ${
                      selectedDefect?._id === defect._id ? 'animate-pulse' : ''
                    }`}
                    onClick={() => setSelectedDefect(selectedDefect?._id === defect._id ? null : defect)}
                  />
                  <text
                    x={defect.coordinates.x * 3}
                    y={defect.coordinates.y * 6 + 4}
                    textAnchor="middle"
                    className="fill-white text-xs font-bold pointer-events-none"
                  >
                    {defect.defectCount}
                  </text>
                </g>
              ))}
              
              {/* Anatomical labels */}
              {viewMode === 'front' && (
                <>
                  <text x="150" y="30" textAnchor="middle" className="fill-gray-600 text-sm font-medium">Waistband</text>
                  <text x="150" y="240" textAnchor="middle" className="fill-gray-600 text-sm font-medium">Zipper</text>
                  <text x="195" y="270" textAnchor="middle" className="fill-gray-600 text-sm font-medium">Coin Pocket</text>
                  <text x="135" y="330" textAnchor="middle" className="fill-gray-600 text-sm font-medium">J-Stitch</text>
                </>
              )}
              {viewMode === 'back' && (
                <>
                  <text x="150" y="30" textAnchor="middle" className="fill-gray-600 text-sm font-medium">Waistband</text>
                  <text x="150" y="150" textAnchor="middle" className="fill-gray-600 text-sm font-medium">Back Rise</text>
                  <text x="105" y="270" textAnchor="middle" className="fill-gray-600 text-sm font-medium">Back Pocket</text>
                </>
              )}
            </svg>

            {/* Heat map overlay */}
            {showHeatMap && (
              <canvas
                ref={canvasRef}
                width={300}
                height={600}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ mixBlendMode: 'multiply' }}
              />
            )}
          </div>

          {/* Selected defect details */}
          {selectedDefect && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Selected Defect Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Component</p>
                  <p className="font-medium">{selectedDefect.defectPlace.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium">{selectedDefect.defectProcess.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Severity</p>
                  <p className="font-medium" style={{ color: getSeverityColor(selectedDefect.severity) }}>
                    {selectedDefect.severity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{getStatusIcon(selectedDefect.status)} {selectedDefect.status}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Severity Levels</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">High Severity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Medium Severity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">Low Severity</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Status Indicators</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>🔴</span>
                <span className="text-sm">Open</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🟡</span>
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🟢</span>
                <span className="text-sm">Resolved</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Heat Map</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Intensity based on defect count and severity</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-300 to-red-500"></div>
                <span className="text-sm">Low to High Intensity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrouserDefectHeatMap;
