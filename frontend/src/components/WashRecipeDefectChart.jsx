import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import { 
  Droplet, 
  PieChart as PieChartIcon, 
  BarChart2, 
  TrendingUp,
  Layers,
  //Flask,
  FlaskConical,
  Beaker,
} from 'lucide-react';

// Custom colors for charts
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const PROCESS_COLORS = {
  'DRY PROCESS': '#10b981',   // Green
  'SPRAY PROCESS': '#4f46e5', // Indigo
};
const WASH_TYPE_COLORS = {
  'Size set': '#8b5cf6',     // Purple
  'SMS': '#f59e0b',          // Amber
  'Proto': '#06b6d4',        // Cyan
  'Production': '#ef4444',   // Red
  'Fitting Sample': '#ec4899' // Pink
};
const SEVERITY_COLORS = {
  'Low': '#10b981',    // Green
  'Medium': '#f59e0b', // Amber
  'High': '#ef4444'    // Red
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-700">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
            {entry.name === 'ratio' || entry.name === 'defectRatio' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const WashRecipeDefectChart = ({ data }) => {
  const [activeChart, setActiveChart] = useState('overview');

  if (!data) return <div className="p-8 text-center text-gray-500">No data available for visualization</div>;

  // Format wash type data for chart
  const formatWashTypeData = () => {
    if (!data?.washTypeAnalytics) return [];
    return data.washTypeAnalytics.map(item => ({
      name: item.type || 'Unknown',
      defects: item.totalDefects,
      recipes: item.recipeCount,
      ratio: parseFloat(item.averageDefectRatio)
    }));
  };

  // Format process type data for chart
  const formatProcessTypeData = () => {
    if (!data?.processTypeAnalytics) return [];
    return data.processTypeAnalytics.map(item => ({
      name: item.type || 'Unknown',
      defects: item.totalDefects,
      recipes: item.recipeCount,
      average: parseFloat(item.averageDefectsPerRecipe)
    }));
  };

  // Format top defective recipes for scatter plot
  const formatScatterData = () => {
    if (!data?.topDefectiveRecipes) return [];
    return data.topDefectiveRecipes.map(recipe => ({
      x: recipe.orderQty || 0,
      y: parseFloat(recipe.defectRatio) || 0,
      z: recipe.defectCount || 0,
      name: recipe.washCode || 'N/A',
      washType: recipe.washType || 'Unknown'
    }));
  };

  // Format severity data for pie chart
  const formatSeverityData = () => {
    if (!data?.topDefectiveRecipes) return [];
    
    const severityCounts = { Low: 0, Medium: 0, High: 0 };
    
    data.topDefectiveRecipes.forEach(recipe => {
      if (recipe.severityDistribution) {
        severityCounts.Low += recipe.severityDistribution.Low || 0;
        severityCounts.Medium += recipe.severityDistribution.Medium || 0;
        severityCounts.High += recipe.severityDistribution.High || 0;
      }
    });
    
    return Object.entries(severityCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Format top/low recipe comparison data
  const formatComparisonData = () => {
    const topData = data?.topDefectiveRecipes?.slice(0, 5) || [];
    const lowData = data?.lowestDefectiveRecipes?.slice(0, 5) || [];
    
    return {
      top: topData.map(recipe => ({
        name: recipe.washCode || 'N/A',
        defectRatio: parseFloat(recipe.defectRatio) || 0,
        defectCount: recipe.defectCount || 0,
        washType: recipe.washType || 'Unknown'
      })),
      low: lowData.map(recipe => ({
        name: recipe.washCode || 'N/A',
        defectRatio: parseFloat(recipe.defectRatio) || 0,
        defectCount: recipe.defectCount || 0,
        washType: recipe.washType || 'Unknown'
      }))
    };
  };

  // Common chart props
  const chartHeight = 300;

  return (
    <div>
      {/* Chart Navigation */}
      <div className="flex items-center space-x-1 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        <button
          className={`px-3 py-2 rounded-md flex items-center ${
            activeChart === 'overview' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveChart('overview')}
        >
          <Layers className="h-4 w-4 mr-2" />
          Overview
        </button>
        <button
          className={`px-3 py-2 rounded-md flex items-center ${
            activeChart === 'washType' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveChart('washType')}
        >
          <FlaskConical className="h-4 w-4 mr-2" />
          By Wash Type
        </button>
        <button
          className={`px-3 py-2 rounded-md flex items-center ${
            activeChart === 'processType' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveChart('processType')}
        >
          <Beaker className="h-4 w-4 mr-2" />
          By Process Type
        </button>
        <button
          className={`px-3 py-2 rounded-md flex items-center ${
            activeChart === 'scatter' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveChart('scatter')}
        >
          <Droplet className="h-4 w-4 mr-2" />
          Defect Scatter
        </button>
        <button
          className={`px-3 py-2 rounded-md flex items-center ${
            activeChart === 'topVsLow' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveChart('topVsLow')}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Top vs Bottom
        </button>
        <button
          className={`px-3 py-2 rounded-md flex items-center ${
            activeChart === 'severity' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveChart('severity')}
        >
          <PieChartIcon className="h-4 w-4 mr-2" />
          By Severity
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="text-indigo-900 font-medium mb-1">Total Recipes</h3>
          <p className="text-3xl font-bold text-indigo-800">{data.summary?.totalRecipes || 0}</p>
          <p className="text-indigo-600 text-sm mt-1">
            {data.summary?.totalRecipesWithDefects || 0} with defects
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <h3 className="text-amber-900 font-medium mb-1">Avg. Defect Ratio</h3>
          <p className="text-3xl font-bold text-amber-800">{data.summary?.averageDefectRatio || 0}%</p>
          <p className="text-amber-600 text-sm mt-1">Across all wash recipes</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <h3 className="text-emerald-900 font-medium mb-1">Top Defect Rate</h3>
          <p className="text-3xl font-bold text-emerald-800">
            {data.topDefectiveRecipes && data.topDefectiveRecipes[0] 
              ? `${parseFloat(data.topDefectiveRecipes[0].defectRatio).toFixed(2)}%` 
              : '0%'}
          </p>
          <p className="text-emerald-600 text-sm mt-1">
            {data.topDefectiveRecipes && data.topDefectiveRecipes[0] 
              ? `Recipe: ${data.topDefectiveRecipes[0].washCode || 'N/A'}` 
              : 'No defective recipes'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white">
        {activeChart === 'overview' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Defect Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Defect Rate by Wash Type</p>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={formatWashTypeData()} barSize={30}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="defects" name="Total Defects" fill="#4f46e5" />
                    <Bar yAxisId="right" dataKey="ratio" name="Defect Ratio (%)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Defect Rate by Process Type</p>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={formatProcessTypeData()} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="defects" name="Total Defects" fill="#4f46e5" />
                    <Bar yAxisId="right" dataKey="average" name="Avg Defects per Recipe" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'washType' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Defects by Wash Type</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart 
                outerRadius={150} 
                data={formatWashTypeData()}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                <Radar 
                  name="Total Defects" 
                  dataKey="defects" 
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  name="Avg Defect Ratio (%)" 
                  dataKey="ratio" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6} 
                />
                <Legend />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'processType' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Defects by Process Type</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={formatProcessTypeData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="defects" name="Total Defects" fill="#4f46e5">
                  {formatProcessTypeData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PROCESS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList dataKey="defects" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'scatter' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Order Quantity vs Defect Ratio</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Order Qty"
                  label={{ value: 'Order Quantity', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Defect Ratio (%)"
                  label={{ value: 'Defect Ratio (%)', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Defect Count" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(value) => `Order Qty: ${value}`}
                  content={<CustomTooltip />}
                />
                <Legend />
                {formatScatterData().map((washType, index) => {
                  const type = washType.washType || 'Unknown';
                  const color = WASH_TYPE_COLORS[type] || COLORS[index % COLORS.length];
                  
                  return (
                    <Scatter 
                      key={type} 
                      name={type} 
                      data={[washType]}
                      fill={color}
                    />
                  );
                })}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'topVsLow' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Top vs Bottom Defect Rates</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-center font-medium text-gray-700 mb-2">Highest Defect Rates</p>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart 
                    data={formatComparisonData().top} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="defectRatio" name="Defect Ratio (%)" fill="#ef4444">
                      {formatComparisonData().top.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={WASH_TYPE_COLORS[entry.washType] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                      <LabelList dataKey="defectRatio" position="right" formatter={(value) => `${value}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-center font-medium text-gray-700 mb-2">Lowest Defect Rates</p>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart 
                    data={formatComparisonData().low} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="defectRatio" name="Defect Ratio (%)" fill="#10b981">
                      {formatComparisonData().low.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={WASH_TYPE_COLORS[entry.washType] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                      <LabelList dataKey="defectRatio" position="right" formatter={(value) => `${value}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'severity' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Defects by Severity</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={formatSeverityData()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {formatSeverityData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} defects`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default WashRecipeDefectChart;