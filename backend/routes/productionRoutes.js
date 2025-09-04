const express = require("express");
const router = express.Router();
const productionController = require("../controllers/productionController");


router.post("/compute", productionController.computeSchedule);


module.exports = router;
