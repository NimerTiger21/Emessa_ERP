// src/components/DefectAnalytics.js
import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Loader, 
  AlertTriangle,
  PieChart as PieChartIcon,
  BarChart2,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { getDefectAnalytics } from "../services/defectService";

const DefectAnalytics = ({ defectId, defectData }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState("trend");
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Mock data - replace with API call in production
  useEffect(() => {
    // Simulate API call
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // In a real app, fetch data from API
        // const response = await getDefectAnalytics(defectId);
        
        // Mock data for demonstration
        const mockAnalytics = {
          trendData: [
            { month: 'Jan', count: 12 },
            { month: 'Feb', count: 19 },
            { month: 'Mar', count: 15 },
            { month: 'Apr', count: 8 },
            { month: 'May', count: 10 },
            { month: 'Jun', count: 5 },
          ],
          severityData: [
            //{ name: 'Critical', value: 8 },
            { name: 'High', value: 15 },
            { name: 'Medium', value: 22 },
            { name: 'Low', value: 12 },
          ],
          typeData: [
            { name: 'Stitching', value: 18 },
            { name: 'Fabric', value: 12 },
            { name: 'Color', value: 8 },
            { name: 'Size', value: 5 },
            { name: 'Other', value: 7 },
          ],
          locationData: [
            { location: 'Sleeve', count: 15 },
            { location: 'Collar', count: 8 },
            { location: 'Seam', count: 22 },
            { location: 'Pocket', count: 10 },
            { location: 'Hem', count: 12 },
          ],
          similarDefects: [
            {
              id: 101,
              defectName: "Loose Thread",
              status: "Resolved",
              severity: "Medium",
              component: "Sleeve",
              date: "2024-03-15"
            },
            {
              id: 203,
              defectName: "Missing Stitch",
              status: "Open",
              severity: "High",
              component: "Collar",
              date: "2024-03-22"
            },
            {
              id: 154,
              defectName: "Loose Thread",
              status: "Resolved",
              severity: "Low",
              component: "Sleeve",
              date: "2024-02-18"
            }
          ]
        };

        const response = await getDefectAnalytics(defectId);
        
        setAnalytics(response);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data");
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [defectId]);
  
  // Helper function for status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-purple-100 text-purple-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Helper function for severity badge color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500 text-white";
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 text-blue-600 animate-spin mr-3" />
        <span className="text-lg text-gray-600">Loading analytics...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
        <div className="flex">
          <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
          <div>
            <p className="text-yellow-700 font-medium">Analytics Unavailable</p>
            <p className="text-yellow-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Chart Selection Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          className={`px-4 py-2 flex items-center ${activeChart === 'trend' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => setActiveChart('trend')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Trend Analysis
        </button>
        <button
          className={`px-4 py-2 flex items-center ${activeChart === 'severity' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => setActiveChart('severity')}
        >
          <PieChartIcon className="h-4 w-4 mr-2" />
          Severity Distribution
        </button>
        <button
          className={`px-4 py-2 flex items-center ${activeChart === 'location' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => setActiveChart('location')}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Location Analysis
        </button>
      </div>
      
      {/* Chart Area */}
      <div className="bg-white rounded-lg shadow p-4 h-64">
        {activeChart === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Similar Defects" 
                stroke="#4f46e5" 
                strokeWidth={2}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {activeChart === 'severity' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {activeChart === 'location' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.locationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Defect Count" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Similar Defects */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Similar Defects
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order#
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Defect Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.similarDefects.map((defect) => (
                <tr key={defect.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    #{defect.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {defect.defectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(defect.status)}`}>
                      {defect.status === "Resolved" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {defect.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(defect.severity)}`}>
                      {defect.severity}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {defect.component}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {defect.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Predictive Analytics */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-1">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Prediction Insights</h4>
            <p className="mt-1 text-sm text-blue-600">
              Based on historical data, there's a 68% likelihood of similar defects occurring 
              in the same production line within the next 30 days. Consider scheduling an
              additional quality check for this specific component.
            </p>
          </div>
        </div>
      </div> */}

      
    </div>
  );
};

export default DefectAnalytics;