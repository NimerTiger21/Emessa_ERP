const Section = require("../models/Section"); // Assuming Section and related models exist
const Process = require("../models/Process"); // Assuming Process is a model
const DefectType = require("../models/DefectType"); // Assuming DefectType is a model

// Get all sections
exports.getSections = async (req, res) => {
  try {
    const sections = await Section.find();
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sections", error });
  }
};

// Get processes by section
exports.getProcessesBySection = async (req, res) => {
  try {
    const processes = await Process.find({ sectionId: req.params.sectionId });
    res.status(200).json(processes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching processes", error });
  }
};

// Get defects by process
exports.getDefectsByProcess = async (req, res) => {
  try {
    const defects = await DefectType.find({ processId: req.params.processId });
    res.status(200).json(defects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defects", error });
  }
};
