import { toast } from "react-toastify";
import axios from "../services/api";

const API_URL = "/api/defects";

// ! Tiger this is not used (Also in the backend server orderController.js => addDefectToOrder)
export const addDefectToOrder = async (orderId, defectData) => {
  try {
    const response = await axios.post(`${API_URL}/${orderId}/defects`, defectData);
    return response.data;
  } catch (error) {
    console.error("Error adding defect:", error);
    throw error;
  }
};

export const createDefect = async ({ formDataWithImages }) => {
  try {
    const response = await axios.post(API_URL, formDataWithImages, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
  });
    return response.data;
  } catch (error) {
    console.error("Error creating defect:", error.response?.data || error.message);
    throw error; // Rethrow to handle in the UI
  }
};

export const updateDefect = async ({editDefect, formDataWithImages }) => {
  try {
    //console.log("formDataWithImage=>  ", formDataWithImages); // Debugging line
    //console.log("editDefect=>  ", editDefect); // Debugging line
    const response = await axios.put(
              `${API_URL}/${editDefect._id}`,
              formDataWithImages, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            ); // Update defect if in edit mode
    //console.log("response.data=>  ", response.data); // Debugging line
    return response.data;
  } catch (error) {
    console.error("Error updating defect:", error);
    throw error;
  }
};

export const getDefectById = async (defectId) => {
  try {
    const response = await axios.get(`${API_URL}/${defectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defect details:", error);
    throw error;
  }
};

export const deleteDefect = async (deleteId) => {
  try {
    const response = await axios.delete(`${API_URL}/${deleteId}`);
    toast.success(response.data.message || "Defect deleted successfully");
    return response.data;
  } catch (error) {
    console.error("Error deleting defect:", error);
    toast.error(error.response?.data?.message || "Failed to delete defect. Please try again.");
    throw error;
  }
};

// export const fetchDefects = async ({ 
//   page = 1, 
//   limit = 10, 
//   search = "",
//   sortField = "detectedDate",
//   sortOrder = "desc",
//   severity = "",
//   defectType = "",
//   month = ""
// }) => {
//   try {
//     // Build query params
//     const params = new URLSearchParams({
//       page,
//       limit,
//       search,
//       sortField,
//       sortOrder
//     });
    
//     // Add optional filters if present
//     if (severity) params.append("severity", severity);
//     if (defectType) params.append("defectType", defectType);
//     if (month) params.append("month", month);
    
//     const response = await axios.get(`${API_URL}?${params.toString()}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching defects:", error);
//     throw error;
//   }
// };


export const fetchDefects = async ({
  page = 1,
  limit = 10,
  search = "",
  sortField = "detectedDate",
  sortOrder = "desc",
  severity = "",
  defectType = "",
  defectName = "",
  productionLine = "",
  dateFrom = "",
  dateTo = ""
}) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      search,
      sortField,
      sortOrder,
    });

    if (severity) params.append("severity", severity);
    if (defectType) params.append("defectType", defectType);
    if (defectName) params.append("defectName", defectName);
    if (productionLine) params.append("productionLine", productionLine);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);

    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defects:", error);
    throw error;
  }
};

export const fetchDefectStatistics = async (filters) => {
  const response = await axios.get(`${API_URL}/stats`, { params: filters });
  return response.data;
};

// export const fetchDefectStatistics = async (filters) => {
//   try {
//     // Convert empty strings to undefined to avoid sending empty params
//     const params = {
//       search: filters.search || undefined,
//       severity: filters.severity || undefined,
//       defectType: filters.defectType || undefined,
//       defectName: filters.defectName || undefined,
//       productionLine: filters.productionLine || undefined,
//       dateFrom: filters.dateFrom || undefined,
//       dateTo: filters.dateTo || undefined
//     };
//     console.log("Fetching defect statistics with params:", params);

//     // Remove undefined values
//     Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

//     const response = await axios.get(`${API_URL}/stats`, { params });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching defect statistics:', error);
//     throw error;
//   }
// };

export const getDefectAnalytics = async (defectId) => {
  const res = await axios.get(`${API_URL}/${defectId}/analytics`);
  return res.data;
};
