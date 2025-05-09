import axios from "./api";


const API_URL = "/api/laundry-steps";

export const fetchLaundrySteps = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching laundry steps", error);
    throw error;
  }
};
