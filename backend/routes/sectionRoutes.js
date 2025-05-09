// routes/sectionRoutes.js
const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");

// Route to get aggregated defect data
router.get("/sections", sectionController.getSections);
router.get("/processes/:sectionId", sectionController.getProcessesBySection);
router.get("/defects/:processId", sectionController.getDefectsByProcess);

module.exports = router;
