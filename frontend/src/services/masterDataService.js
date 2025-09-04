// services/masterDataService.js
import { toast } from "react-toastify";
import axios from "./api";
const API_BASE = "/api/master-data";

export const fetchStyles = async () => {
  const response = await axios.get(`${API_BASE}/styles`);
  //console.log(response.data);
  return response.data;
};

export const fetchCustomers = async () => {
  const response = await axios.get(`${API_BASE}/customers`);
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
    console.error(error.response.data.message || "Error Creating Style:", error);
    toast.error(
      error.response.data.message ||
        error.message ||
        error ||
        "Failed to create style. Please try again."
    );
    //    return error.response.data;
    throw error;
  }
};

export const updateStyle = async (id, data) => {
  const res = await axios.put(`${API_BASE}/styles/${id}`, data);
  toast.success(res.data.style.name + " Style Updated Successfully");
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
