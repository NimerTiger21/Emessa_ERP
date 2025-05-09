import React, { useState } from "react";
import DefectDashboard from "./DefectDashboard";
import { Tabs, ChevronDown, ChevronUp, RefreshCcw, Download, Filter } from "lucide-react";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("defects");
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Quality Management Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive analytics and insights for quality control
            </p>
            
            {/* Dashboard Tabs */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("defects")}
                  className={`
                    ${activeTab === "defects" 
                      ? "border-indigo-500 text-indigo-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  Defect Analysis
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`
                    ${activeTab === "orders" 
                      ? "border-indigo-500 text-indigo-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  Order Performance
                </button>
                <button
                  onClick={() => setActiveTab("production")}
                  className={`
                    ${activeTab === "production" 
                      ? "border-indigo-500 text-indigo-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  Production Metrics
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "defects" && (
          <>
            {/* Dashboard Sections */}
            <div className="mb-6">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("defectAnalysis")}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Defect Analysis Dashboard</h2>
                    <p className="text-sm text-gray-500">
                      Comprehensive analysis of defects by fabric, style, and composition
                    </p>
                  </div>
                  {expandedSection === "defectAnalysis" ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSection === "defectAnalysis" && (
                  <div className="border-t border-gray-200">
                    <DefectDashboard />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("trendAnalysis")}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Defect Trend Analysis</h2>
                    <p className="text-sm text-gray-500">
                      Historical performance and trend analysis for defects over time
                    </p>
                  </div>
                  {expandedSection === "trendAnalysis" ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSection === "trendAnalysis" && (
                  <div className="p-6 border-t border-gray-200">
                    <p className="text-gray-500 text-center py-10">Trend analysis dashboard will appear here</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("rootCauseAnalysis")}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Root Cause Analysis</h2>
                    <p className="text-sm text-gray-500">
                      Deep-dive analysis into defect causes and recommended actions
                    </p>
                  </div>
                  {expandedSection === "rootCauseAnalysis" ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSection === "rootCauseAnalysis" && (
                  <div className="p-6 border-t border-gray-200">
                    <p className="text-gray-500 text-center py-10">Root cause analysis will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {activeTab === "orders" && (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500 text-center py-10">Order performance dashboard will appear here</p>
          </div>
        )}
        
        {activeTab === "production" && (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500 text-center py-10">Production metrics dashboard will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;