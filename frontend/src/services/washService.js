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

/**
 * Fetch a single wash recipe by ID
 * @param {string} id - The ID of the wash recipe to fetch
 * @returns {Promise<Object>} - The wash recipe data
 */
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


/**
 * Update an existing wash recipe
 * @param {string} id - The ID of the wash recipe to update
 * @param {Object} recipeData - The updated wash recipe data
 * @returns {Promise<Object>} - The response from the server
 */
export const updateWashRecipe = async (id, recipeData) => {
  try {
    
    // const response = await fetch(`${process.env.REACT_APP_API_URL}/wash-recipes/${id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    //   body: JSON.stringify(recipeData)
    // });
    const response = await axios.put(`${API_URL}/${id}`, recipeData);
    //console.log("Response from updateWashRecipe:", response);
    
    // if (!response.ok) {
    //   const errorData = await response.data;
    //   console.error('Error updating wash recipe:', errorData);
    //   throw new Error(errorData.message || 'Failed to update wash recipe');
    // }
    toast.success(response.data.message);    
    return response.data;
  } catch (error) {
    console.error('Error updating wash recipe:', error);
    throw error;
  }
};