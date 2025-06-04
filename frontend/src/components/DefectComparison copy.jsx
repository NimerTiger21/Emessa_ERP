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
  Info,
  Calendar
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
    startDate: '',
    endDate: '',
    severity: ''
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('defect-rate');
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    // Set default date range for last 6 months on component mount
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
    
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      // Call the API to get real comparison data
      const data = await getComparisonData(filters);
      console.log("Comparison data fetched:", data);
      setComparisonData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching comparison data:", err);
      setError("Failed to load comparison data. Please try again later.");
      
      // Fallback to mock data if API fails
      const mockData = generateMockData(filters.comparisonType);
      setComparisonData(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data based on comparison type (as a fallback)
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

  // Format date for display
  const formatDateRange = () => {
    if (!filters.startDate || !filters.endDate) return 'All Time';
    
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
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
                  <Bar yAxisId="left" dataKey="defectRatio" name="Defect Rate (%)" fill="#f59e0b" />
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
                  <Bar dataKey="defectRate" name="Defect Rate (%)" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      );
    } else if (filters.comparisonType === 'time-vs-severity') {
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Defect Severity Over Time</h3>
          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart
              data={comparisonData.timeSeriesData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                yAxisId="left"
                orientation="left"
                stroke="#4f46e5"
              >
                <Label value="Defect Count" angle={-90} position="left" />
              </YAxis>
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
              >
                <Label value="Defect Rate (%)" angle={90} position="right" />
              </YAxis>
              <Tooltip content={<CustomTimeTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="low" name="Low Severity" fill="#10b981" />
              <Bar yAxisId="left" dataKey="medium" name="Medium Severity" fill="#f59e0b" />
              <Bar yAxisId="left" dataKey="high" name="High Severity" fill="#ef4444" />
              <Line yAxisId="right" type="monotone" dataKey="total" name="Total Defects" stroke="#4f46e5" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Defect Comparison</h2>
        <button 
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => setFilterVisible(!filterVisible)}
        >
          <Filter size={16} className="mr-2" /> Filter
        </button>
      </div>

      {filterVisible && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="comparisonType" className="block text-sm font-medium text-gray-700">Comparison Type</label>
              <select 
                id="comparisonType" 
                name="comparisonType" 
                value={filters.comparisonType} 
                onChange={handleFilterChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="fabric-vs-style">Fabric vs Style</option>
                <option value="composition-vs-defect">Composition vs Defect</option>
                <option value="time-vs-severity">Time vs Severity</option>
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate" 
                value={filters.startDate} 
                onChange={handleFilterChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date" 
                id="endDate" 
                name="endDate" 
                value={filters.endDate} 
                onChange={handleFilterChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-1 md:col-span-3 flex justify-end mt-4">
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center"
                onClick={handleApplyFilters}
              >
                <RefreshCcw size={16} className="mr-2" /> Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader size={32} className="text-indigo-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <AlertCircle size={16} className="inline-block mr-2" />
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="mb-6">
          {renderComparisonChart()}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Insights</h3>
            <ul className="list-disc list-inside space-y-2">
              {/* {comparisonData.insights.map((insight, index) => (
                <li key={index} className="text-gray-600">{insight}</li>
              ))} */}
            </ul>
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-4">
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center">
          <Download size={16} className="mr-2" /> Download Report
        </button>
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center">
          <Share2 size={16} className="mr-2" /> Share
        </button>
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center">
          <TrendingUp size={16} className="mr-2" /> View Trends
        </button>
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center">
          <Info size={16} className="mr-2" /> More Info
        </button>
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center">
          <Calendar size={16} className="mr-2" /> Date Range
        </button>
      </div>
    </div>
  );
}

export default DefectComparison;