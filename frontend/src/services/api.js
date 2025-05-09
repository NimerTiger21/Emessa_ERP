import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    //"Content-Type": "multipart/form-data",
    "Content-Type": "application/json",
  },
});
export default api;
