const ChemicalItem = require("../models/ChemicalItem");

// Fetch all Chemical Items
exports.getChemicalItems = async (req, res) => {
  try {
    const chemicalItems = await ChemicalItem.find().select('name _id code'); // Fetch only 'name' and 'code';
    res.status(200).json(chemicalItems);
  } catch (error) {
    console.error("Error fetching Chemical Items:", error);
    res.status(500).json({ message: "Error fetching Chemical Items." });
  }
};

// Create a new chemical item
exports.createChemicalItem = async (req, res) => {
  try {
    const { code, name, supplier, unit } = req.body;

    // Check for duplicate code
    const existingChemicalItem = await ChemicalItem.findOne({ code });
    if (existingChemicalItem) {
      return res.status(400).json({ message: "Chemical Item with this code already exists." });
    }

    const chemicalItem = new ChemicalItem({ code, name, supplier, unit });
    await chemicalItem.save();

    res.status(201).json(chemicalItem);
  } catch (error) {
    console.error("Error creating chemical item:", error);
    res.status(500).json({ message: "Error creating chiemical item." });
  }
};

// Update an existing Chemical Item
exports.updateChemicalItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, supplier, unit } = req.body;

    const chemicalItem = await ChemicalItem.findByIdAndUpdate(
      id,
      { code, name, supplier, unit },
      { new: true, runValidators: true }
    );

    if (!chemicalItem) {
      return res.status(404).json({ message: "Chemical Item not found." });
    }

    res.status(200).json(chemicalItem);
  } catch (error) {
    console.error("Error updating Chemical Item:", error);
    res.status(500).json({ message: "Error updating Chemical Item." });
  }
};

// Delete a Chemical Item
exports.deleteChemicalItem = async (req, res) => {
  try {
    const { id } = req.params;

    const chemicalItem = await ChemicalItem.findByIdAndDelete(id);

    if (!chemicalItem) {
      return res.status(404).json({ message: "Chemical Item not found." });
    }

    res.status(200).json({ message: "Chemical Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting Chemical Item:", error);
    res.status(500).json({ message: "Error deleting Chemical Item." });
  }
};
