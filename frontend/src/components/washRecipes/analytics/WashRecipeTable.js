import React from 'react';

const WashRecipeTable = ({ recipes = [] }) => {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No wash recipes found matching your criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Article No
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order No.
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Defect Rate
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recipes.map((recipe, index) => (
            <tr key={recipe.recipeId || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {recipe.articleNo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {recipe.washType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {recipe.orderNo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {recipe.orderQty}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDefectRateColor(recipe.defectRatio)}`}>
                  {/* {recipe.defectDensity}% */}
                  {recipe.defectDensity}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recipe.status)}`}>
                  {recipe.status || 'Unknown'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to determine color based on defect rate
const getDefectRateColor = (rate) => {
  const numRate = parseFloat(rate);
  if (numRate < 1) return 'bg-green-100 text-green-800';
  if (numRate < 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// Helper function to determine color based on status
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'open':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default WashRecipeTable;