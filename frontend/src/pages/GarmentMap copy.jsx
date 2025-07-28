import React, { useState, useRef, useEffect } from 'react';
import { Map, Plus, BarChart3, Filter, Eye, EyeOff, Target, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';

const GarmentMapMockup = () => {
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedTemplate, setSelectedTemplate] = useState('tshirt');
  const [defectPoints, setDefectPoints] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    dateRange: '7d',
    defectType: ''
  });
  const [selectedDefectType, setSelectedDefectType] = useState('');
  
  // Mock data
  const templates = [
    { id: 'tshirt', name: 'T-Shirt Front', category: 'tops' },
    { id: 'jeans', name: 'Jeans Front', category: 'bottoms' },
    { id: 'dress', name: 'Dress Front', category: 'dresses' }
  ];
  
  const defectTypes = [
    'Stitching Defect', 'Fabric Tear', 'Color Bleeding', 'Misalignment', 'Pilling'
  ];
  
  const severityColors = {
    critical: 'bg-red-500',
    major: 'bg-orange-500',
    minor: 'bg-yellow-500'
  };
  
  // Mock analytics data
  const analyticsData = {
    trendData: [
      { month: 'Jan', count: 45 },
      { month: 'Feb', count: 52 },
      { month: 'Mar', count: 38 },
      { month: 'Apr', count: 61 },
      { month: 'May', count: 43 }
    ],
    locationStats: {
      'Collar-Stitching': 25,
      'Shoulder-Seam': 18,
      'Sleeve-Hemming': 15,
      'Chest-Print': 12,
      'Bottom-Hem': 8
    },
    heatmapPoints: [
      { x: 50, y: 20, intensity: 8, severity: 'critical', defectPlace: 'Collar', defectProcess: 'Stitching' },
      { x: 30, y: 35, intensity: 6, severity: 'major', defectPlace: 'Shoulder', defectProcess: 'Seam' },
      { x: 70, y: 35, intensity: 6, severity: 'major', defectPlace: 'Shoulder', defectProcess: 'Seam' },
      { x: 45, y: 50, intensity: 4, severity: 'minor', defectPlace: 'Chest', defectProcess: 'Print' },
      { x: 55, y: 50, intensity: 4, severity: 'minor', defectPlace: 'Chest', defectProcess: 'Print' },
      { x: 25, y: 45, intensity: 5, severity: 'major', defectPlace: 'Sleeve', defectProcess: 'Hemming' },
      { x: 75, y: 45, intensity: 5, severity: 'major', defectPlace: 'Sleeve', defectProcess: 'Hemming' },
      { x: 50, y: 85, intensity: 3, severity: 'minor', defectPlace: 'Bottom', defectProcess: 'Hem' }
    ]
  };

  // Interactive Garment Map Component
  const InteractiveGarmentMap = ({ onLocationClick, points = [], isInteractive = true }) => {
    const mapRef = useRef(null);
    
    const handleMapClick = (e) => {
      if (!isInteractive || !onLocationClick) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      onLocationClick({ x, y });
    };
    
    return (
      <div className="relative inline-block bg-gray-50 rounded-lg p-4">
        <div 
          ref={mapRef}
          className={`relative w-64 h-80 bg-white rounded border-2 border-dashed border-gray-300 ${
            isInteractive ? 'cursor-crosshair hover:border-blue-400' : ''
          }`}
          onClick={handleMapClick}
          style={{
            backgroundImage: selectedTemplate === 'tshirt' ? 
              `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'%3E%3Cpath d='M20,25 L30,20 L35,15 L65,15 L70,20 L80,25 L80,35 L75,30 L75,110 L25,110 L25,30 Z' fill='none' stroke='%23e5e7eb' stroke-width='1'/%3E%3C/svg%3E")` :
              selectedTemplate === 'jeans' ?
              `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'%3E%3Cpath d='M30,20 L70,20 L70,60 L65,60 L65,110 L55,110 L50,100 L45,110 L35,110 L35,60 L30,60 Z' fill='none' stroke='%23e5e7eb' stroke-width='1'/%3E%3C/svg%3E")` :
              `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'%3E%3Cpath d='M25,25 L35,20 L65,20 L75,25 L75,110 L25,110 Z' fill='none' stroke='%23e5e7eb' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '80%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        >
          {/* Defect Points */}
          {points.map((point, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
            >
              <div 
                className={`rounded-full border-2 border-white shadow-lg ${
                  severityColors[point.severity] || 'bg-blue-500'
                } animate-pulse`}
                style={{
                  width: `${Math.max(8, point.intensity * 2)}px`,
                  height: `${Math.max(8, point.intensity * 2)}px`,
                }}
                title={`${point.defectPlace || 'Unknown'} - ${point.defectProcess || 'Unknown'} (${point.intensity || 1})`}
              />
            </div>
          ))}
          
          {/* Heatmap Overlay */}
          {showHeatmap && points.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {points.map((point, index) => (
                <div
                  key={`heat-${index}`}
                  className="absolute rounded-full"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    width: `${Math.max(30, point.intensity * 8)}px`,
                    height: `${Math.max(30, point.intensity * 8)}px`,
                    background: `radial-gradient(circle, rgba(255,0,0,${0.1 + (point.intensity * 0.05)}) 0%, rgba(255,100,0,${0.05 + (point.intensity * 0.03)}) 50%, transparent 100%)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
          )}
          
          {isInteractive && (
            <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
              Click to mark defects
            </div>
          )}
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-gray-700">
            {templates.find(t => t.id === selectedTemplate)?.name}
          </span>
        </div>
      </div>
    );
  };

  // Add defect point
  const handleLocationClick = (coordinates) => {
    if (!selectedDefectType) {
      alert('Please select a defect type first!');
      return;
    }
    
    const newPoint = {
      ...coordinates,
      intensity: Math.floor(Math.random() * 5) + 1,
      severity: ['minor', 'major', 'critical'][Math.floor(Math.random() * 3)],
      defectPlace: ['Collar', 'Shoulder', 'Sleeve', 'Chest', 'Bottom'][Math.floor(Math.random() * 5)],
      defectProcess: ['Stitching', 'Seam', 'Hemming', 'Print', 'Cut'][Math.floor(Math.random() * 5)],
      defectType: selectedDefectType,
      id: Date.now()
    };
    
    setDefectPoints([...defectPoints, newPoint]);
  };

  // Defect Entry Tab
  const DefectEntryTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          Add New Defect
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Garment Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Defect Type</label>
            <select
              value={selectedDefectType}
              onChange={(e) => setSelectedDefectType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select defect type...</option>
              {defectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-6">
          <InteractiveGarmentMap 
            onLocationClick={handleLocationClick}
            points={defectPoints}
            isInteractive={true}
          />
          
          <div className="flex-1">
            <h4 className="font-medium mb-3">Marked Defects ({defectPoints.length})</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {defectPoints.map((point, index) => (
                <div key={point.id} className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium">{point.defectType}</span>
                      <div className="text-xs text-gray-600">
                        {point.defectPlace} - {point.defectProcess}
                      </div>
                      <div className="text-xs text-gray-500">
                        Position: ({point.x.toFixed(1)}%, {point.y.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full text-white ${severityColors[point.severity]}`}>
                        {point.severity}
                      </span>
                      <button
                        onClick={() => setDefectPoints(points => points.filter(p => p.id !== point.id))}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {defectPoints.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click on the garment map to mark defect locations</p>
                </div>
              )}
            </div>
            
            {defectPoints.length > 0 && (
              <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Save {defectPoints.length} Defect{defectPoints.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Analytics Tab
  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center mb-3">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          <span className="font-medium">Filters & View Options</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="p-2 border rounded"
          >
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          
          <select
            value={filters.severity}
            onChange={(e) => setFilters({...filters, severity: e.target.value})}
            className="p-2 border rounded"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
          
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="p-2 border rounded"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center justify-center p-2 rounded transition-colors ${
              showHeatmap ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showHeatmap ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
            Heatmap
          </button>
        </div>
      </div>
      
      {/* Main Analytics */}
      <div className="grid grid-cols-3 gap-6">
        {/* Heatmap Visualization */}
        <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Map className="w-5 h-5 mr-2 text-blue-600" />
            Defect Location Heatmap
          </h3>
          
          <div className="flex justify-center">
            <InteractiveGarmentMap 
              points={analyticsData.heatmapPoints}
              isInteractive={false}
            />
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              Critical
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
              Major
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              Minor
            </div>
          </div>
        </div>
        
        {/* Statistics Panel */}
        <div className="space-y-4">
          {/* Top Problem Areas */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-semibold mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
              Top Problem Areas
            </h4>
            <div className="space-y-3">
              {Object.entries(analyticsData.locationStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([location, count], index) => (
                  <div key={location} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`w-6 h-6 rounded-full text-xs text-white flex items-center justify-center mr-2 ${
                        index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm">{location.replace('-', ' → ')}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-semibold mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
              Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Defects:</span>
                <span className="font-semibold text-lg text-gray-800">
                  {analyticsData.heatmapPoints.reduce((sum, p) => sum + p.intensity, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hot Spots:</span>
                <span className="font-semibold text-gray-800">
                  {analyticsData.heatmapPoints.filter(p => p.intensity >= 5).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Critical Issues:</span>
                <span className="font-semibold text-red-600">
                  {analyticsData.heatmapPoints.filter(p => p.severity === 'critical').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Locations Tracked:</span>
                <span className="font-semibold text-gray-800">
                  {Object.keys(analyticsData.locationStats).length}
                </span>
              </div>
            </div>
          </div>
          
          {/* Trend Preview */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-semibold mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Monthly Trend
            </h4>
            <div className="space-y-2">
              {analyticsData.trendData.slice(-3).map((item, index) => (
                <div key={item.month} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center">
                    <div className="w-16 h-2 bg-gray-200 rounded mr-2">
                      <div 
                        className="h-full bg-blue-500 rounded" 
                        style={{ width: `${(item.count / 65) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Garment Defect Mapping System</h1>
        <p className="text-gray-600">Interactive defect tracking with location-based analytics and heatmap visualization</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('entry')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'entry' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Defect Entry
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'analytics' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Analytics & Heatmaps
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'entry' ? <DefectEntryTab /> : <AnalyticsTab />}
      
      {/* Demo Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Demo Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Defect Entry:</strong> Select a defect type, then click anywhere on the garment to mark defect locations</li>
          <li>• <strong>Analytics:</strong> View heatmaps showing defect concentration areas and problem spots</li>
          <li>• <strong>Heatmap Toggle:</strong> Turn on/off the heatmap overlay to see defect density visualization</li>
          <li>• <strong>Interactive:</strong> All marked points show severity levels and location details on hover</li>
        </ul>
      </div>
    </div>
  );
};

export default GarmentMapMockup;
