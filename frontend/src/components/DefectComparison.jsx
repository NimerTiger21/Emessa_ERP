import React, { useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Bar, Line, Cell
} from 'recharts';
import { Loader, AlertCircle, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { getDefectAnalytics } from '../services/defectAnalyticsApiService';

const DefectComparison = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState({
    fabricVsStyle: [],
    correlationMatrix: [],
    performanceMetrics: {}
  });

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const analytics = await getDefectAnalytics();
      
      // Process data for comparison
      const fabricData = analytics.byFabric || [];
      const styleData = analytics.byStyle || [];
      const compositionData = analytics.byComposition || [];
      
      // Create combined comparison data
      const fabricVsStyleData = fabricData.slice(0, 10).map((fabric, index) => ({
        name: fabric.name,
        fabricDefectRate: parseFloat(fabric.percentage),
        styleDefectRate: styleData[index] ? parseFloat(styleData[index].percentage) : 0,
        fabricCount: fabric.count,
        styleName: styleData[index]?.name || 'N/A'
      }));
      
      // Calculate correlation matrix
      const correlationMatrix = [
        { category: 'Fabric', fabric: 100, style: calculateCorrelation(fabricData, styleData), composition: calculateCorrelation(fabricData, compositionData) },
        { category: 'Style', fabric: calculateCorrelation(styleData, fabricData), style: 100, composition: calculateCorrelation(styleData, compositionData) },
        { category: 'Composition', fabric: calculateCorrelation(compositionData, fabricData), style: calculateCorrelation(compositionData, styleData), composition: 100 }
      ];
      
      // Calculate performance metrics
      const performanceMetrics = {
        avgFabricDefectRate: fabricData.reduce((sum, item) => sum + parseFloat(item.percentage), 0) / fabricData.length,
        avgStyleDefectRate: styleData.reduce((sum, item) => sum + parseFloat(item.percentage), 0) / styleData.length,
        avgCompositionDefectRate: compositionData.reduce((sum, item) => sum + parseFloat(item.percentage), 0) / compositionData.length,
        totalDefects: analytics.summary?.totalDefects || 0,
        topFabricImpact: fabricData[0]?.percentage || 0,
        topStyleImpact: styleData[0]?.percentage || 0
      };
      
      setComparisonData({
        fabricVsStyle: fabricVsStyleData,
        correlationMatrix,
        performanceMetrics
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching comparison data:", err);
      setError("Failed to load comparison data");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate basic correlation
  const calculateCorrelation = (data1, data2) => {
    if (!data1.length || !data2.length) return 0;
    
    const maxLength = Math.min(data1.length, data2.length);
    const subset1 = data1.slice(0, maxLength).map(item => parseFloat(item.percentage));
    const subset2 = data2.slice(0, maxLength).map(item => parseFloat(item.percentage));
    
    // Simple correlation calculation (Pearson correlation coefficient approximation)
    const mean1 = subset1.reduce((sum, val) => sum + val, 0) / subset1.length;
    const mean2 = subset2.reduce((sum, val) => sum + val, 0) / subset2.length;
    
    const numerator = subset1.reduce((sum, val, i) => sum + (val - mean1) * (subset2[i] - mean2), 0);
    const denominator1 = Math.sqrt(subset1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0));
    const denominator2 = Math.sqrt(subset2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0));
    
    return denominator1 && denominator2 ? Math.abs((numerator / (denominator1 * denominator2)) * 100) : 0;
  };

  const getCorrelationColor = (value) => {
    if (value > 70) return 'bg-red-500';
    if (value > 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCorrelationText = (value) => {
    if (value > 70) return 'Strong';
    if (value > 40) return 'Moderate';
    return 'Weak';
  };

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
    <div className="space-y-6">
      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Fabric Defect Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {comparisonData.performanceMetrics.avgFabricDefectRate?.toFixed(1) || 0}%
              </p>
              <div className="flex items-center mt-1">
                <ArrowUp className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">
                  Peak: {comparisonData.performanceMetrics.topFabricImpact}%
                </span>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Style Defect Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {comparisonData.performanceMetrics.avgStyleDefectRate?.toFixed(1) || 0}%
              </p>
              <div className="flex items-center mt-1">
                <ArrowUp className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600">
                  Peak: {comparisonData.performanceMetrics.topStyleImpact}%
                </span>
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Composition Defect Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {comparisonData.performanceMetrics.avgCompositionDefectRate?.toFixed(1) || 0}%
              </p>
              <div className="flex items-center mt-1">
                <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  Total Defects: {comparisonData.performanceMetrics.totalDefects}
                </span>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Fabric vs Style Comparison Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Fabric vs Style Defect Rate Comparison</h3>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={comparisonData.fabricVsStyle}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, name === 'Fabric Defect Rate' ? 'Fabric Defect Rate' :
                  name === 'Style Defect Rate' ? 'Style Defect Rate' : 'Defect Count']}
                labelFormatter={(value) => `Item: ${value}`}
              />
              <Legend />
              <Bar dataKey="fabricDefectRate" name="Fabric Defect Rate" fill="#4f46e5" />
              <Bar dataKey="styleDefectRate" name="Style Defect Rate" fill="#10b981" />
              <Line type="monotone" dataKey="fabricCount" name="Defect Count" stroke="#ef4444" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Defect Correlation Matrix</h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows the correlation strength between different defect categories. Higher values indicate stronger relationships.
        </p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Fabric</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Style</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Composition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comparisonData.correlationMatrix.map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">{row.category}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getCorrelationColor(row.fabric)}`}></div>
                      <span className="text-sm">{row.fabric.toFixed(0)}%</span>
                      <span className="text-xs text-gray-500 ml-1">({getCorrelationText(row.fabric)})</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getCorrelationColor(row.style)}`}></div>
                      <span className="text-sm">{row.style.toFixed(0)}%</span>
                      <span className="text-xs text-gray-500 ml-1">({getCorrelationText(row.style)})</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getCorrelationColor(row.composition)}`}></div>
                      <span className="text-sm">{row.composition.toFixed(0)}%</span>
                      <span className="text-xs text-gray-500 ml-1">({getCorrelationText(row.composition)})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Weak Correlation (&lt;40%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Moderate Correlation (40-70%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Strong Correlation (&gt;70%)</span>
          </div>
        </div>
      </div>

      {/* Scatter Plot Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Defect Rate Scatter Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">
          Relationship between fabric defect rates and style defect rates. Points closer to the diagonal line indicate higher correlation.
        </p>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={comparisonData.fabricVsStyle}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fabricDefectRate" 
                name="Fabric Defect Rate" 
                unit="%" 
                label={{ value: 'Fabric Defect Rate (%)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                dataKey="styleDefectRate" 
                name="Style Defect Rate" 
                unit="%" 
                label={{ value: 'Style Defect Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name) => [`${value}`, name === 'Fabric Defect Rate' ? 'Fabric Rate' : 'Style Rate']}
                labelFormatter={() => ''}
              />
              <Scatter dataKey="styleDefectRate" name="Defect Rates" fill="#4f46e5">
                {comparisonData.fabricVsStyle.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 30}, 70%, 50%)`} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
          Key Insights & Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Critical Findings</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Fabric defects average {comparisonData.performanceMetrics.avgFabricDefectRate?.toFixed(1)}% across all types</li>
              <li>• Style-related defects average {comparisonData.performanceMetrics.avgStyleDefectRate?.toFixed(1)}% across all styles</li>
              <li>• Composition defects show {comparisonData.performanceMetrics.avgCompositionDefectRate?.toFixed(1)}% average rate</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recommended Actions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Focus quality control on high-correlation fabric-style combinations</li>
              <li>• Implement targeted inspections for top-performing defect categories</li>
              <li>• Review supplier quality agreements for problematic materials</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectComparison;