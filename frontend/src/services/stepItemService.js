import axios from "./api";


const API_URL = "/api/step-items";

export const addStepItem = async (newStepItem) => {
  try {
    const response = await axios.post(API_URL, newStepItem);
    return response.data;
  } catch (error) {
    console.error("Failed to add step item", error);
    throw error;
  }
};
