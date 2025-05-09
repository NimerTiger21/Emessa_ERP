import axios from "../services/api";


export const fetchDefectTrends = async () => {
  try {
    const response = await axios.get("api/reports/defects");
    return response.data;
  } catch (error) {
    console.error("Error fetching defect trends:", error);
    return [];
  }
};
