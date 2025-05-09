const express = require("express");
const router = express.Router();
const chemicalItemController = require("../controllers/chemicalItemController");

// GET all chemical items
router.get("/", chemicalItemController.getChemicalItems);

// POST create a new chemical item
router.post("/", chemicalItemController.createChemicalItem);

// PUT update an existing chemical item
router.put("/:id", chemicalItemController.updateChemicalItem);

// DELETE a chemical item
router.delete("/:id", chemicalItemController.deleteChemicalItem);

module.exports = router;
