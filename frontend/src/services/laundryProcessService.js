import axios from "./api";


const API_URL = "/api/laundry-processes";

export const fetchLaundryProcesses = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching laundry processes", error);
    throw error;
  }
};
