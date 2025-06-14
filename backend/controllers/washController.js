const WashRecipe = require("../models/washRecipe/WashRecipe");
const RecipeItem = require("../models/washRecipe/RecipeItem");
const RecipeProcess = require("../models/washRecipe/RecipeProcess");
const { default: mongoose } = require("mongoose");
const StepItem = require("../models/washRecipe/StepItem");
const ChemicalItem = require("../models/washRecipe/ChemicalItem");
const Order = require("../models/order/Order");

exports.createWashRecipe = async (req, res) => {
  try {
    const { orderId, date, washCode, washType, workspaceItems } = req.body;
    const normalizedWashCode = washCode === "" ? null : washCode;

    // Get all indexes on the collection
    const indexes = await WashRecipe.collection.getIndexes();
    // Check if the index exists | // Ensure indexes is an object and check if the required index exists
    //const indexExists = indexes.some(index => index.name === 'washCode_1');
    const indexExists = Object.keys(indexes).some(
      (indexName) => indexName === "washCode_1"
    );

    if (indexExists) {
      // Drop the index
      await WashRecipe.collection.dropIndex("washCode_1");
      console.log("washCode_1 Index dropped successfully.");
      //await WashRecipe.collection.createIndex({ washCode: 1 }, { unique: true, sparse: true });
    } else {
      console.log("Index washCode_1 does not exist.");
    }

    // Validate and check for duplicates // Validate washCode for uniqueness // Validate uniqueness only if washCode is provided (not null)
    if (normalizedWashCode) {
      const existingRecipe = await WashRecipe.findOne({
        washCode: normalizedWashCode,
      });
      if (existingRecipe) {
        return res.status(400).json({ message: "Wash Code already exists." });
      }
    }

    // 1. Save the main WashRecipe | // Create WashRecipe // Create the wash recipe without steps or processes initially
    const washRecipe = new WashRecipe({
      orderId,
      date,
      washCode: normalizedWashCode,
      washType,
    });
    await washRecipe.save();

    // Separate steps and processes for storage
    const steps = workspaceItems
      .filter((item) => item.type === "step")
      .map((step) => ({
        washRecipeId: washRecipe._id,
        stepId: step.stepId,
        time: step.time,
        temp: step.temp,
        liters: step.liters,
        sequence: step.sequence,
        chemicals: step.chemicals,
      }));

    const processes = workspaceItems
      .filter((item) => item.type === "process")
      .map((process) => ({
        washRecipeId: washRecipe._id,
        laundryProcessId: process.laundryProcessId,
        recipeProcessType: process.processType,
        remark: process.remark,
        sequence: process.sequence,
      }));

    // Validate that steps is an array
    if (!steps || !Array.isArray(steps)) {
      return res
        .status(400)
        .json({ message: "Steps must be an array of RecipeItem IDs." });
    }
    const invalidStep = steps.find(
      (step) => !mongoose.Types.ObjectId.isValid(step.stepId)
    );
    if (invalidStep) {
      return res.status(400).json({
        message: `Invalid stepId in step sequence ${invalidStep.sequence}.`,
      });
    }

    // Array to track saved IDs for rollback if needed
    const savedRecipeItems = [];
    const savedStepItems = [];
    const savedRecipeProcesses = [];

    //************************************************************************************************************
    try {
      // 2. Save Recipe Items (Steps)
      // Save steps and chemicals

      for (const step of steps) {
        const recipeItem = new RecipeItem({
          stepId: step.stepId, // Temporary stepId
          time: step.time,
          temp: step.temp,
          liters: step.liters,
          sequence: step.sequence,
          washRecipeId: washRecipe._id, // Link step to the wash recipe
        });

        const savedRecipeItem = await recipeItem.save();
        savedRecipeItems.push(savedRecipeItem._id);

        // Instead of overwriting, push to the steps array
        washRecipe.steps.push(savedRecipeItem._id); // Push the new RecipeItem ID into the array

        // Save chemicals for this step
        if (step.chemicals && step.chemicals.length > 0) {
          //console.log('Saving ', step.chemicals.length, 'chemicals');
          //console.log('Saving***** ', step.chemicals, 'chemicals');
          const stepItems = step.chemicals.map((chemical) => ({
            recipeItemId: recipeItem._id, // Link chemical to the step item | // Map to the new database _id
            chemicalItemId: chemical.chemicalItemId,
            quantity: chemical.quantity,
            unit: chemical.unit,
          }));
          //console.log("stepItems: ", stepItems);

          const savedChemicals = await StepItem.insertMany(stepItems);
          savedStepItems.push(...savedChemicals.map((item) => item._id));

          // Update the Recipe Item with the linked Step Items references // Link chemicals to the Recipe Item
          // recipeItem.stepItems = savedChemicals.map((item) => item._id);
          // await recipeItem.save();
          savedRecipeItem.stepItems = savedChemicals.map((item) => item._id);
          await savedRecipeItem.save();
        }
      }
      // Save all RecipeItems references after the loop
      await washRecipe.save();
      //************************************************************************************************************ */

      const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
      if (
        !processes.every((process) => isValidObjectId(process.laundryProcessId))
      ) {
        return res
          .status(400)
          .json({ message: "Invalid laundryProcessId detected." });
      }

      // 3. Save Recipe Processes | // Add Recipe Process
      const recipeProcesses = processes.map((process) => ({
        washRecipeId: washRecipe._id,
        sequence: process.sequence,
        recipeProcessType: process.recipeProcessType,
        remark: process.remark,
        //laundryProcessId: process.laundryProcessId,
        laundryProcessId: new mongoose.Types.ObjectId(process.laundryProcessId), // Convert to ObjectId
      }));

      const savedProcess = await RecipeProcess.insertMany(recipeProcesses);
      savedRecipeProcesses.push(savedProcess._id);

      // Update the wash recipe with the linked RecipeProcess references
      washRecipe.recipeProcessId = savedProcess.map((process) => process._id);
      await washRecipe.save();

      // Associate the defect with the order
      await Order.findByIdAndUpdate(washRecipe.orderId, {
        $push: { washRecipes: washRecipe._id },
      });

      res
        .status(201)
        .json({ message: "Wash recipe created successfully.", washRecipe }); // steps: savedSteps * Optional: Send Updated IDs to the Frontend
      // If needed, the backend can return the saved steps with their new _id values so the frontend can update its state accordingly.
    } catch (error) {
      // Rollback related data if any part of the operation fails
      console.error("Error in related data, rolling back:", error);

      // Remove saved Recipe Items
      await RecipeItem.deleteMany({ _id: { $in: savedRecipeItems } });
      // Remove saved Step Items
      await StepItem.deleteMany({ _id: { $in: savedStepItems } });
      // Remove saved Recipe Processes
      await RecipeProcess.deleteMany({ _id: { $in: savedRecipeProcesses } });

      // Remove the Wash Recipe
      if (washRecipe && washRecipe._id) {
        //.deleteOne() or .findByIdAndDelete() is preferred over .remove() due to Mongoose deprecation.
        // Remove the Wash Recipe
        //await washRecipe.remove();
        await WashRecipe.findByIdAndDelete(washRecipe._id); // If you’re not sure if washRecipe is a valid Mongoose document, use findByIdAndDelete
        //await washRecipe.deleteOne();
      }

      throw error; // Re-throw the error to the outer catch block
    }
  } catch (error) {
    console.error("Error creating wash recipe:", error);
    res.status(500).json({ message: "Error creating wash recipe.", error });
  }
};

exports.getAllWashRecipes = async (req, res) => {
  try {
    // Fetch all wash recipes with populated related data
    const washRecipes = await WashRecipe.find()
      .populate({
        path: "orderId",
        select:
          "orderNo season style fabric fabricSupplier keyNo orderQty orderDate articleNo",
        populate: {
          path: "style",
          select: "name styleNo", // ✅ Select desired style fields
        },
      }) // Populate order details
      .populate({
        path: "recipeProcessId", // Populate processes
        populate: {
          path: "laundryProcessId", // Populate laundry process inside processes
          select: "name recipeProcessType",
        },
      })
      .sort({ date: -1 }); // Change 'washCode' to the field you want to sort by and 1 for ascending, -1 for descending;

    if (!washRecipes || washRecipes.length === 0) {
      return res.status(404).json({ message: "No wash recipes found." });
    }

    res.status(200).json(washRecipes);
  } catch (error) {
    console.error("Error fetching wash recipes:", error);
    res.status(500).json({ message: "Error fetching wash recipes.", error });
  }
};

exports.getWashRecipeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const washRecipe = await WashRecipe.findById(id)
      .populate(
        "orderId",
        "orderNo fabricArt fabricSupplier season keyNo orderQty style orderDate"
      )
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
    res
      .status(500)
      .json({ message: "Error fetching wash recipe details.", error });
  }
};

exports.getWashRecipeDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the main wash recipe
    const washRecipe = await WashRecipe.findById(id)
      .populate({
        path: "orderId",
        select:
          "orderNo season style fabric fabricSupplier keyNo orderQty orderDate articleNo",
        populate: {
          path: "style",
          select: "name styleNo", // ✅ Select desired style fields
        },
      }) // Populate order details
      .exec();

    if (!washRecipe) {
      return res.status(404).json({ message: "Wash recipe not found." });
    }

    // Fetch associated recipe items (steps)
    const steps = await RecipeItem.find({ washRecipeId: id })
      .populate("stepId", "name") // Populate step name
      .exec();

    // Fetch chemicals and group them by recipeItemId
    const stepItems = await StepItem.find({
      recipeItemId: { $in: steps.map((step) => step._id) },
    })
      .populate("chemicalItemId", "name unit supplier")
      .exec();

    const chemicalsByStep = stepItems.reduce((acc, item) => {
      if (!acc[item.recipeItemId]) acc[item.recipeItemId] = [];
      acc[item.recipeItemId].push({
        id: item._id,
        chemicalItemId: item.chemicalItemId._id,
        name: item.chemicalItemId.name,
        unit: item.chemicalItemId.unit,
        supplier: item.chemicalItemId.supplier,
        quantity: item.quantity,
      });
      return acc;
    }, {});

    // Fetch associated recipe processes
    const processes = await RecipeProcess.find({ washRecipeId: id })
      .populate("laundryProcessId", "name type") // Populate process details
      .exec();

    // Merge steps and processes by sequence
    const combinedItems = [...steps, ...processes].sort(
      (a, b) => a.sequence - b.sequence
    );

    res.status(200).json({
      washRecipe,
      steps,
      chemicalsByStep,
      processes,
      combinedItems, // Merged steps and processes
    });
  } catch (error) {
    console.error("Error fetching wash recipe details:", error);
    res
      .status(500)
      .json({ message: "Error fetching wash recipe details.", error });
  }
};

// controllers/washRecipeController.js

exports.deleteWashRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const washRecipe = await WashRecipe.findById(id);
    if (!washRecipe) {
      return res.status(404).json({ message: "Wash recipe not found." });
    }

    // 1. Delete all step items (chemicals) linked to steps
    const recipeItemIds = washRecipe.steps || [];
    const recipeProcessIds = washRecipe.recipeProcessId || [];

    const stepItems = await StepItem.find({
      recipeItemId: { $in: recipeItemIds },
    });
    const stepItemIds = stepItems.map((item) => item._id);

    // Delete chemicals
    await StepItem.deleteMany({ _id: { $in: stepItemIds } });

    // Delete steps
    await RecipeItem.deleteMany({ _id: { $in: recipeItemIds } });

    // Delete processes
    await RecipeProcess.deleteMany({ _id: { $in: recipeProcessIds } });

    // 3. Remove reference from the associated order
    if (washRecipe.orderId) {
      await Order.findByIdAndUpdate(
        washRecipe.orderId,
        { $pull: { washRecipes: id } }, // Remove the deleted recipe ID
        { new: true }
      );
    }

    // 2. Delete the wash recipe
    const deletedRecipe = await WashRecipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: "Wash recipe not found." });
    }

    res
      .status(200)
      .json({ message: "Wash recipe and related data deleted successfully." });
  } catch (error) {
    console.error("Error deleting wash recipe:", error);
    res.status(500).json({ message: "Error deleting wash recipe." });
  }
};

exports.updateWashRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId, date, washCode, washType, workspaceItems } = req.body;
    const normalizedWashCode = washCode === "" ? null : washCode;

    const washRecipe = await WashRecipe.findById(id);
    if (!washRecipe) {
      return res.status(404).json({ message: "Wash recipe not found." });
    }

    if (normalizedWashCode && normalizedWashCode !== washRecipe.washCode) {
      const existingRecipe = await WashRecipe.findOne({
        washCode: normalizedWashCode,
        _id: { $ne: id },
      });
      if (existingRecipe) {
        return res.status(400).json({ message: "Wash Code already exists." });
      }
    }

    // NEW CODE START -------------------------------------------------
    const previousOrderId = washRecipe.orderId?.toString();

    if (orderId && orderId !== previousOrderId) {
      if (previousOrderId) {
        await Order.findByIdAndUpdate(previousOrderId, {
          $pull: { washRecipes: id },
        });
      }

      await Order.findByIdAndUpdate(
        orderId,
        { $addToSet: { washRecipes: id } },
        { new: true }
      );
    }
    // NEW CODE END ---------------------------------------------------

    const existingRecipeItems = await RecipeItem.find({ washRecipeId: id });
    const existingRecipeItemMap = new Map();
    existingRecipeItems.forEach((item) => {
      existingRecipeItemMap.set(item._id.toString(), item);
    });

    const existingStepItems = await StepItem.find({
      recipeItemId: { $in: existingRecipeItems.map((item) => item._id) },
    });

    const existingChemicalsByRecipeItem = new Map();
    existingStepItems.forEach((chemical) => {
      const recipeItemId = chemical.recipeItemId.toString();
      if (!existingChemicalsByRecipeItem.has(recipeItemId)) {
        existingChemicalsByRecipeItem.set(recipeItemId, new Map());
      }
      existingChemicalsByRecipeItem
        .get(recipeItemId)
        .set(chemical.chemicalItemId.toString(), chemical);
    });

    await WashRecipe.findByIdAndUpdate(id, {
      orderId,
      date,
      washCode: normalizedWashCode,
      washType,
    });

    const newStepIds = [];
    const newProcessIds = [];
    const recipeItemsToDelete = new Set(
      existingRecipeItems.map((item) => item._id.toString())
    );

    const steps = workspaceItems.filter((item) => item.type === "step");

    for (const step of steps) {
      let recipeItem;
      const isExisting =
        step._id && existingRecipeItemMap.has(step._id.toString());

      if (isExisting) {
        recipeItem = existingRecipeItemMap.get(step._id.toString());
        recipeItemsToDelete.delete(step._id.toString());

        recipeItem.stepId = step.stepId;
        recipeItem.time = step.time;
        recipeItem.temp = step.temp;
        recipeItem.liters = step.liters;
        recipeItem.sequence = step.sequence;

        await recipeItem.save();
      } else {
        recipeItem = new RecipeItem({
          washRecipeId: id,
          stepId: step.stepId,
          time: step.time,
          temp: step.temp,
          liters: step.liters,
          sequence: step.sequence,
        });
        await recipeItem.save();
      }

      newStepIds.push(recipeItem._id);

      const existingChemicalsMap =
        existingChemicalsByRecipeItem.get(recipeItem._id.toString()) ||
        new Map();
      const updatedChemicalItemIds = new Set();

      const submittedChemicals = Array.isArray(step.chemicals)
        ? step.chemicals
        : [];

      for (const chemical of submittedChemicals) {
        if (
          !chemical.chemicalItemId ||
          !mongoose.Types.ObjectId.isValid(chemical.chemicalItemId)
        ) {
          continue;
        }

        const chemIdStr = chemical.chemicalItemId.toString();
        updatedChemicalItemIds.add(chemIdStr);

        if (existingChemicalsMap.has(chemIdStr)) {
          const existingChemical = existingChemicalsMap.get(chemIdStr);
          existingChemical.quantity = chemical.quantity || 0;
          existingChemical.unit = chemical.unit || "";
          await existingChemical.save();
        } else {
          const newChemical = new StepItem({
            recipeItemId: recipeItem._id,
            chemicalItemId: chemIdStr,
            quantity: chemical.quantity || 0,
            unit: chemical.unit || "",
          });
          await newChemical.save();
        }
      }

      for (const [
        existingChemId,
        existingChemObj,
      ] of existingChemicalsMap.entries()) {
        if (!updatedChemicalItemIds.has(existingChemId)) {
          await StepItem.findByIdAndDelete(existingChemObj._id);
        }
      }
    }

    const processes = workspaceItems.filter((item) => item.type === "process");

    await RecipeProcess.deleteMany({ washRecipeId: id });
    if (processes.length > 0) {
      const processesToCreate = processes.map((process, index) => ({
        washRecipeId: id,
        laundryProcessId: process.laundryProcessId,
        recipeProcessType:
          process.processType || process.recipeProcessType || "",
        remark: process.remark || "",
        sequence: index + 1,
      }));
      const savedProcesses = await RecipeProcess.insertMany(processesToCreate);
      newProcessIds.push(...savedProcesses.map((p) => p._id));
    }

    if (recipeItemsToDelete.size > 0) {
      await RecipeItem.deleteMany({
        _id: { $in: Array.from(recipeItemsToDelete) },
      });
      await StepItem.deleteMany({
        recipeItemId: { $in: Array.from(recipeItemsToDelete) },
      });
    }

    await WashRecipe.findByIdAndUpdate(id, {
      steps: newStepIds,
      recipeProcessId: newProcessIds,
    });

    const updatedWashRecipe = await WashRecipe.findById(id)
      .populate({
        path: "orderId",
        select:
          "orderNo season style fabric fabricSupplier keyNo orderQty orderDate articleNo",
        populate: {
          path: "style",
          select: "name styleNo",
        },
      })
      .populate({
        path: "recipeProcessId",
        populate: {
          path: "laundryProcessId",
          select: "name recipeProcessType",
        },
      });

    res.status(200).json({
      message: "Wash recipe updated successfully.",
      washRecipe: updatedWashRecipe,
    });
  } catch (error) {
    console.error("Error updating wash recipe:", error);
    res
      .status(500)
      .json({ message: "Failed to update wash recipe.", error: error.message });
  }
};
