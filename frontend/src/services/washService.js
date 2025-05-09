//import axios from "axios";
import { toast } from "react-toastify";
import axios from "./api";


const API_URL = "/api/wash-recipes";

export const createWashRecipe = async (recipeData) => {
  try {
    //console.log("recipeData for wash recipe:", recipeData);
    const response = await axios.post(API_URL, recipeData);
    return response.data;
  } catch (error) {
    console.error("Error creating Wash Recipe:", error);
//    return error.response.data;
    throw error;
  }
};

export const fetchWashRecipes = async () => {
  try {
    //console.log("recipeData for wash recipe:", recipeData);
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching Wash Recipes:", error);
//    return error.response.data;
    throw error;
  }
};

export const getWashRecipeById = async (washRecipsId) => {
  try {
    const response = await axios.get(`${API_URL}/${washRecipsId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching wash recipe details:", error);
    throw error;
  }
};

export const deleteWashRecipe = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  toast.success(res.data.message);
  return res.data;
};