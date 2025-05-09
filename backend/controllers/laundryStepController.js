const LaundryStep = require("../models/LaundryStep");

// Fetch all laundry steps
exports.getLaundrySteps = async (req, res) => {
  try {
    const laundrySteps = await LaundryStep.find().select('name _id code'); // Fetch only 'name' and 'description';
    res.status(200).json(laundrySteps);
  } catch (error) {
    console.error("Error fetching laundry steps:", error);
    res.status(500).json({ message: "Error fetching laundry steps." });
  }
};

// Create a new laundry step
exports.createLaundryStep = async (req, res) => {
  try {
    const { code, name } = req.body;

    // Check for duplicate code
    const existingStep = await LaundryStep.findOne({ code });
    if (existingStep) {
      return res.status(400).json({ message: "Step with this code already exists." });
    }

    const laundryStep = new LaundryStep({ code, name });
    await laundryStep.save();

    res.status(201).json(laundryStep);
  } catch (error) {
    console.error("Error creating laundry step:", error);
    res.status(500).json({ message: "Error creating laundry step." });
  }
};

// Update an existing laundry step
exports.updateLaundryStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    const laundryStep = await LaundryStep.findByIdAndUpdate(
      id,
      { code, name },
      { new: true, runValidators: true }
    );

    if (!laundryStep) {
      return res.status(404).json({ message: "Laundry step not found." });
    }

    res.status(200).json(laundryStep);
  } catch (error) {
    console.error("Error updating laundry step:", error);
    res.status(500).json({ message: "Error updating laundry step." });
  }
};

// Delete a laundry step
exports.deleteLaundryStep = async (req, res) => {
  try {
    const { id } = req.params;

    const laundryStep = await LaundryStep.findByIdAndDelete(id);

    if (!laundryStep) {
      return res.status(404).json({ message: "Laundry step not found." });
    }

    res.status(200).json({ message: "Laundry step deleted successfully." });
  } catch (error) {
    console.error("Error deleting laundry step:", error);
    res.status(500).json({ message: "Error deleting laundry step." });
  }
};
