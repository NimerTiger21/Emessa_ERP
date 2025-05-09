// services/masterDataService.js
import { toast } from "react-toastify";
import axios from "./api";
const API_BASE = "/api/master-data";

export const fetchStyles = async () => {
  const response = await axios.get(`${API_BASE}/styles`);
  //console.log(response.data);
  return response.data;
};

// export const fetchStylesByBrand = async (brandId) => {
//   const response = await axios.get(`${API_BASE}/styles?brand=${brandId}`);
//   return response.data;
// };

export const fetchCustomers = async () => {
  const response = await axios.get(`${API_BASE}/customers`);
  return response.data;
};

export const createFabric = async (fabricData) => {
  try {
    const response = await axios.post(`${API_BASE}/fabrics`, fabricData);
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error Creating Fabric with Compositions:", error);
    toast.error(error.response.data.message || error.message || error || "Failed to create fabric. Please try again.");
//    return error.response.data;
    throw error;
  }
};
// Fetch Fabrics
export const fetchFabrics = async ({ page, limit, sortField, sortOrder, search, supplier }) => {
  const params = new URLSearchParams({
    page,
    limit,
    sortField,
    sortOrder,
    ...(search && { search }),
    ...(supplier && { supplier }),
  }).toString();
  const response = await axios.get(`${API_BASE}/fabrics?${params}`);
  return response.data;
};
export const updateFabric = async (id, updatedData) => {
  try {
    //console.log("Updating fabric with id:", id, "and data:", updatedData);
    const response = await axios.put(`${API_BASE}/fabrics/${id}`, updatedData);
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error updating fabric:", error);
    throw error;
  }
};
export const deleteFabric = async (fabricId) => {
  const response = await axios.delete(`${API_BASE}/fabrics/${fabricId}`);
  return response.data;
};

export const fetchFabricSuppliers = async () => {
  const response = await axios.get(`${API_BASE}/fabric-suppliers`);
  return response.data;
};

export const fetchCompositionItems = async () => {
  const response = await axios.get(`${API_BASE}/composition-items`);
  return response.data;
};

export const fetchBrands = async () => {
  const response = await axios.get(`${API_BASE}/brands`);
  return response.data;
};
export const createStyle = async (styleData) => {
  try {
    const response = await axios.post(`${API_BASE}/styles`, styleData);
    //console.log(response.data);
    toast.success(response.data.style.name + " " + response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error Creating Fabric with Compositions:", error);
    toast.error(error.response.data.message || error.message || error || "Failed to create fabric. Please try again.");
//    return error.response.data;
    throw error;
  }
};

export const updateStyle = async (id, data) => {
  const res = await axios.put(`${API_BASE}/styles/${id}`, data);
  toast.success(res.data.name + " Style Updated Successfully" );
  return res.data;
};

export const deleteStyle = async (id) => {
  const res = await axios.delete(`${API_BASE}/styles/${id}`);
  toast.success(res.data.message);
  return res.data;
};

export const fetchDefectTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE}/defect-types`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defect types:", error);
    throw error;
  }
};

export const fetchDefectNames = async () => {
  try {
    const response = await axios.get(`${API_BASE}/defect-names`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defect names:", error);
    throw error;
  }
};

export const fetchDefectPlaces = async () => {
  try {
    const response = await axios.get(`${API_BASE}/defect-places`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defect places:", error);
    throw error;
  }
};
export const fetchDefectProcesses = async () => {
  try {
    const response = await axios.get(`${API_BASE}/defect-processes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defect processes:", error);
    throw error;
  }
};
