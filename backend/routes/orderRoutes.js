const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");


//router.post("/", orderController.createOrder);
router.post("/", orderController.createOrUpdateOrder);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
//router.put("/:id", orderController.updateOrder);
router.put("/:id", orderController.createOrUpdateOrder);
router.delete("/:id", orderController.deleteOrder);
// Tiger this is not used (Also in the backend server orderController and frontend defectService.js => addDefectToOrder)
router.post("/:orderId/defects", orderController.addDefectToOrder);
router.get("/:orderId/defects", orderController.getDefectsForOrder);

module.exports = router;
