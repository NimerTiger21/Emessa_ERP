import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, RotateCw, Eye, EyeOff, TrendingUp, AlertTriangle, MapPin, Layers, Activity, BarChart3, Settings, Filter } from 'lucide-react';

const EnhancedTrouserHeatMap = ({ defectData = [] }) => {
  const [currentView, setCurrentView] = useState('front');
  const [showIntensity, setShowIntensity] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [animateHotspots, setAnimateHotspots] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterPlace, setFilterPlace] = useState('all');
  const [showProcessDetails, setShowProcessDetails] = useState(false);

  // Define defect places with coordinates based on your schema structure
  const defectPlaces = {
    'WB': { // Waistband
      name: 'Waistband',
      coordinates: { front: { x: 50, y: 8 }, back: { x: 50, y: 8 } },
      processes: [
        { name: 'Piping of WB', coordinates: { front: { x: 50, y: 12 }, back: { x: 50, y: 12 } } },
        { name: 'Elastic band', coordinates: { front: { x: 50, y: 6 }, back: { x: 50, y: 6 } } },
        { name: 'Corner of waist band', coordinates: { front: { x: 35, y: 10 }, back: { x: 35, y: 10 } } },
        { name: 'WB joint', coordinates: { front: { x: 65, y: 10 }, back: { x: 65, y: 10 } } },
        { name: 'Button hole', coordinates: { front: { x: 50, y: 5 }, back: { x: 50, y: 5 } } },
        { name: 'Loops', coordinates: { front: { x: 45, y: 8 }, back: { x: 55, y: 8 } } }
      ]
    },
    'Front': {
      name: 'Front',
      coordinates: { front: { x: 50, y: 45 }, back: null },
      processes: [
        { name: 'Hemming of front pocket', coordinates: { front: { x: 30, y: 35 }, back: null } },
        { name: 'Coin pocket', coordinates: { front: { x: 32, y: 30 }, back: null } },
        { name: 'J stitch', coordinates: { front: { x: 50, y: 40 }, back: null } },
        { name: 'Crotch', coordinates: { front: { x: 50, y: 55 }, back: null } }
      ]
    },
    'Side': {
      name: 'Side',
      coordinates: { front: { x: 20, y: 50 }, back: { x: 20, y: 50 } },
      processes: [
        { name: 'Side seam', coordinates: { front: { x: 18, y: 45 }, back: { x: 18, y: 45 } } },
        { name: 'Over side seam', coordinates: { front: { x: 22, y: 50 }, back: { x: 22, y: 50 } } },
        { name: 'Double Stitch of side seam', coordinates: { front: { x: 20, y: 55 }, back: { x: 20, y: 55 } } },
        { name: 'Stitch D/N over side', coordinates: { front: { x: 25, y: 48 }, back: { x: 25, y: 48 } } }
      ]
    },
    'Leg': {
      name: 'Leg',
      coordinates: { front: { x: 40, y: 85 }, back: { x: 40, y: 85 } },
      processes: [
        { name: 'Hemming', coordinates: { front: { x: 40, y: 95 }, back: { x: 40, y: 95 } } },
        { name: 'Different distance between leg', coordinates: { front: { x: 50, y: 80 }, back: { x: 50, y: 80 } } }
      ]
    },
    'Back': {
      name: 'Back',
      coordinates: { front: null, back: { x: 50, y: 45 } },
      processes: [
        { name: 'Back pocket', coordinates: { front: null, back: { x: 38, y: 30 } } },
        { name: 'Back yoke', coordinates: { front: null, back: { x: 50, y: 25 } } },
        { name: 'Back leg', coordinates: { front: null, back: { x: 45, y: 70 } } },
        { name: 'Back pocket corner', coordinates: { front: null, back: { x: 42, y: 35 } } },
        { name: 'Hem back leg', coordinates: { front: null, back: { x: 45, y: 90 } } }
      ]
    }
  };

  // Mock defect data based on your schema structure
  const mockDefectData = [
    {
      _id: '1',
      defectName: { name: 'Loose Stitching' },
      defectType: { name: 'Construction' },
      defectPlace: { name: 'WB', _id: 'wb1' },
      defectProcess: { name: 'Piping of WB', _id: 'wb_piping1' },
      severity: 'High',
      status: 'Open',
      defectCount: 12,
      holesOrOperation: 'Operation',
      productionLine: 'Line A',
      details: [{ count: 8, defectPlace: 'wb1' }, { count: 4, defectPlace: 'wb1' }]
    },
    {
      _id: '2',
      defectName: { name: 'Fabric Tear' },
      defectType: { name: 'Material' },
      defectPlace: { name: 'Front', _id: 'front1' },
      defectProcess: { name: 'Crotch', _id: 'front_crotch1' },
      severity: 'Critical',
      status: 'In Progress',
      defectCount: 18,
      holesOrOperation: 'Holes',
      productionLine: 'Line B',
      details: [{ count: 18 }]
    },
    {
      _id: '3',
      defectName: { name: 'Uneven Seam' },
      defectType: { name: 'Stitching' },
      defectPlace: { name: 'Side', _id: 'side1' },
      defectProcess: { name: 'Side seam', _id: 'side_seam1' },
      severity: 'Medium',
      status: 'Open',
      defectCount: 7,
      holesOrOperation: 'Operation',
      productionLine: 'Line A',
      details: [{ count: 7 }]
    },
    {
      _id: '4',
      defectName: { name: 'Pocket Misalignment' },
      defectType: { name: 'Construction' },
      defectPlace: { name: 'Back', _id: 'back1' },
      defectProcess: { name: 'Back pocket', _id: 'back_pocket1' },
      severity: 'Low',
      status: 'Resolved',
      defectCount: 5,
      holesOrOperation: 'Operation',
      productionLine: 'Line C',
      details: [{ count: 5 }]
    },
    {
      _id: '5',
      defectName: { name: 'Hem Irregularity' },
      defectType: { name: 'Finishing' },
      defectPlace: { name: 'Leg', _id: 'leg1' },
      defectProcess: { name: 'Hemming', _id: 'leg_hem1' },
      severity: 'Medium',
      status: 'Open',
      defectCount: 9,
      holesOrOperation: 'Operation',
      productionLine: 'Line B',
      details: [{ count: 6 }, { count: 3 }]
    },
    {
      _id: '6',
      defectName: { name: 'Button Hole Issue' },
      defectType: { name: 'Construction' },
      defectPlace: { name: 'WB', _id: 'wb2' },
      defectProcess: { name: 'Button hole', _id: 'wb_button1' },
      severity: 'High',
      status: 'Open',
      defectCount: 11,
      holesOrOperation: 'Holes',
      productionLine: 'Line A',
      details: [{ count: 11 }]
    }
  ];

  // Get coordinates for a defect based on place and process
  const getDefectCoordinates = (defect) => {
    const place = defectPlaces[defect.defectPlace.name];
    if (!place) return null;

    // If process is specified and showProcessDetails is true, use process coordinates
    if (showProcessDetails && defect.defectProcess) {
      const process = place.processes.find(p => p.name === defect.defectProcess.name);
      if (process && process.coordinates[currentView]) {
        return process.coordinates[currentView];
      }
    }

    // Otherwise use place coordinates
    return place.coordinates[currentView];
  };

  // Filter data based on current view and filters
  const filteredData = useMemo(() => {
    return mockDefectData.filter(defect => {
      const coords = getDefectCoordinates(defect);
      if (!coords) return false;

      const matchesSeverity = filterSeverity === 'all' || defect.severity === filterSeverity;
      const matchesPlace = filterPlace === 'all' || defect.defectPlace.name === filterPlace;
      
      return matchesSeverity && matchesPlace;
    });
  }, [currentView, filterSeverity, filterPlace, showProcessDetails]);

  // Calculate heat map intensity
  const getHeatIntensity = (count) => {
    const maxCount = Math.max(...mockDefectData.map(d => d.defectCount));
    return (count / maxCount) * 100;
  };

  // Get color based on severity and intensity
  const getHotspotColor = (severity, count) => {
    const intensity = getHeatIntensity(count);
    const colors = {
      'Critical': `rgba(239, 68, 68, ${0.4 + (intensity / 100) * 0.6})`,
      'High': `rgba(245, 101, 101, ${0.3 + (intensity / 100) * 0.5})`,
      'Medium': `rgba(251, 191, 36, ${0.25 + (intensity / 100) * 0.45})`,
      'Low': `rgba(34, 197, 94, ${0.2 + (intensity / 100) * 0.4})`
    };
    return colors[severity] || colors['Low'];
  };

  // Get ring color for hotspot border
  const getRingColor = (severity) => {
    const colors = {
      'Critical': '#DC2626',
      'High': '#EF4444',
      'Medium': '#F59E0B',
      'Low': '#10B981'
    };
    return colors[severity] || colors['Low'];
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDefects = mockDefectData.reduce((sum, item) => sum + item.defectCount, 0);
    const criticalDefects = mockDefectData.filter(item => item.severity === 'Critical').reduce((sum, item) => sum + item.defectCount, 0);
    const mostProblematicDefect = mockDefectData.reduce((max, item) => item.defectCount > max.defectCount ? item : max, { defectCount: 0 });
    
    return {
      total: totalDefects,
      critical: criticalDefects,
      hotspot: mostProblematicDefect,
      components: mockDefectData.length
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Trouser Defect Location System</h2>
            <p className="opacity-90">Real-time defect tracking with coordinate mapping</p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90">Total Defects</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-200">{stats.critical}</div>
              <div className="text-sm opacity-90">Critical Issues</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('front')}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === 'front' 
                ? 'bg-white text-indigo-600 font-medium' 
                : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Front View
            </button>
            <button
              onClick={() => setCurrentView('back')}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === 'back' 
                ? 'bg-white text-indigo-600 font-medium' 
                : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Back View
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all" className="text-gray-800">All Severities</option>
              <option value="Critical" className="text-gray-800">Critical</option>
              <option value="High" className="text-gray-800">High</option>
              <option value="Medium" className="text-gray-800">Medium</option>
              <option value="Low" className="text-gray-800">Low</option>
            </select>

            <select
              value={filterPlace}
              onChange={(e) => setFilterPlace(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all" className="text-gray-800">All Places</option>
              <option value="WB" className="text-gray-800">Waistband</option>
              <option value="Front" className="text-gray-800">Front</option>
              <option value="Side" className="text-gray-800">Side</option>
              <option value="Leg" className="text-gray-800">Leg</option>
              <option value="Back" className="text-gray-800">Back</option>
            </select>
          </div>

          <button
            onClick={() => setShowProcessDetails(!showProcessDetails)}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              showProcessDetails ? 'bg-white/30' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">Process Details</span>
          </button>

          <button
            onClick={() => setAnimateHotspots(!animateHotspots)}
            className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 flex items-center space-x-2"
          >
            {animateHotspots ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="text-sm">Animations</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Main Heat Map View */}
        <div className="lg:w-2/3 p-6">
          <div className="relative">
            {/* Enhanced Trouser Silhouette */}
            <div className="relative mx-auto" style={{ maxWidth: '450px', height: '650px' }}>
              
              {/* SVG Trouser Outline - More Detailed */}
              <svg 
                viewBox="0 0 450 650" 
                className="w-full h-full absolute inset-0"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
              >
                {/* Front View */}
                {currentView === 'front' && (
                  <g>
                    {/* Waistband */}
                    <rect x="135" y="30" width="180" height="25" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" rx="12"/>
                    <circle cx="225" cy="20" r="4" fill="#64748b" /> {/* Button */}
                    
                    {/* Belt Loops */}
                    <rect x="155" y="30" width="4" height="15" fill="#64748b" rx="2"/>
                    <rect x="200" y="30" width="4" height="15" fill="#64748b" rx="2"/>
                    <rect x="245" y="30" width="4" height="15" fill="#64748b" rx="2"/>
                    <rect x="290" y="30" width="4" height="15" fill="#64748b" rx="2"/>
                    
                    {/* Main Front Panel */}
                    <path
                      d="M 140 55 L 310 55 L 315 180 L 335 420 L 355 600 L 320 600 L 300 420 L 280 350 L 260 350 L 225 360 L 190 350 L 170 350 L 150 420 L 130 600 L 95 600 L 115 420 L 135 180 L 140 55 Z"
                      fill="#ffffff"
                      stroke="#64748b"
                      strokeWidth="3"
                    />
                    
                    {/* Front Pockets */}
                    <path d="M 155 120 Q 155 115 160 115 L 185 115 Q 190 115 190 120 L 190 170 Q 190 175 185 175 L 160 175 Q 155 175 155 170 Z" 
                          fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5"/>
                    <path d="M 260 120 Q 260 115 265 115 L 290 115 Q 295 115 295 120 L 295 170 Q 295 175 290 175 L 265 175 Q 260 175 260 170 Z" 
                          fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5"/>
                    
                    {/* Coin Pocket */}
                    <ellipse cx="175" cy="140" rx="8" ry="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1"/>
                    
                    {/* Front Seams */}
                    <line x1="225" y1="55" x2="225" y2="360" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3"/>
                    <line x1="170" y1="350" x2="150" y2="600" stroke="#cbd5e1" strokeWidth="1"/>
                    <line x1="280" y1="350" x2="300" y2="600" stroke="#cbd5e1" strokeWidth="1"/>
                    
                    {/* Side Seams */}
                    <line x1="140" y1="55" x2="130" y2="600" stroke="#94a3b8" strokeWidth="2"/>
                    <line x1="310" y1="55" x2="320" y2="600" stroke="#94a3b8" strokeWidth="2"/>
                  </g>
                )}

                {/* Back View */}
                {currentView === 'back' && (
                  <g>
                    {/* Waistband */}
                    <rect x="135" y="30" width="180" height="25" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" rx="12"/>
                    
                    {/* Belt Loops */}
                    <rect x="155" y="30" width="4" height="15" fill="#64748b" rx="2"/>
                    <rect x="200" y="30" width="4" height="15" fill="#64748b" rx="2"/>
                    <rect x="245" y="30" width="4" height="15" fill="#64748b" rx="2"/>
                    <rect x="290" y="30" width="4" height="15" fill="#64748b" rx="2"/>
                    
                    {/* Main Back Panel */}
                    <path
                      d="M 140 55 L 310 55 L 315 180 L 335 420 L 355 600 L 320 600 L 300 420 L 280 350 L 225 360 L 170 350 L 150 420 L 130 600 L 95 600 L 115 420 L 135 180 L 140 55 Z"
                      fill="#ffffff"
                      stroke="#64748b"
                      strokeWidth="3"
                    />
                    
                    {/* Back Yoke */}
                    <path d="M 150 90 L 300 90 L 310 150 L 225 160 L 140 150 Z" 
                          fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5"/>
                    
                    {/* Back Pockets */}
                    <rect x="165" y="130" width="35" height="45" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" rx="4"/>
                    <rect x="250" y="130" width="35" height="45" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" rx="4"/>
                    
                    {/* Back Seam */}
                    <line x1="225" y1="55" x2="225" y2="600" stroke="#64748b" strokeWidth="2"/>
                    
                    {/* Side Seams */}
                    <line x1="140" y1="55" x2="130" y2="600" stroke="#94a3b8" strokeWidth="2"/>
                    <line x1="310" y1="55" x2="320" y2="600" stroke="#94a3b8" strokeWidth="2"/>
                  </g>
                )}
              </svg>

              {/* Heat Map Hotspots */}
              {filteredData.map((defect) => {
                const coords = getDefectCoordinates(defect);
                if (!coords) return null;

                const size = 24 + (getHeatIntensity(defect.defectCount) / 100) * 40;
                const pulseDelay = Math.random() * 2;
                
                return (
                  <div
                    key={defect._id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10"
                    style={{
                      left: `${coords.x}%`,
                      top: `${coords.y}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      zIndex: selectedHotspot?._id === defect._id ? 20 : 10,
                    }}
                    onClick={() => setSelectedHotspot(defect)}
                  >
                    {/* Hotspot Circle */}
                    <div
                      className={`w-full h-full rounded-full border-3 ${
                        animateHotspots ? 'animate-pulse' : ''
                      } ${selectedHotspot?._id === defect._id ? 'ring-4 ring-blue-400' : ''}`}
                      style={{
                        backgroundColor: getHotspotColor(defect.severity, defect.defectCount),
                        borderColor: getRingColor(defect.severity),
                        borderWidth: '3px',
                        animationDelay: `${pulseDelay}s`,
                      }}
                    />
                    
                    {/* Defect Count Badge */}
                    <div
                      className="absolute -top-3 -right-3 bg-white rounded-full text-xs font-bold shadow-lg flex items-center justify-center border-2"
                      style={{
                        width: '24px',
                        height: '24px',
                        color: getRingColor(defect.severity),
                        borderColor: getRingColor(defect.severity),
                      }}
                    >
                      {defect.defectCount}
                    </div>
                    
                    {/* Status Indicator */}
                    <div
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: defect.status === 'Open' ? '#ef4444' : 
                                        defect.status === 'In Progress' ? '#f59e0b' : '#10b981'
                      }}
                    />
                    
                    {/* Ripple Effect for Critical */}
                    {defect.severity === 'Critical' && animateHotspots && (
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          backgroundColor: getRingColor(defect.severity),
                          opacity: 0.3,
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* View Label */}
              <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
                {showProcessDetails && <span className="ml-2 text-xs opacity-75">(Process Mode)</span>}
              </div>

              {/* Coordinate Grid (Optional - for debugging) */}
              {false && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 11 }, (_, i) => (
                    <div key={i} className="absolute text-xs text-gray-400" style={{ left: `${i * 10}%`, top: '2px' }}>
                      {i * 10}
                    </div>
                  ))}
                  {Array.from({ length: 11 }, (_, i) => (
                    <div key={i} className="absolute text-xs text-gray-400" style={{ top: `${i * 10}%`, left: '2px' }}>
                      {i * 10}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Legend */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                Heat Map Legend
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {['Critical', 'High', 'Medium', 'Low'].map((severity) => (
                  <div key={severity} className="flex items-center space-x-2">
                    <div
                      className="w-5 h-5 rounded-full border-2"
                      style={{
                        backgroundColor: getHotspotColor(severity, 10),
                        borderColor: getRingColor(severity),
                      }}
                    />
                    <span className="text-sm text-gray-600 font-medium">{severity}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Open</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Resolved</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                • Circle size indicates defect frequency • Numbers show exact count • Click hotspots for details
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:w-1/3 bg-gray-50 p-6">
          {/* Selected Hotspot Details */}
          {selectedHotspot && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-800">Hotspot Details</h4>
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: getHotspotColor(selectedHotspot.severity, selectedHotspot.count),
                    color: getRingColor(selectedHotspot.severity),
                  }}
                >
                  {selectedHotspot.severity}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Component:</span>
                  <span className="font-medium">{selectedHotspot.component}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Defect Count:</span>
                  <span className="font-bold text-red-600">{selectedHotspot.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{selectedHotspot.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Heat Intensity:</span>
                  <span className="font-medium">{getHeatIntensity(selectedHotspot.count).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Summary */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Analytics Summary
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm font-medium">Most Critical</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">{stats.hotspot.component}</div>
                  <div className="text-xs text-gray-500">{stats.hotspot.count} defects</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                  <div className="text-xs text-gray-500">Components</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredData.reduce((sum, item) => sum + item.count, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Issues</div>
                </div>
              </div>
            </div>
          </div>

          {/* Component List */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-blue-600" />
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Components
            </h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredData
                .sort((a, b) => b.count - a.count)
                .map((defect) => (
                  <div
                    key={defect.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedHotspot?.id === defect.id ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedHotspot(defect)}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getRingColor(defect.severity) }}
                      />
                      <span className="text-sm font-medium">{defect.component}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-700">{defect.count}</span>
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTrouserHeatMap;
