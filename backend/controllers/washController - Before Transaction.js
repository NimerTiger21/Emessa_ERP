const WashRecipe = require("../models/WashRecipe");
const RecipeItem = require("../models/RecipeItem");
const RecipeProcess = require("../models/RecipeProcess");
const { default: mongoose } = require("mongoose");
const StepItem = require("../models/StepItem");

exports.createWashRecipe = async (req, res) => {
  try {
    const { orderId, washCode, washType, steps, recipeProcess } = req.body;
    console.error("req.body: ", req.body);
    
    //const drop = await WashRecipe.collection.dropIndex('washCode_1');
    //console.error("xdropx: ", drop);
    //await WashRecipe.collection.createIndex({ washCode: 1 }, { unique: true, sparse: true });
    //Error creating wash recipe: MongoServerError: E11000 duplicate key error collection: emessaDB.washrecipes index: washCode_1 dup key: { washCode: "" }

    //const xx = await WashRecipe.collection.getIndexes();
    //console.error("xx: ", xx); // { _id_: [ [ '_id', 1 ] ], washCode_1: [ [ 'washCode', 1 ] ] }
    // { _id_: [ [ '_id', 1 ] ] }

    // Convert empty string to null
    const normalizedWashCode = washCode === "" ? null : washCode;

    // Validate and check for duplicates // Validate washCode for uniqueness // Validate uniqueness only if washCode is provided (not null)
    if (normalizedWashCode) {
    const existingRecipe = await WashRecipe.findOne({ washCode: normalizedWashCode});
    if (existingRecipe) {
      return res.status(400).json({ message: "Wash Code already exists." });
    }}
    // Validate that steps is an array
    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({ message: "Steps must be an array of RecipeItem IDs." });
    }

    const invalidStep = steps.find((step) => !mongoose.Types.ObjectId.isValid(step.stepId));
    if (invalidStep) {
      return res.status(400).json({ message: `Invalid stepId in step sequence ${invalidStep.sequence}.` });
    }

    // Create WashRecipe // Create the wash recipe without steps or processes initially
    const washRecipe = new WashRecipe({ orderId, washCode: normalizedWashCode, washType });
    await washRecipe.save();

    /*
    // Add Recipe Items
    const recipeItems = steps.map((step) => ({
      washRecipeId: washRecipe._id,
      stepId: step.stepId,
      time: step.time,
      temp: step.temp,
      liters: step.liters,
      sequence: step.sequence,
    }));

    const savedRecipeItems = await RecipeItem.insertMany(recipeItems);
    */

    // Create RecipeItem documents and link them to the wash recipe
    const recipeItems = await Promise.all(
      steps.map(async (step) => {
        const recipeItem = new RecipeItem({
          washRecipeId: washRecipe._id,
          stepId: step.stepId,
          time: step.time,
          temp: step.temp,
          liters: step.liters,
          sequence: step.sequence,
        });
        await recipeItem.save();
        return recipeItem._id; // Return the ObjectId of the saved RecipeItem
      })
    );

    // Update the wash recipe with the linked RecipeItem references
    washRecipe.steps = recipeItems;
    await washRecipe.save();

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

    const createdProcesses = await RecipeProcess.insertMany(recipeProcesses);

    // Update the wash recipe with the linked RecipeProcess references
    washRecipe.recipeProcessId = createdProcesses.map((process) => process._id);
    await washRecipe.save();

    res.status(201).json({ message: "Wash recipe created successfully.", washRecipe });
  } catch (error) {
    console.error("Error creating wash recipe:", error);
    res.status(500).json({ message: "Error creating wash recipe.", error });
  }
};

exports.getWashRecipeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const washRecipe = await WashRecipe.findById(id)
      .populate("orderId", "orderNo fabricArt fabricSupplier season keyNo orderQty style orderDate")
      .populate("steps")
      .populate({
        path: "steps",
        populate: {
          path: "stepId",
          model: "LaundryStep",
          select: "name code",
        },
      })
      .populate({
        path: "steps",
        populate: {
          path: "items.chemicalId",
          model: "Chemical",
        },
      });

    if (!washRecipe) {
      return res.status(404).json({ message: "Wash recipe not found." });
    }

    res.status(200).json(washRecipe);
  } catch (error) {
    console.error("Error fetching wash recipe details:", error);
    res.status(500).json({ message: "Error fetching wash recipe details.", error });
  }
};
