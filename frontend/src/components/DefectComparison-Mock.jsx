import React, { useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, Label,
  BarChart, Bar, ComposedChart, Line
} from 'recharts';
import {
  Loader,
  AlertCircle,
  RefreshCcw,
  Download,
  Filter,
  ArrowUpDown,
  Share2,
  TrendingUp,
  Info
} from 'lucide-react';
import { getComparisonData } from '../services/defectAnalyticsApiService';

// Custom color palette
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const BUBBLE_COLORS = {
  "Low": "#10b981",
  "Medium": "#f59e0b",
  "High": "#ef4444"
};

const DefectComparison = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [filters, setFilters] = useState({
    comparisonType: 'fabric-vs-style',
    timeFrame: 'last-6-months',
    severity: ''
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('defect-rate');
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from API
      // const data = await getComparisonData(filters);
      
      // Mock data for demonstration
      const mockData = generateMockData(filters.comparisonType);
      setComparisonData(mockData);
      setError(null);
    } catch (err) {
      console.error("Error fetching comparison data:", err);
      setError("Failed to load comparison data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data based on comparison type
  const generateMockData = (comparisonType) => {
    switch (comparisonType) {
      case 'fabric-vs-style':
        return {
          scatterData: [
            { x: 12, y: 8, z: 25, fabricName: 'Cotton', styleName: 'T-Shirt', defectRate: '3.2%', severity: 'Medium' },
            { x: 18, y: 6, z: 15, fabricName: 'Denim', styleName: 'Jeans', defectRate: '1.8%', severity: 'Low' },
            { x: 22, y: 14, z: 35, fabricName: 'Polyester', styleName: 'Jacket', defectRate: '4.7%', severity: 'High' },
            { x: 8, y: 5, z: 12, fabricName: 'Silk', styleName: 'Dress', defectRate: '1.2%', severity: 'Low' },
            { x: 15, y: 12, z: 30, fabricName: 'Wool', styleName: 'Coat', defectRate: '3.5%', severity: 'Medium' },
            { x: 25, y: 18, z: 40, fabricName: 'Linen', styleName: 'Shirt', defectRate: '5.2%', severity: 'High' },
            { x: 10, y: 7, z: 18, fabricName: 'Modal', styleName: 'Blouse', defectRate: '2.4%', severity: 'Medium' },
            { x: 16, y: 9, z: 22, fabricName: 'Spandex', styleName: 'Leggings', defectRate: '2.8%', severity: 'Medium' }
          ],
          fabricDefects: [
            { name: 'Cotton', defectRate: 3.2, defectCount: 128 },
            { name: 'Denim', defectRate: 1.8, defectCount: 72 },
            { name: 'Polyester', defectRate: 4.7, defectCount: 188 },
            { name: 'Silk', defectRate: 1.2, defectCount: 48 },
            { name: 'Wool', defectRate: 3.5, defectCount: 140 },
            { name: 'Linen', defectRate: 5.2, defectCount: 208 },
            { name: 'Modal', defectRate: 2.4, defectCount: 96 },
            { name: 'Spandex', defectRate: 2.8, defectCount: 112 }
          ],
          styleDefects: [
            { name: 'T-Shirt', defectRate: 2.5, defectCount: 100 },
            { name: 'Jeans', defectRate: 3.1, defectCount: 124 },
            { name: 'Jacket', defectRate: 4.2, defectCount: 168 },
            { name: 'Dress', defectRate: 1.8, defectCount: 72 },
            { name: 'Coat', defectRate: 3.7, defectCount: 148 },
            { name: 'Shirt', defectRate: 2.9, defectCount: 116 },
            { name: 'Blouse', defectRate: 2.2, defectCount: 88 },
            { name: 'Leggings', defectRate: 3.5, defectCount: 140 }
          ],
          correlationScore: 0.73,
          insights: [
            "Linen fabric shows the highest defect rate (5.2%) across all styles",
            "Jackets made from polyester have a significantly higher defect rate (4.7%)",
            "Silk fabrics consistently show the lowest defect rates (1.2%)",
            "T-Shirts have consistent defect patterns regardless of fabric type"
          ]
        };
      case 'composition-vs-defect':
        return {
          scatterData: [
            { x: 75, y: 2.8, z: 20, composition: '75% Cotton, 25% Polyester', defectType: 'Stitching', severity: 'Medium' },
            { x: 100, y: 1.5, z: 15, composition: '100% Cotton', defectType: 'Color', severity: 'Low' },
            { x: 82, y: 3.4, z: 30, composition: '82% Nylon, 18% Spandex', defectType: 'Fabric Tear', severity: 'High' },
            { x: 60, y: 2.2, z: 18, composition: '60% Wool, 40% Acrylic', defectType: 'Pilling', severity: 'Medium' },
            { x: 95, y: 3.7, z: 25, composition: '95% Viscose, 5% Elastane', defectType: 'Shrinkage', severity: 'Medium' },
            { x: 50, y: 4.1, z: 35, composition: '50% Polyester, 50% Cotton', defectType: 'Seam', severity: 'High' },
            { x: 88, y: 1.7, z: 14, composition: '88% Cotton, 12% Elastane', defectType: 'Size', severity: 'Low' }
          ],
          compositionData: [
            { name: '100% Cotton', defectRate: 1.5, defectCount: 60 },
            { name: '75% Cotton, 25% Polyester', defectRate: 2.8, defectCount: 112 },
            { name: '82% Nylon, 18% Spandex', defectRate: 3.4, defectCount: 136 },
            { name: '60% Wool, 40% Acrylic', defectRate: 2.2, defectCount: 88 },
            { name: '95% Viscose, 5% Elastane', defectRate: 3.7, defectCount: 148 },
            { name: '50% Polyester, 50% Cotton', defectRate: 4.1, defectCount: 164 },
            { name: '88% Cotton, 12% Elastane', defectRate: 1.7, defectCount: 68 }
          ],
          defectTypeData: [
            { name: 'Stitching', defectRate: 3.2, defectCount: 128 },
            { name: 'Color', defectRate: 2.4, defectCount: 96 },
            { name: 'Fabric Tear', defectRate: 4.1, defectCount: 164 },
            { name: 'Pilling', defectRate: 2.8, defectCount: 112 },
            { name: 'Shrinkage', defectRate: 3.5, defectCount: 140 },
            { name: 'Seam', defectRate: 3.9, defectCount: 156 },
            { name: 'Size', defectRate: 1.9, defectCount: 76 }
          ],
          correlationScore: 0.68,
          insights: [
            "Pure cotton (100%) shows significantly lower defect rates across all defect types",
            "Blends with high synthetic content (>50%) tend to have higher defect rates",
            "Elastane content seems to reduce defect rates when blended with cotton",
            "Size defects are less common across all fabric compositions"
          ]
        };
      case 'time-vs-severity':
        return {
          timeSeriesData: [
            { month: 'Jan', low: 24, medium: 38, high: 12, total: 74 },
            { month: 'Feb', low: 28, medium: 42, high: 15, total: 85 },
            { month: 'Mar', low: 32, medium: 35, high: 18, total: 85 },
            { month: 'Apr', low: 22, medium: 40, high: 14, total: 76 },
            { month: 'May', low: 18, medium: 32, high: 10, total: 60 },
            { month: 'Jun', low: 25, medium: 37, high: 8, total: 70 }
          ],
          severityTrends: [
            { severity: 'Low', trend: '+5%', count: 149 },
            { severity: 'Medium', trend: '-3%', count: 224 },
            { severity: 'High', trend: '-12%', count: 77 }
          ],
          correlationScore: 0.54,
          insights: [
            "High severity defects have decreased by 12% over the last 6 months",
            "March had the highest number of total defects (85)",
            "Medium severity defects consistently make up the majority (~50%) of all defects",
            "May showed the lowest defect count across all severity levels"
          ]
        };
      default:
        return {
          scatterData: [],
          insights: ["No data available for this comparison type"]
        };
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchComparisonData();
    setFilterVisible(false);
  };

  const formatTooltipValue = (value, name) => {
    if (name === 'defectRate') return `${value}%`;
    return value;
  };

  // Custom tooltip for scatter chart
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          {filters.comparisonType === 'fabric-vs-style' && (
            <>
              <p className="font-semibold text-gray-800">{data.fabricName} - {data.styleName}</p>
              <p className="text-sm text-gray-600">Fabric Defects: {data.x}</p>
              <p className="text-sm text-gray-600">Style Defects: {data.y}</p>
              <p className="text-sm font-medium text-indigo-600">Defect Rate: {data.defectRate}</p>
              <p className="text-sm text-gray-600">Severity: <span className={
                data.severity === 'High' ? 'text-red-600' : 
                data.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'
              }>{data.severity}</span></p>
            </>
          )}
          
          {filters.comparisonType === 'composition-vs-defect' && (
            <>
              <p className="font-semibold text-gray-800">{data.composition}</p>
              <p className="text-sm text-gray-600">Natural Content: {data.x}%</p>
              <p className="text-sm text-gray-600">Defect Rate: {data.y}%</p>
              <p className="text-sm font-medium text-indigo-600">Defect Type: {data.defectType}</p>
              <p className="text-sm text-gray-600">Severity: <span className={
                data.severity === 'High' ? 'text-red-600' : 
                data.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'
              }>{data.severity}</span></p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for timeseries
  const CustomTimeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p 
              key={`item-${index}`}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
            </p>
          ))}
          <p className="text-sm font-medium text-gray-700 mt-2">
            Total: {total}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderComparisonChart = () => {
    if (filters.comparisonType === 'fabric-vs-style') {
      return (
        <>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Fabric vs Style Defect Correlation</h3>
            <ResponsiveContainer width="100%" height="90%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Fabric Defects" 
                  unit=""
                >
                  <Label value="Fabric Defects" position="bottom" offset={0} />
                </XAxis>
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Style Defects" 
                  unit=""
                >
                  <Label value="Style Defects" position="left" angle={-90} offset={0} />
                </YAxis>
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Total" unit="" />
                <Tooltip content={<CustomScatterTooltip />} />
                <Legend />
                <Scatter 
                  name="Fabric-Style Correlation" 
                  data={comparisonData.scatterData} 
                  fill="#4f46e5"
                >
                  {comparisonData.scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BUBBLE_COLORS[entry.severity]} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Defect Rate by Fabric</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={comparisonData.fabricDefects}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    stroke="#4f46e5"
                  >
                    <Label value="Defect Rate (%)" angle={-90} position="left" />
                  </YAxis>
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                  >
                    <Label value="Defect Count" angle={90} position="right" />
                  </YAxis>
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="defectRate" name="Defect Rate (%)" fill="#4f46e5" />
                  <Bar yAxisId="right" dataKey="defectCount" name="Defect Count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Defect Rate by Style</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={comparisonData.styleDefects}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    stroke="#f59e0b"
                  >
                    <Label value="Defect Rate (%)" angle={-90} position="left" />
                  </YAxis>
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#8b5cf6"
                  >
                    <Label value="Defect Count" angle={90} position="right" />
                  </YAxis>
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="defectRate" name="Defect Rate (%)" fill="#f59e0b" />
                  <Bar yAxisId="right" dataKey="defectCount" name="Defect Count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      );
    } else if (filters.comparisonType === 'composition-vs-defect') {
      return (
        <>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Fabric Composition vs Defect Type</h3>
            <ResponsiveContainer width="100%" height="90%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Natural Content" 
                  unit="%"
                >
                  <Label value="Natural Fiber Content (%)" position="bottom" offset={0} />
                </XAxis>
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Defect Rate" 
                  unit="%"
                >
                  <Label value="Defect Rate (%)" position="left" angle={-90} offset={0} />
                </YAxis>
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Volume" unit="" />
                <Tooltip content={<CustomScatterTooltip />} />
                <Legend />
                <Scatter 
                  name="Composition-Defect Correlation" 
                  data={comparisonData.scatterData} 
                  fill="#8b5cf6"
                >
                  {comparisonData.scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BUBBLE_COLORS[entry.severity]} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Defects by Fabric Composition</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={comparisonData.compositionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="defectRate" name="Defect Rate (%)" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Defects by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={comparisonData.defectTypeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="defectRate" name="Defect Rate (%)" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      );
    } else if (filters.comparisonType === 'time-vs-severity') {
      return (
        <>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Defect Severity Trends Over Time</h3>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart
                data={comparisonData.timeSeriesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis>
                  <Label value="Defect Count" angle={-90} position="left" offset={-15} />
                </YAxis>
                <Tooltip content={<CustomTimeTooltip />} />
                <Legend />
                <Bar dataKey="low" stackId="a" name="Low Severity" fill="#10b981" />
                <Bar dataKey="medium" stackId="a" name="Medium Severity" fill="#f59e0b" />
                <Bar dataKey="high" stackId="a" name="High Severity" fill="#ef4444" />
                <Line type="monotone" dataKey="total" stroke="#4f46e5" name="Total Defects" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {comparisonData.severityTrends.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className={`text-lg font-medium mb-2 ${
                  item.severity === 'High' ? 'text-red-600' : 
                  item.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {item.severity} Severity Defects
                </h3>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-800">{item.count}</div>
                  <div className={`flex items-center ${
                    item.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.trend.startsWith('+') ? (
                      <TrendingUp className="h-5 w-5 mr-1" />
                    ) : (
                      <TrendingUp className="h-5 w-5 mr-1 transform rotate-180" />
                    )}
                    {item.trend}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {item.severity === 'High' ? 'Critical issues requiring immediate attention' : 
                   item.severity === 'Medium' ? 'Significant issues affecting product quality' : 
                   'Minor issues with minimal impact'}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <Loader className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading comparison data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-lg w-full">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-700 font-medium">Error Loading Comparison Data</p>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                className="mt-3 bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm flex items-center"
                onClick={fetchComparisonData}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Defect Comparison Analysis</h1>
          <p className="text-gray-500 mt-1">
            Compare relationships between different defect metrics and manufacturing variables
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row mt-4 lg:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
          <button 
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-sm"
            onClick={() => setFilterVisible(!filterVisible)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          <button 
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-sm"
            onClick={fetchComparisonData}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          
          <button 
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-sm"
            onClick={() => alert('Exporting data...')}
            >
            <Download className="h-4 w-4 mr-2" />
            Export
            </button>
            <button
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-sm"
            onClick={() => alert('Sharing data...')}
            >
            <Share2 className="h-4 w-4 mr-2" />
            Share
            </button>
        </div>
      </div>
          
        
        {/* Filters */}
        {filterVisible && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 mb-4">
                <label htmlFor="comparisonType" className="text-sm font-medium text-gray-700">Comparison Type:</label>
                <select 
                  id="comparisonType" 
                  name="comparisonType" 
                  value={filters.comparisonType} 
                  onChange={handleFilterChange} 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
                >
                  <option value="fabric-vs-style">Fabric vs Style</option>
                  <option value="composition-vs-defect">Composition vs Defect</option>
                  <option value="time-vs-severity">Time vs Severity</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <label htmlFor="timeFrame" className="text-sm font-medium text-gray-700">Time Frame:</label>
                <select 
                  id="timeFrame" 
                  name="timeFrame" 
                  value={filters.timeFrame} 
                  onChange={handleFilterChange} 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
                >
                  <option value="last-week">Last Week</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-3-months">Last 3 Months</option>
                  <option value="last-6-months">Last 6 Months</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <label htmlFor="severity" className="text-sm font-medium text-gray-700">Severity:</label>
                <select 
                  id="severity" 
                  name="severity" 
                  value={filters.severity} 
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
                >
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
              </div>

                <div className="flex items-center space-x-2 mb-4">
                <label htmlFor="metric" className="text-sm font-medium text-gray-700">Metric:</label>
                <select 
                  id="metric" 
                  name="metric" 
                  value={selectedMetric} 
                  onChange={(e) => setSelectedMetric(e.target.value)} 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
                >
                  <option value="defect-rate">Defect Rate</option>
                  <option value="defect-count">Defect Count</option>

                    <option value="severity">Severity</option>
                    <option value="trend">Trend</option>
                </select>
                </div>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        {/* Comparison Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          {renderComparisonChart()}
        </div>
        <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Insights</h3>
            <ul className="list-disc list-inside space-y-2">
                {comparisonData.insights.map((insight, index) => (
                <li key={index} className="text-gray-600">{insight}</li>
                ))}
            </ul>
        </div>
    </div>
    );
}
export default DefectComparison;