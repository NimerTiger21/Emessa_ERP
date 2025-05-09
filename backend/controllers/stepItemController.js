const RecipeItem = require("../models/RecipeItem");
const StepItem = require("../models/StepItem");

// Add a StepItem to a RecipeItem
exports.addStepItem = async (req, res) => {
  try {
    const { recipeItemId, chemicalItemId, quantity, unit } = req.body;
    console.log(recipeItemId, chemicalItemId, quantity, unit); // 6771043a8bbb3e4eee7780c5 67724aac4e7dc056bd1e2ea8 2 vol

    // Use recipeItemId directly (it could be stepId in this case)
    const stepItem = new StepItem({
      recipeItemId, // This can be stepId when steps are not saved
      chemicalItemId,
      quantity,
      unit,
    });

    await stepItem.save();

    // Add the StepItem reference to the RecipeItem
    await RecipeItem.findByIdAndUpdate(recipeItemId, {
      $push: { stepItems: stepItem._id },
    });

    res.status(200).json({ message: "Chemical added to step", stepItem });
  } catch (error) {
    console.error("Error adding step item:", error);
    res.status(500).json({ message: "Error adding step item", error });
  }
};

exports.getStepItems = async (req, res) => {
  try {
    const { recipeItemId } = req.params;

    const stepItems = await StepItem.find({ recipeItemId }).populate("chemicalItemId");

    res.status(200).json(stepItems);
  } catch (error) {
    console.error("Error fetching step items:", error);
    res.status(500).json({ message: "Error fetching step items", error });
  }
};