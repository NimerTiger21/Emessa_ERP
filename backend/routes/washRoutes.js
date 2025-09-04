// routes/washRoutes.js
const express = require("express");
const router = express.Router();
const washController = require("../controllers/washController");
const { protect, restrictTo } = require("../controllers/authController");

// Apply protect middleware to all routes
// router.use(protect);

// Route to get aggregated defect data
router.get("/", washController.getAllWashRecipes);
router.get("/", washController.getWashRecipeDetails);
router.post("/", washController.createWashRecipe);
router.get("/:id", washController.getWashRecipeDetailsById);
// router.delete("/:id", restrictTo("admin"), washController.deleteWashRecipe); // DELETE /api/wash-recipes/:id

// Protected DELETE route (admin only)
router.delete(
  "/:id",
  protect,           // Ensures user is logged in
  restrictTo("admin"), // Restricts to admin role
  washController.deleteWashRecipe
);

router.put("/:id", washController.updateWashRecipe); // PUT /api/wash-recipes/:id
module.exports = router;
