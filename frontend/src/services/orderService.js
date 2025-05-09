//import axios from "axios";
import axios from "../services/api";


const API_URL = "/api/orders";

 export const fetchOrders = async ({ page, limit, sortField, sortOrder, search, style }) => {
  try {
    //console.log("Fetching orders with params:", { page, limit, sortField, sortOrder, search, style });
    const params = new URLSearchParams({
      page,
      limit,
      sortField,
      sortOrder,
      ...(search && { search }),
      ...(style && { style }),
    }).toString();

    //const response = await axios.get(`http://localhost:5000/api/orders?${params}`);
    const response = await axios.get(`${API_URL}?${params}`);
    return response.data; // Return orders and pagination info
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    //console.log("Creating order with data:", orderData);
    const response = await axios.post(API_URL, orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const updateOrder = async (id, updatedData) => {
  try {
    //console.log("Updating order with id:", id, "and data:", updatedData);
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defect details:", error);
    throw error;
  }
};

export const fetchDefectsForOrder = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}/defects`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defects:", error);
    throw error;
  }
};
