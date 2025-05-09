import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import { Loader, AlertCircle, Download } from 'lucide-react';
import { getTopDefectiveItems } from '../services/defectAnalyticsApiService';

// Custom color palette
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const FabricCompositionChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compositionData, setCompositionData] = useState([]);
  const [viewType, setViewType] = useState('bar'); // 'bar' or 'pie'

  useEffect(() => {
    fetchCompositionData();
  }, []);

  const fetchCompositionData = async () => {
    try {
      setLoading(true);
      const data = await getTopDefectiveItems('composition', 10);
      setCompositionData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching composition data:", err);
      setError("Failed to load fabric composition data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for visualization
  const chartData = compositionData.map((item, index) => ({
    name: item.name,
    value: parseFloat(item.percentage),
    count: item.count,
    color: COLORS[index % COLORS.length]
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">Defect Distribution by Fabric Composition</h3>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              className={`px-3 py-1 text-sm rounded-md ${viewType === 'bar' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              onClick={() => setViewType('bar')}
            >
              Bar
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${viewType === 'pie' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              onClick={() => setViewType('pie')}
            >
              Pie
            </button>
          </div>
          
          <button 
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            onClick={() => fetchCompositionData()}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'bar' ? (
            <BarChart data={chartData}
            barCategoryGap={80}
            barGap={25}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                labelFormatter={(value) => `Composition: ${value}`}
              />
              <Legend />
              <Bar dataKey="value" name="Defect Percentage" 
              barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis Summary</h4>
        <p className="text-sm text-gray-600">
          This chart shows the distribution of defects by fabric composition. 
          {compositionData.length > 0 && (
            <>
              <span className="font-medium"> {compositionData[0].name}</span> shows the highest defect rate at
              <span className="font-medium"> {compositionData[0].percentage}%</span>, followed by
              <span className="font-medium"> {compositionData[1]?.name || 'N/A'}</span> at
              <span className="font-medium"> {compositionData[1]?.percentage || 'N/A'}%</span>.
            </>
          )}
        </p>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {compositionData.length > 0 && (
              <>
                <li>Review quality control processes for fabrics containing <span className="font-medium">{compositionData[0].name}</span></li>
                <li>Investigate alternative suppliers for high-defect compositions</li>
                <li>Consider adjusting fabric inspection criteria for problematic compositions</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FabricCompositionChart;