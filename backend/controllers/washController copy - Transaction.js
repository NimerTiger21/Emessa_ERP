const WashRecipe = require("../models/WashRecipe");
const RecipeItem = require("../models/RecipeItem");
const RecipeProcess = require("../models/RecipeProcess");
const { default: mongoose } = require("mongoose");
const StepItem = require("../models/StepItem");

exports.createWashRecipe = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId, washCode, washType, steps, recipeProcess } = req.body;    
    const normalizedWashCode = washCode === "" ? null : washCode;

    if (normalizedWashCode) {
    const existingRecipe = await WashRecipe.findOne({ washCode: normalizedWashCode});
    if (existingRecipe) {
      return res.status(400).json({ message: "Wash Code already exists." });
    }}
    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({ message: "Steps must be an array of RecipeItem IDs." });
    }

    const invalidStep = steps.find((step) => !mongoose.Types.ObjectId.isValid(step.stepId));
    if (invalidStep) {
      return res.status(400).json({ message: `Invalid stepId in step sequence ${invalidStep.sequence}.` });
    }

    const washRecipe = new WashRecipe({ orderId, washCode: normalizedWashCode, washType });
    await washRecipe.save({ session });

    // Save steps and chemicals
    for (const step of steps) {
      const recipeItem = new RecipeItem({
        stepId: step.stepId, // Temporary stepId
        time: step.time,
        temperature: step.temp,
        liters: step.liters,
        sequence: step.sequence,
        washRecipeId: washRecipe._id, // Link step to the wash recipe
      });

      await recipeItem.save({ session });

      // Save chemicals for this step
      if (step.chemicals && step.chemicals.length > 0) {
        const stepItems = step.chemicals.map((chemical) => ({
          recipeItemId: recipeItem._id, // Link chemical to the step item | // Map to the new database _id
          chemicalItemId: chemical.chemicalItemId,
          quantity: chemical.quantity,
          unit: chemical.unit,
        }));
        await StepItem.insertMany(stepItems, { session });
      }
    }

    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    if (!recipeProcess.every((process) => isValidObjectId(process.laundryProcessId))) {
      return res.status(400).json({ message: "Invalid laundryProcessId detected." });
    }
    

    // Add Recipe Process
    const recipeProcesses = recipeProcess.map((process) => ({
      washRecipeId: washRecipe._id,
      sequence: process.sequence,
      remark: process.remark,
      //laundryProcessId: process.laundryProcessId,
      laundryProcessId: new mongoose.Types.ObjectId(process.laundryProcessId), // Convert to ObjectId
      recipeProcessType: process.processType,
    }));

    const createdProcesses = await RecipeProcess.insertMany(recipeProcesses, { session });

    // Update the wash recipe with the linked RecipeProcess references
    washRecipe.recipeProcessId = createdProcesses.map((process) => process._id);
    //await washRecipe.save();
    await washRecipe.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Wash recipe created successfully.", washRecipe });
  } catch (error) {
    console.error("Error saving wash recipe:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error creating wash recipe.", error });
  }
};
