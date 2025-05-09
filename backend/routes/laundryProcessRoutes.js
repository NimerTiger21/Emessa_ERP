const express = require("express");
const router = express.Router();
const laundryProcessController = require("../controllers/laundryProcessController");

// GET all laundry steps
router.get("/", laundryProcessController.getLaundryProcesses);

// POST create a new laundry step
router.post("/", laundryProcessController.createLaundryProcess);

// PUT update an existing laundry step
router.put("/:id", laundryProcessController.updateLaundryprocess);

// DELETE a laundry step
router.delete("/:id", laundryProcessController.deleteLaundryProcess);

module.exports = router;
