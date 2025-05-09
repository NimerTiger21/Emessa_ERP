const express = require("express");
const router = express.Router();
const stepItemController = require("../controllers/stepItemController");

// GET all step items
router.get("/", stepItemController.getStepItems);

// POST create a new step item
router.post("/", stepItemController.addStepItem);

module.exports = router;
