const LaundryProcess = require("../models/LaundryProcess");

// Fetch all laundry processes
exports.getLaundryProcesses = async (req, res) => {
  try {
    const LaundryProcesses = await LaundryProcess.find();
    res.status(200).json(LaundryProcesses);
  } catch (error) {
    console.error("Error fetching laundry processes:", error);
    res.status(500).json({ message: "Error fetching laundry processes." });
  }
};

// Create a new laundry process
exports.createLaundryProcess = async (req, res) => {
  try {
    const { code, name, type } = req.body;

    // Check for duplicate code
    const existingProcess = await LaundryProcess.findOne({ code });
    if (existingProcess) {
      return res.status(400).json({ message: "Process with this code: "+ existingProcess +" already exists." });
    }

    const laundryProcess = new LaundryProcess({ code, name, type });
    await laundryProcess.save();

    res.status(201).json(laundryProcess);
  } catch (error) {
    console.error("Error creating laundry process:", error);
    res.status(500).json({ message: "Error creating laundry process." });
  }
};

// Update an existing laundry process
exports.updateLaundryprocess = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, type } = req.body;

    const laundryProcess = await LaundryProcess.findByIdAndUpdate(
      id,
      { code, name, type },
      { new: true, runValidators: true }
    );

    if (!laundryProcess) {
      return res.status(404).json({ message: "Laundry process not found." });
    }

    res.status(200).json(laundryProcess);
  } catch (error) {
    console.error("Error updating laundry process:", error);
    res.status(500).json({ message: "Error updating laundry process." });
  }
};

// Delete a laundry process
exports.deleteLaundryProcess = async (req, res) => {
  try {
    const { id } = req.params;

    const laundryProcess = await LaundryProcess.findByIdAndDelete(id);

    if (!laundryProcess) {
      return res.status(404).json({ message: "Laundry process not found." });
    }

    res.status(200).json({ message: "Laundry process deleted successfully." });
  } catch (error) {
    console.error("Error deleting laundry process:", error);
    res.status(500).json({ message: "Error deleting laundry process." });
  }
};
