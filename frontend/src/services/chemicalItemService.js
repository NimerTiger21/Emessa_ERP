import axios from "./api";


const API_URL = "/api/chemical-items";

export const fetchChemicalItems = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching chemical items", error);
    throw error;
  }
};
