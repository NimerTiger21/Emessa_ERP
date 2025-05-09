// Order Creation or Update with Validation
exports.createOrUpdateOrder = async (req, res) => {
    try {
      const { orderNo, ...otherFields } = req.body;
  
      // Check if orderNo already exists (for creation and update)
      const existingOrder = await Order.findOne({ orderNo });
  
      if (existingOrder) {
        if (!req.params.id || req.params.id !== existingOrder._id.toString()) {
          return res.status(400).json({ message: "Order number already exists. Please use a unique order number." });
        }
      }
  
      let order;
  
      // If id is provided, update the order
      if (req.params.id) {
        order = await Order.findByIdAndUpdate(req.params.id, { orderNo, ...otherFields }, { new: true, runValidators: true });
        if (!order) {
          return res.status(404).json({ message: "Order not found." });
        }
      } else {
        // Otherwise, create a new order
        order = new Order({ orderNo, ...otherFields });
        await order.save();
      }
  
      res.status(200).json(order);
    } catch (error) {
      console.error("Error creating or updating order:", error);
      res.status(500).json({ message: "Error creating or updating order", error });
    }
  };
  