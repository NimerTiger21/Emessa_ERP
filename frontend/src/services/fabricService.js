// Enhanced masterDataService functions for fabric management
// import axios from 'axios';
import axios from "../services/api";
import { toast } from "react-toastify";

// const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api` || 'http://localhost:5000/api';
const API_BASE_URL = `/api` || 'http://localhost:5000/api';

// Enhanced createFabric function with file upload support
export const createFabric = async (fabricData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/fabrics`, fabricData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    });
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error Creating Fabric with Compositions:", error);
    toast.error(
          error.response.data.message ||
            error.message ||
            error ||
            "Failed to create fabric. Please try again."
        );
    throw error.response?.data || error;
  }
};

// Enhanced updateFabric function with file upload support
export const updateFabric = async (fabricId, fabricData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/fabrics/${fabricId}`, fabricData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    });
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error('Error updating fabric:', error);
    throw error.response?.data || error;
  }
};

// Enhanced fetchFabrics function
export const fetchFabrics = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const response = await axios.get(`${API_BASE_URL}/fabrics?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    throw error.response?.data || error;
  }
};

// Get single fabric with full details
export const fetchFabricById = async (fabricId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fabrics/${fabricId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fabric by ID:', error);
    throw error.response?.data || error;
  }
};

// Fetch all fabrics for export (no pagination)
export const fetchAllFabricsForExport = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fabrics/export`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all fabrics for export:', error);
    throw error.response?.data || error;
  }
};

// Enhanced deleteFabric function
export const deleteFabric = async (fabricId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/fabrics/${fabricId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting fabric:', error);
    toast.error(
      error.response?.data?.message ||
      error.message ||
      "Failed to delete fabric. Please try again."
    );
    throw error.response?.data || error;
  }
};

// Download TDS file
export const downloadTDSFile = async (fabricId, fileName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fabrics/${fabricId}/download-tds`, {
      responseType: 'blob', // Important for file downloads
      timeout: 30000, // 30 second timeout for large files
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Extract file extension from the response headers if available
    const contentDisposition = response.headers['content-disposition'];
    let downloadFileName = fileName || 'tds-file';
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', downloadFileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'File downloaded successfully' };
  } catch (error) {
    console.error('Error downloading TDS file:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('TDS file not found');
    } else if (error.response?.status === 500) {
      throw new Error('Server error while downloading file');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Download timeout - file may be too large');
    } else {
      throw new Error('Failed to download TDS file');
    }
  }
};

// Existing functions (keep as they were)
export const fetchFabricSuppliers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/master-data/fabric-suppliers`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching fabric suppliers:', error);
    throw error.response?.data || error;
  }
};

export const fetchFabricCompositionItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/master-data/composition-items`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching composition items:', error);
    throw error.response?.data || error;
  }
};

// Utility function to create FormData from fabric object
export const createFabricFormData = (fabricData) => {
  const formData = new FormData();
  
  // Append basic fields
  if (fabricData.name) formData.append('name', fabricData.name);
  if (fabricData.code) formData.append('code', fabricData.code);
  if (fabricData.color) formData.append('color', fabricData.color);
  if (fabricData.supplier) formData.append('supplier', fabricData.supplier);
  
  // Append compositions as JSON string
  if (fabricData.compositions) {
    formData.append('compositions', JSON.stringify(fabricData.compositions));
  }
  
  // Append technical specs as JSON string
  if (fabricData.technicalSpecs) {
    formData.append('technicalSpecs', JSON.stringify(fabricData.technicalSpecs));
  }
  
  // Append TDS file if present
  if (fabricData.tdsFile) {
    formData.append('tdsFile', fabricData.tdsFile);
  }
  
  return formData;
};

// Fabric validation helper
export const validateFabricData = (fabricData) => {
  const errors = [];
  
  if (!fabricData.name || !fabricData.name.trim()) {
    errors.push('Fabric name is required');
  }
  
  if (!fabricData.supplier) {
    errors.push('Supplier is required');
  }
  
  if (!fabricData.compositions || fabricData.compositions.length === 0) {
    errors.push('At least one composition is required');
  }
  
  // Validate composition percentages
  if (fabricData.compositions && fabricData.compositions.length > 0) {
    const totalPercentage = fabricData.compositions.reduce((sum, comp) => {
      return sum + parseFloat(comp.value || 0);
    }, 0);
    
    if (Math.abs(totalPercentage - 100) > 0.1) {
      errors.push('Total composition must equal 100%');
    }
  }
  
  // Validate technical specs (if provided)
  if (fabricData.technicalSpecs) {
    const specs = fabricData.technicalSpecs;
    
    // Check for negative values
    const numericFields = ['tensileWarp', 'tensileWeft', 'tearWarp', 'tearWeft', 'weight', 'elasticity'];
    numericFields.forEach(field => {
      if (specs[field] !== undefined && specs[field] !== '' && parseFloat(specs[field]) < 0) {
        errors.push(`${field} cannot be negative`);
      }
    });
    
    // Validate elasticity percentage (0-100%)
    if (specs.elasticity !== undefined && specs.elasticity !== '') {
      const elasticity = parseFloat(specs.elasticity);
      if (elasticity < 0 || elasticity > 100) {
        errors.push('Elasticity must be between 0% and 100%');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};