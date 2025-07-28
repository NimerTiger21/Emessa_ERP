import React, { useState, useMemo } from 'react';
import { Map, Eye, EyeOff, Filter, BarChart3, AlertTriangle, Target, Layers } from 'lucide-react';

const GarmentDefectVisualization = () => {
  const [selectedGarment, setSelectedGarment] = useState('trousers');
  const [viewMode, setViewMode] = useState('individual'); // individual, heatmap, combined
  const [selectedFilters, setSelectedFilters] = useState({
    severity: 'all',
    dateRange: '30d',
    defectType: 'all'
  });

  // Predefined static positions for trouser components
  const trouserLocations = {
    'waistband': { x: 50, y: 15, region: 'top' },
    'front-pocket': { x: 30, y: 35, region: 'front' },
    'back-pocket': { x: 70, y: 40, region: 'back' },
    'inside-seam-front': { x: 45, y: 60, region: 'front' },
    'inside-seam-back': { x: 55, y: 60, region: 'back' },
    'outside-seam': { x: 25, y: 50, region: 'side' },
    'crotch': { x: 50, y: 45, region: 'center' },
    'knee-front': { x: 40, y: 70, region: 'front' },
    'knee-back': { x: 60, y: 70, region: 'back' },
    'hem-front': { x: 45, y: 90, region: 'front' },
    'hem-back': { x: 55, y: 90, region: 'back' },
    'zipper': { x: 50, y: 30, region: 'front' },
    'belt-loop': { x: 50, y: 18, region: 'top' },
    'thigh-front': { x: 35, y: 55, region: 'front' },
    'thigh-back': { x: 65, y: 55, region: 'back' }
  };

  // Mock defect data with predefined locations
  const mockDefects = [
    {
      id: 1,
      defectPlace: { name: 'Front Pocket' },
      defectProcess: { name: 'Stitching' },
      severity: 'critical',
      count: 3,
      detectedDate: '2024-01-15',
      locationKey: 'front-pocket',
      defectType: 'Stitching Defect'
    },
    {
      id: 2,
      defectPlace: { name: 'Inside Seam' },
      defectProcess: { name: 'Seaming' },
      severity: 'major',
      count: 2,
      detectedDate: '2024-01-14',
      locationKey: 'inside-seam-front',
      defectType: 'Seam Issue'
    },
    {
      id: 3,
      defectPlace: { name: 'Waistband' },
      defectProcess: { name: 'Hemming' },
      severity: 'minor',
      count: 1,
      detectedDate: '2024-01-13',
      locationKey: 'waistband',
      defectType: 'Minor Defect'
    },
    {
      id: 4,
      defectPlace: { name: 'Back Pocket' },
      defectProcess: { name: 'Stitching' },
      severity: 'major',
      count: 2,
      detectedDate: '2024-01-12',
      locationKey: 'back-pocket',
      defectType: 'Stitching Defect'
    },
    {
      id: 5,
      defectPlace: { name: 'Hem' },
      defectProcess: { name: 'Finishing' },
      severity: 'minor',
      count: 1,
      detectedDate: '2024-01-11',
      locationKey: 'hem-front',
      defectType: 'Finishing Issue'
    }
  ];

  const severityColors = {
    critical: { bg: 'bg-red-500', border: 'border-red-600', ring: 'ring-red-200' },
    major: { bg: 'bg-orange-500', border: 'border-orange-600', ring: 'ring-orange-200' },
    minor: { bg: 'bg-yellow-500', border: 'border-yellow-600', ring: 'ring-yellow-200' }
  };

  // Generate heatmap data by aggregating defects per location
  const heatmapData = useMemo(() => {
    const locationCounts = {};
    mockDefects.forEach(defect => {
      const key = defect.locationKey;
      if (!locationCounts[key]) {
        locationCounts[key] = { count: 0, severities: {} };
      }
      locationCounts[key].count += defect.count;
      locationCounts[key].severities[defect.severity] = 
        (locationCounts[key].severities[defect.severity] || 0) + defect.count;
    });
    return locationCounts;
  }, []);

  // Get heatmap intensity (0-1) based on defect count
  const getHeatmapIntensity = (locationKey) => {
    const maxCount = Math.max(...Object.values(heatmapData).map(d => d.count));
    return heatmapData[locationKey] ? heatmapData[locationKey].count / maxCount : 0;
  };

  // Get primary severity for a location
  const getPrimarySeverity = (locationKey) => {
    if (!heatmapData[locationKey]) return 'minor';
    const severities = heatmapData[locationKey].severities;
    if (severities.critical) return 'critical';
    if (severities.major) return 'major';
    return 'minor';
  };

  const TrouserSVG = ({ showDefects = true, mode = 'individual' }) => (
    <div className="relative">
      <svg
        viewBox="0 0 300 400"
        className="w-full h-80 border rounded-lg bg-gray-50"
        style={{ maxWidth: '300px' }}
      >
        {/* Trouser outline */}
        <path
          d="M80 50 L220 50 L220 80 L200 80 L200 200 L190 200 L190 350 L170 350 L170 380 L130 380 L130 350 L110 350 L110 200 L100 200 L100 80 L80 80 Z"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        
        {/* Waistband */}
        <rect x="80" y="50" width="140" height="15" fill="none" stroke="#d1d5db" strokeWidth="1" />
        
        {/* Front seams */}
        <line x1="135" y1="80" x2="135" y2="200" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="165" y1="80" x2="165" y2="200" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2" />
        
        {/* Pockets indication */}
        <rect x="95" y="90" width="25" height="15" fill="none" stroke="#d1d5db" strokeWidth="1" />
        <rect x="180" y="105" width="25" height="15" fill="none" stroke="#d1d5db" strokeWidth="1" />
        
        {/* Crotch line */}
        <path d="M100 140 Q150 160 200 140" fill="none" stroke="#d1d5db" strokeWidth="1" />

        {/* Defect markers */}
        {showDefects && Object.entries(trouserLocations).map(([locationKey, position]) => {
          const defectsAtLocation = mockDefects.filter(d => d.locationKey === locationKey);
          if (defectsAtLocation.length === 0) return null;

          const x = (position.x / 100) * 300;
          const y = (position.y / 100) * 400;

          if (mode === 'heatmap') {
            const intensity = getHeatmapIntensity(locationKey);
            const severity = getPrimarySeverity(locationKey);
            const colors = severityColors[severity];
            
            return (
              <g key={locationKey}>
                {/* Heatmap circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={Math.max(15, intensity * 30)}
                  fill={`rgba(239, 68, 68, ${0.1 + intensity * 0.3})`}
                  className="animate-pulse"
                />
                {/* Center dot */}
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  className={`${colors.bg} ${colors.border} border-2`}
                />
                <text
                  x={x}
                  y={y - 25}
                  className="text-xs font-medium fill-gray-700"
                  textAnchor="middle"
                >
                  {heatmapData[locationKey]?.count}
                </text>
              </g>
            );
          } else {
            // Individual mode
            return defectsAtLocation.map((defect, index) => {
              const colors = severityColors[defect.severity];
              const offsetX = x + (index * 8) - ((defectsAtLocation.length - 1) * 4);
              
              return (
                <g key={`${locationKey}-${defect.id}`}>
                  <circle
                    cx={offsetX}
                    cy={y}
                    r="8"
                    className={`${colors.bg} ${colors.border} border-2 drop-shadow-md`}
                  />
                  <circle
                    cx={offsetX}
                    cy={y}
                    r="12"
                    fill="none"
                    className={`${colors.ring} ring-2 ring-opacity-50 animate-ping`}
                  />
                  <text
                    x={offsetX}
                    y={y + 3}
                    className="text-xs font-bold fill-white"
                    textAnchor="middle"
                  >
                    {defect.count}
                  </text>
                </g>
              );
            });
          }
        })}
      </svg>
    </div>
  );

  const DefectLocationDetails = () => {
    const locationStats = Object.entries(heatmapData)
      .map(([locationKey, data]) => ({
        location: locationKey,
        count: data.count,
        severities: data.severities,
        position: trouserLocations[locationKey]
      }))
      .sort((a, b) => b.count - a.count);

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
          Problem Areas Ranking
        </h4>
        
        {locationStats.map((stat, index) => (
          <div key={stat.location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-gray-400'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-medium capitalize">
                  {stat.location.replace('-', ' ').replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-500">
                  Region: {stat.position.region}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-lg">{stat.count}</div>
              <div className="text-xs text-gray-500 space-x-1">
                {Object.entries(stat.severities).map(([severity, count]) => (
                  <span key={severity} className={`px-1 rounded text-white ${severityColors[severity].bg}`}>
                    {severity}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Garment Defect Location Visualization
        </h1>
        <p className="text-gray-600">
          Interactive defect mapping with predefined locations and heatmap analysis
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium mb-1">View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="individual">Individual Defects</option>
                <option value="heatmap">Heatmap View</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Garment Type</label>
              <select
                value={selectedGarment}
                onChange={(e) => setSelectedGarment(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="trousers">Trousers</option>
                <option value="shirt">Shirt (Coming Soon)</option>
                <option value="dress">Dress (Coming Soon)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Legend:</span>
            <div className="flex space-x-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span className="text-xs">Critical</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                <span className="text-xs">Major</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span className="text-xs">Minor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Garment Map */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Map className="w-5 h-5 mr-2 text-blue-600" />
            {viewMode === 'heatmap' ? 'Defect Heatmap' : 'Defect Locations'}
          </h3>
          
          <div className="flex justify-center">
            <TrouserSVG mode={viewMode} />
          </div>
          
          {viewMode === 'heatmap' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Heatmap View:</strong> Circle size indicates defect density. 
                Larger circles represent areas with more defects. Numbers show total defect count per location.
              </p>
            </div>
          )}
          
          {viewMode === 'individual' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Individual View:</strong> Each circle represents a specific defect occurrence. 
                Numbers inside circles show defect count. Colors indicate severity level.
              </p>
            </div>
          )}
        </div>

        {/* Statistics Panel */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <DefectLocationDetails />
          </div>

          {/* Summary Stats */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-semibold mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
              Summary Statistics
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Defects:</span>
                <span className="font-semibold">{mockDefects.reduce((sum, d) => sum + d.count, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Affected Locations:</span>
                <span className="font-semibold">{Object.keys(heatmapData).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Critical Issues:</span>
                <span className="font-semibold text-red-600">
                  {mockDefects.filter(d => d.severity === 'critical').reduce((sum, d) => sum + d.count, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Most Problematic:</span>
                <span className="font-semibold">
                  {Object.entries(heatmapData).reduce((max, [key, data]) => 
                    data.count > (heatmapData[max] || {count: 0}).count ? key : max, 
                    Object.keys(heatmapData)[0]
                  )?.replace('-', ' ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Defects */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-semibold mb-3">Recent Defects</h4>
            <div className="space-y-2">
              {mockDefects.slice(0, 3).map(defect => (
                <div key={defect.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{defect.defectPlace.name}</div>
                    <div className="text-gray-500">{defect.defectProcess.name}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${severityColors[defect.severity].bg}`}>
                    {defect.severity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Implementation Methodology:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Static Positioning:</strong> Predefined coordinates for each garment component eliminate manual clicking</li>
          <li>• <strong>Automatic Mapping:</strong> System maps defect place/process to visual location using lookup table</li>
          <li>• <strong>Heatmap Analysis:</strong> Aggregates defect data to show problem density and severity distribution</li>
          <li>• <strong>Visual Intelligence:</strong> Color coding, sizing, and animations provide immediate insights</li>
          <li>• <strong>Scalable Design:</strong> Easy to add new garment types with their own coordinate systems</li>
        </ul>
      </div>
    </div>
  );
};

export default GarmentDefectVisualization;