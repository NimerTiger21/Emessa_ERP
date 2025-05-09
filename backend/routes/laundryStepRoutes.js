const express = require("express");
const router = express.Router();
const laundryStepController = require("../controllers/laundryStepController");

// GET all laundry steps
router.get("/", laundryStepController.getLaundrySteps);

// POST create a new laundry step
router.post("/", laundryStepController.createLaundryStep);

// PUT update an existing laundry step
router.put("/:id", laundryStepController.updateLaundryStep);

// DELETE a laundry step
router.delete("/:id", laundryStepController.deleteLaundryStep);

module.exports = router;
