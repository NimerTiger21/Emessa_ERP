import React, { useState, useEffect, useMemo } from "react";
import loginImage from "../data/trouser-illustration.jpg"
import {
  RotateCcw,
  RotateCw,
  Eye,
  EyeOff,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Layers,
  Activity,
  BarChart3,
} from "lucide-react";

const TrouserHeatMap = ({ defectData = [] }) => {
  const [currentView, setCurrentView] = useState("front");
  const [showIntensity, setShowIntensity] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [animateHotspots, setAnimateHotspots] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  // Mock defect data with locations adjusted for the trouser illustration
  // Coordinates are based on the provided trouser illustration image
  const mockDefectData = [
    {
      id: 1,
      component: "Front Left Pocket",
      side: "front",
      x: 35,
      y: 28,
      severity: "High",
      count: 12,
      type: "Stitching",
    },
    {
      id: 2,
      component: "Front Right Pocket",
      side: "front",
      x: 65,
      y: 28,
      severity: "Medium",
      count: 8,
      type: "Fabric",
    },
    {
      id: 3,
      component: "Waistband Center",
      side: "front",
      x: 50,
      y: 15,
      severity: "Critical",
      count: 15,
      type: "Construction",
    },
    {
      id: 4,
      component: "Right Knee Area",
      side: "front",
      x: 65,
      y: 55,
      severity: "Medium",
      count: 9,
      type: "Wear",
    },
    {
      id: 5,
      component: "Left Knee Area",
      side: "front",
      x: 35,
      y: 55,
      severity: "Low",
      count: 6,
      type: "Wear",
    },
    {
      id: 6,
      component: "Crotch Seam",
      side: "front",
      x: 50,
      y: 42,
      severity: "Critical",
      count: 18,
      type: "Stress Point",
    },
    {
      id: 7,
      component: "Right Hem",
      side: "front",
      x: 65,
      y: 92,
      severity: "Medium",
      count: 7,
      type: "Finishing",
    },
    {
      id: 8,
      component: "Left Hem",
      side: "front",
      x: 35,
      y: 92,
      severity: "Low",
      count: 4,
      type: "Finishing",
    },

    // Back view defects (using back side coordinates)
    {
      id: 9,
      component: "Back Right Pocket",
      side: "back",
      x: 65,
      y: 35,
      severity: "High",
      count: 10,
      type: "Stitching",
    },
    {
      id: 10,
      component: "Back Left Pocket",
      side: "back",
      x: 35,
      y: 35,
      severity: "Medium",
      count: 6,
      type: "Stitching",
    },
    {
      id: 11,
      component: "Back Center Seam",
      side: "back",
      x: 50,
      y: 60,
      severity: "High",
      count: 11,
      type: "Seam",
    },
    {
      id: 12,
      component: "Back Waistband",
      side: "back",
      x: 50,
      y: 15,
      severity: "Low",
      count: 5,
      type: "Construction",
    },
    {
      id: 13,
      component: "Right Inseam",
      side: "back",
      x: 65,
      y: 70,
      severity: "Medium",
      count: 8,
      type: "Seam",
    },
    {
      id: 14,
      component: "Left Inseam",
      side: "back",
      x: 35,
      y: 70,
      severity: "Low",
      count: 3,
      type: "Seam",
    },
  ];

  // Filter data based on current view and filters
  const filteredData = useMemo(() => {
    return mockDefectData.filter((item) => {
      const matchesSide = item.side === currentView;
      const matchesSeverity =
        filterSeverity === "all" || item.severity === filterSeverity;
      return matchesSide && matchesSeverity;
    });
  }, [currentView, filterSeverity]);

  // Calculate heat map intensity
  const getHeatIntensity = (count) => {
    const maxCount = Math.max(...mockDefectData.map((d) => d.count));
    return (count / maxCount) * 100;
  };

  // Get color based on severity and intensity
  const getHotspotColor = (severity, count) => {
    const intensity = getHeatIntensity(count);
    const colors = {
      Critical: `rgba(239, 68, 68, ${0.3 + (intensity / 100) * 0.7})`,
      High: `rgba(245, 101, 101, ${0.3 + (intensity / 100) * 0.6})`,
      Medium: `rgba(251, 191, 36, ${0.3 + (intensity / 100) * 0.5})`,
      Low: `rgba(34, 197, 94, ${0.3 + (intensity / 100) * 0.4})`,
    };
    return colors[severity] || colors["Low"];
  };

  // Get ring color for hotspot border
  const getRingColor = (severity) => {
    const colors = {
      Critical: "#DC2626",
      High: "#EF4444",
      Medium: "#F59E0B",
      Low: "#10B981",
    };
    return colors[severity] || colors["Low"];
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDefects = mockDefectData.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const criticalDefects = mockDefectData
      .filter((item) => item.severity === "Critical")
      .reduce((sum, item) => sum + item.count, 0);
    const mostProblematicComponent = mockDefectData.reduce(
      (max, item) => (item.count > max.count ? item : max),
      { count: 0 }
    );

    return {
      total: totalDefects,
      critical: criticalDefects,
      hotspot: mostProblematicComponent,
      components: mockDefectData.length,
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Trouser Defect Heat Map</h2>
            <p className="opacity-90">
              Visual analytics for defect pattern identification
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90">Total Defects</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-200">
                {stats.critical}
              </div>
              <div className="text-sm opacity-90">Critical Issues</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView("front")}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === "front"
                  ? "bg-white text-blue-600 font-medium"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              Front View
            </button>
            <button
              onClick={() => setCurrentView("back")}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === "back"
                  ? "bg-white text-blue-600 font-medium"
                  : "bg-white/20 hover:bg-white/30"
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
              <option value="all" className="text-gray-800">
                All Severities
              </option>
              <option value="Critical" className="text-gray-800">
                Critical Only
              </option>
              <option value="High" className="text-gray-800">
                High Only
              </option>
              <option value="Medium" className="text-gray-800">
                Medium Only
              </option>
              <option value="Low" className="text-gray-800">
                Low Only
              </option>
            </select>
          </div>

          <button
            onClick={() => setAnimateHotspots(!animateHotspots)}
            className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 flex items-center space-x-2"
          >
            {animateHotspots ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            <span className="text-sm">Animations</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Main Heat Map View */}
        <div className="lg:w-2/3 p-6">
          <div className="relative">
            {/* Trouser Silhouette */}
            <div
              className="relative mx-auto"
              style={{ maxWidth: "400px", height: "600px" }}
            >
              {/* SVG Trouser Outline */}
              
              <img
  src={loginImage}
  alt="Trouser Technical Drawing"
  width="900"   // Set desired width in pixels
  height="500" // Let height auto-scale to keep aspect ratio (omit or set explicitly)
/>


              {/* Heat Map Hotspots */}
              {filteredData.map((defect) => {
                const size = 20 + (getHeatIntensity(defect.count) / 100) * 40;
                const pulseDelay = Math.random() * 2;

                return (
                  <div
                    key={defect.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{
                      left: `${defect.x}%`,
                      top: `${defect.y}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                    }}
                    onClick={() => setSelectedHotspot(defect)}
                  >
                    {/* Hotspot Circle */}
                    <div
                      className={`w-full h-full rounded-full border-2 ${
                        animateHotspots ? "animate-pulse" : ""
                      }`}
                      style={{
                        backgroundColor: getHotspotColor(
                          defect.severity,
                          defect.count
                        ),
                        borderColor: getRingColor(defect.severity),
                        animationDelay: `${pulseDelay}s`,
                      }}
                    />

                    {/* Defect Count Badge */}
                    <div
                      className="absolute -top-2 -right-2 bg-white rounded-full text-xs font-bold shadow-lg flex items-center justify-center"
                      style={{
                        width: "20px",
                        height: "20px",
                        color: getRingColor(defect.severity),
                      }}
                    >
                      {defect.count}
                    </div>

                    {/* Ripple Effect for Critical */}
                    {defect.severity === "Critical" && animateHotspots && (
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
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)}{" "}
                View
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">
                Heat Map Legend
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Critical", "High", "Medium", "Low"].map((severity) => (
                  <div key={severity} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{
                        backgroundColor: getHotspotColor(severity, 10),
                        borderColor: getRingColor(severity),
                      }}
                    />
                    <span className="text-sm text-gray-600">{severity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                • Circle size indicates defect frequency • Numbers show exact
                count • Click hotspots for details
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
                    backgroundColor: getHotspotColor(
                      selectedHotspot.severity,
                      selectedHotspot.count
                    ),
                    color: getRingColor(selectedHotspot.severity),
                  }}
                >
                  {selectedHotspot.severity}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Component:</span>
                  <span className="font-medium">
                    {selectedHotspot.component}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Defect Count:</span>
                  <span className="font-bold text-red-600">
                    {selectedHotspot.count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{selectedHotspot.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Heat Intensity:</span>
                  <span className="font-medium">
                    {getHeatIntensity(selectedHotspot.count).toFixed(1)}%
                  </span>
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
                  <div className="font-bold text-red-600">
                    {stats.hotspot.component}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.hotspot.count} defects
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredData.length}
                  </div>
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
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)}{" "}
              Components
            </h4>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredData
                .sort((a, b) => b.count - a.count)
                .map((defect) => (
                  <div
                    key={defect.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedHotspot?.id === defect.id
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedHotspot(defect)}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getRingColor(defect.severity),
                        }}
                      />
                      <span className="text-sm font-medium">
                        {defect.component}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-700">
                        {defect.count}
                      </span>
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

export default TrouserHeatMap;
