const WashRecipe = require("../models/WashRecipe");
const RecipeItem = require("../models/RecipeItem");
const RecipeProcess = require("../models/RecipeProcess");
const { default: mongoose } = require("mongoose");
const StepItem = require("../models/StepItem");
const ChemicalItem = require("../models/ChemicalItem");

exports.createWashRecipe = async (req, res) => {
  try {
    //const { orderId, date, washCode, washType, steps, recipeProcess, workspaceItems } = req.body;
    const { orderId, date, washCode, washType, workspaceItems } = req.body;
    const normalizedWashCode = washCode === "" ? null : washCode;

    // Get all indexes on the collection
    const indexes = await WashRecipe.collection.getIndexes();
    // Check if the index exists | // Ensure indexes is an object and check if the required index exists
    //const indexExists = indexes.some(index => index.name === 'washCode_1');
    const indexExists = Object.keys(indexes).some((indexName) => indexName === 'washCode_1');

    if (indexExists) {
      // Drop the index
      await WashRecipe.collection.dropIndex('washCode_1');
      console.log('washCode_1 Index dropped successfully.');
      //await WashRecipe.collection.createIndex({ washCode: 1 }, { unique: true, sparse: true });
    } else {
      console.log('Index washCode_1 does not exist.');
      //console.log("Index 'washCode_1' does not exist. Creating index...");
      //await WashRecipe.collection.createIndex({ washCode: 1 }, { unique: true, sparse: true });
      //console.log("Index washCode_1 created successfully.");
    }    

    // Validate and check for duplicates // Validate washCode for uniqueness // Validate uniqueness only if washCode is provided (not null)
    if (normalizedWashCode) {
    const existingRecipe = await WashRecipe.findOne({ washCode: normalizedWashCode});
    if (existingRecipe) {
      return res.status(400).json({ message: "Wash Code already exists." });
    }}

    // 1. Save the main WashRecipe | // Create WashRecipe // Create the wash recipe without steps or processes initially
    const washRecipe = new WashRecipe({ orderId, date, washCode: normalizedWashCode, washType });
    await washRecipe.save();

    /*
    // Update step sequences
    for (let i = 0; i < steps.length; i++) {
      await RecipeItem.findByIdAndUpdate(steps[i]._id, { sequence: i + 1 });
    }

    // Update process sequences
    for (let i = 0; i < recipeProcess.length; i++) {
      await RecipeProcess.findByIdAndUpdate(recipeProcess[i]._id, { sequence: i + 1 });
    }
*/

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

// await RecipeItem.insertMany(steps);
// await RecipeProcess.insertMany(processes);


//console.log("workspaceItems: ", workspaceItems);
/**
 * workspaceItems:  [
  {
    id: 'process-1737205909824',
    sequence: 44,
    remark: 'gg',
    laundryProcessId: '67707883bc8cce9ca3b7567b',
    processType: 'DRY PROCESS',
    name: 'MANUAL SCRAPING',
    type: 'process'
  },
  {
    id: 'step-1737206022461',
    stepId: '677103b98bbb3e4eee7780a6',
    stepName: 'حجر + انزيم Stone enzyme wash',
    type: 'step',
    time: 2,
    temp: 3,
    liters: 1,
    sequence: 1,
    chemicals: []
  }
]
 */

 // Validate that steps is an array
 if (!steps || !Array.isArray(steps)) {
  return res.status(400).json({ message: "Steps must be an array of RecipeItem IDs." });
}
const invalidStep = steps.find((step) => !mongoose.Types.ObjectId.isValid(step.stepId));
if (invalidStep) {
  return res.status(400).json({ message: `Invalid stepId in step sequence ${invalidStep.sequence}.` });
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

      // Update the wash recipe with the linked Recipe Items references
      //washRecipe.steps = savedRecipeItem.map((recipeitem) => recipeitem._id);
      //await washRecipe.save();

      // Update the wash recipe with the linked RecipeItem references
      // Instead of overwriting, push to the steps array
      //washRecipe.steps = savedRecipeItem;
      washRecipe.steps.push(savedRecipeItem._id); // Push the new RecipeItem ID into the array
      //await washRecipe.save();
      //console.log('Saving*** ', step?.chemicals?.length, ' ****chemicals');
      //console.log('Saving@@@ ', step?.chemicals, ' @@@chemicals');

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
    if (!processes.every((process) => isValidObjectId(process.laundryProcessId))) {
      return res.status(400).json({ message: "Invalid laundryProcessId detected." });
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

    res.status(201).json({ message: "Wash recipe created successfully.", washRecipe }); // steps: savedSteps * Optional: Send Updated IDs to the Frontend
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
      select: "orderNo season style fabric fabricSupplier keyNo orderQty orderDate articleNo",
      populate: {
        path: "style",
        select: "name styleNo", // ✅ Select desired style fields
      }
    }) // Populate order details
      .populate({
        path: "recipeProcessId", // Populate processes
        populate: {
          path: "laundryProcessId", // Populate laundry process inside processes
          select: "name recipeProcessType",
        },
      }).sort({ 'date': -1 }); // Change 'washCode' to the field you want to sort by and 1 for ascending, -1 for descending;

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

exports.getWashRecipeDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the main wash recipe
    const washRecipe = await WashRecipe.findById(id)    
    .populate({
      path: "orderId",
      select: "orderNo season style fabric fabricSupplier keyNo orderQty orderDate articleNo",
      populate: {
        path: "style",
        select: "name styleNo", // ✅ Select desired style fields
      }
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
    const stepItems = await StepItem.find({ recipeItemId: { $in: steps.map((step) => step._id) } })
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
    const combinedItems = [...steps, ...processes].sort((a, b) => a.sequence - b.sequence);

    res.status(200).json({
      washRecipe,
      steps,
      chemicalsByStep,
      processes,
      combinedItems, // Merged steps and processes
    });
  } catch (error) {
    console.error("Error fetching wash recipe details:", error);
    res.status(500).json({ message: "Error fetching wash recipe details.", error });
  }
};

// controllers/washRecipeController.js

exports.deleteWashRecipe  = async (req, res) => {
  try {
    const { id } = req.params;

    const washRecipe = await WashRecipe.findById(id);
    if (!washRecipe) {
      return res.status(404).json({ message: "Wash recipe not found." });
    }

    // 1. Delete all step items (chemicals) linked to steps
    const recipeItemIds = washRecipe.steps || [];
    const recipeProcessIds = washRecipe.recipeProcessId || [];

    const stepItems = await StepItem.find({ recipeItemId: { $in: recipeItemIds } });
    const stepItemIds = stepItems.map(item => item._id);

    // Delete chemicals
    await StepItem.deleteMany({ _id: { $in: stepItemIds } });

    // Delete steps
    await RecipeItem.deleteMany({ _id: { $in: recipeItemIds } });

    // Delete processes
    await RecipeProcess.deleteMany({ _id: { $in: recipeProcessIds } });

    // 2. Delete the wash recipe
    await WashRecipe.findByIdAndDelete(id);

    res.status(200).json({ message: "Wash recipe and related data deleted successfully." });
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
        _id: { $ne: id }
      });
      if (existingRecipe) {
        return res.status(400).json({ message: "Wash Code already exists." });
      }
    }

    const existingRecipeItems = await RecipeItem.find({ washRecipeId: id });
    const existingRecipeItemMap = new Map();
    existingRecipeItems.forEach(item => {
      existingRecipeItemMap.set(item._id.toString(), item);
    });

    const existingStepItems = await StepItem.find({ 
      recipeItemId: { $in: existingRecipeItems.map(item => item._id) } 
    });

    const existingChemicalsByRecipeItem = new Map();
    existingStepItems.forEach(chemical => {
      const recipeItemId = chemical.recipeItemId.toString();
      if (!existingChemicalsByRecipeItem.has(recipeItemId)) {
        existingChemicalsByRecipeItem.set(recipeItemId, new Map());
      }
      existingChemicalsByRecipeItem
        .get(recipeItemId)
        .set(chemical.chemicalItemId.toString(), chemical);
    });

    await WashRecipe.findByIdAndUpdate(id, { 
      orderId, date, washCode: normalizedWashCode, washType
    });

    const newStepIds = [];
    const newProcessIds = [];
    const recipeItemsToDelete = new Set(existingRecipeItems.map(item => item._id.toString()));

    const steps = workspaceItems.filter(item => item.type === "step");

    for (const step of steps) {
      let recipeItem;
      const isExisting = step._id && existingRecipeItemMap.has(step._id.toString());

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
          sequence: step.sequence
        });
        await recipeItem.save();
      }

      newStepIds.push(recipeItem._id);

      const existingChemicalsMap = existingChemicalsByRecipeItem.get(recipeItem._id.toString()) || new Map();
      const updatedChemicalItemIds = new Set();

      const submittedChemicals = Array.isArray(step.chemicals) ? step.chemicals : [];

      for (const chemical of submittedChemicals) {
        if (!chemical.chemicalItemId || !mongoose.Types.ObjectId.isValid(chemical.chemicalItemId)) {
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
            unit: chemical.unit || ""
          });
          await newChemical.save();
        }
      }

      for (const [existingChemId, existingChemObj] of existingChemicalsMap.entries()) {
        if (!updatedChemicalItemIds.has(existingChemId)) {
          await StepItem.findByIdAndDelete(existingChemObj._id);
        }
      }
    }

    const processes = workspaceItems.filter(item => item.type === "process");

    await RecipeProcess.deleteMany({ washRecipeId: id });
    if (processes.length > 0) {
      const processesToCreate = processes.map((process, index) => ({
        washRecipeId: id,
        laundryProcessId: process.laundryProcessId,
        recipeProcessType: process.processType || process.recipeProcessType || "",
        remark: process.remark || "",
        sequence: index + 1
      }));
      const savedProcesses = await RecipeProcess.insertMany(processesToCreate);
      newProcessIds.push(...savedProcesses.map(p => p._id));
    }

    if (recipeItemsToDelete.size > 0) {
      await RecipeItem.deleteMany({ _id: { $in: Array.from(recipeItemsToDelete) } });
      await StepItem.deleteMany({ recipeItemId: { $in: Array.from(recipeItemsToDelete) } });
    }

    await WashRecipe.findByIdAndUpdate(id, {
      steps: newStepIds,
      recipeProcessId: newProcessIds
    });

    const updatedWashRecipe = await WashRecipe.findById(id)
      .populate({
        path: "orderId",
        select: "orderNo season style fabric fabricSupplier keyNo orderQty orderDate articleNo",
        populate: {
          path: "style",
          select: "name styleNo"
        }
      })
      .populate({
        path: "recipeProcessId",
        populate: {
          path: "laundryProcessId",
          select: "name recipeProcessType"
        }
      });

    res.status(200).json({ message: "Wash recipe updated successfully.", washRecipe: updatedWashRecipe });
  } catch (error) {
    console.error("Error updating wash recipe:", error);
    res.status(500).json({ message: "Failed to update wash recipe.", error: error.message });
  }
};
//   try {
//     const { id } = req.params;
//     const { orderId, date, washCode, washType, workspaceItems } = req.body;
//     const normalizedWashCode = washCode === "" ? null : washCode;

//     // Find the wash recipe to update
//     const washRecipe = await WashRecipe.findById(id);
//     if (!washRecipe) {
//       return res.status(404).json({ message: "Wash recipe not found." });
//     }

//     // Check if the wash code is unique (if provided and changed)
//     if (normalizedWashCode && normalizedWashCode !== washRecipe.washCode) {
//       const existingRecipe = await WashRecipe.findOne({ 
//         washCode: normalizedWashCode,
//         _id: { $ne: id } // Exclude current recipe
//       });
      
//       if (existingRecipe) {
//         return res.status(400).json({ message: "Wash Code already exists." });
//       }
//     }

//     // Get existing recipe items and build a map for quick lookup
//     const existingRecipeItems = await RecipeItem.find({ washRecipeId: id });
//     const existingRecipeItemMap = new Map();
    
//     // Map recipe items by their ID for easy lookup
//     existingRecipeItems.forEach(item => {
//       existingRecipeItemMap.set(item._id.toString(), item);
//     });

//     // Get existing chemicals and build a map for quick lookup
//     const existingStepItems = await StepItem.find({ 
//       recipeItemId: { $in: existingRecipeItems.map(item => item._id) } 
//     });
    
//     // Group chemicals by recipe item ID
//     const existingChemicalsByRecipeItem = new Map();
//     existingStepItems.forEach(chemical => {
//       const recipeItemId = chemical.recipeItemId.toString();
//       if (!existingChemicalsByRecipeItem.has(recipeItemId)) {
//         existingChemicalsByRecipeItem.set(recipeItemId, []);
//       }
//       existingChemicalsByRecipeItem.get(recipeItemId).push(chemical);
//     });

//     // Update the wash recipe document
//     await WashRecipe.findByIdAndUpdate(
//       id,
//       { 
//         orderId, 
//         date, 
//         washCode: normalizedWashCode, 
//         washType,
//         // Don't clear references yet
//       }
//     );

//     // Keep track of new step IDs and process IDs
//     const newStepIds = [];
//     const newProcessIds = [];
    
//     // Keep track of recipe items to delete after processing
//     const recipeItemsToDelete = new Set(existingRecipeItems.map(item => item._id.toString()));
    
//     // IMPORTANT FIX: We need to track ALL chemicals that should be KEPT
//     // Any chemical not explicitly kept will be deleted
//     const chemicalsToKeep = new Set();
    
//     // Process steps from workspace items
//     const steps = workspaceItems
//       .filter(item => item.type === "step")
//       .map((item, index) => ({
//         id: item.id,
//         _id: item._id,
//         stepId: typeof item.stepId === 'object' ? item.stepId._id : item.stepId,
//         stepName: item.stepName,
//         time: item.time || 0,
//         temp: item.temp || 0,
//         liters: item.liters || 0,
//         sequence: index + 1, // Ensure proper sequencing
//         chemicals: item.chemicals || []
//       }));

//     // Process each step
//     for (const step of steps) {
//       let recipeItem;
//       let isNewRecipeItem = true;
      
//       // Check if this is an existing step with a backend ID
//       if (step._id && existingRecipeItemMap.has(step._id.toString())) {
//         // This is an existing step - update it
//         recipeItem = existingRecipeItemMap.get(step._id.toString());
//         recipeItemsToDelete.delete(step._id.toString()); // Don't delete this one
        
//         // Update the recipe item
//         recipeItem.stepId = step.stepId;
//         recipeItem.time = step.time;
//         recipeItem.temp = step.temp;
//         recipeItem.liters = step.liters;
//         recipeItem.sequence = step.sequence;
        
//         await recipeItem.save();
//         isNewRecipeItem = false;
//       } else {
//         // This is a new step - create it
//         recipeItem = new RecipeItem({
//           washRecipeId: id,
//           stepId: step.stepId,
//           time: step.time,
//           temp: step.temp,
//           liters: step.liters,
//           sequence: step.sequence
//         });
        
//         await recipeItem.save();
//       }
      
//       newStepIds.push(recipeItem._id);
      
//       // Handle chemicals for this step
//       if (step.chemicals && step.chemicals.length > 0) {
//         // Get existing chemicals for this recipe item
//         const existingChemicals = !isNewRecipeItem && existingChemicalsByRecipeItem.has(recipeItem._id.toString()) 
//           ? existingChemicalsByRecipeItem.get(recipeItem._id.toString()) 
//           : [];
          
//         // Create a map of existing chemicals by chemical item ID for quicker lookup
//         const existingChemicalsMap = new Map();
//         existingChemicals.forEach(chem => {
//           // Create a unique key that includes both chemical ID and chemical item ID
//           const chemId = chem.chemicalItemId.toString();
//           existingChemicalsMap.set(chemId, chem);
//         });
        
//         // Process each chemical
//         for (const chemical of step.chemicals) {
//           // Skip invalid chemicals
//           if (!chemical.chemicalItemId || !mongoose.Types.ObjectId.isValid(chemical.chemicalItemId)) {
//             continue;
//           }
          
//           const chemicalItemId = chemical.chemicalItemId.toString();
          
//           // Check if this chemical already exists for this recipe item
//           if (!isNewRecipeItem && existingChemicalsMap.has(chemicalItemId)) {
//             // Update existing chemical
//             const existingChemical = existingChemicalsMap.get(chemicalItemId);
//             chemicalsToKeep.add(existingChemical._id.toString());
            
//             // Update the chemical properties
//             existingChemical.quantity = chemical.quantity || 0;
//             existingChemical.unit = chemical.unit || "";
//             await existingChemical.save();
//           } else {
//             // Create new chemical
//             const newChemical = new StepItem({
//               recipeItemId: recipeItem._id,
//               chemicalItemId,
//               quantity: chemical.quantity || 0,
//               unit: chemical.unit || ""
//             });
            
//             const savedChemical = await newChemical.save();
//             chemicalsToKeep.add(savedChemical._id.toString());
//           }
//         }
//       }
      
//       // NOTE: We've removed the else block that was keeping all chemicals
//       // by default, even if they were removed in the frontend
//     }
    
//     // Process processes from workspace items
//     const processes = workspaceItems
//       .filter(item => item.type === "process")
//       .map((item, index) => ({
//         laundryProcessId: item.laundryProcessId,
//         recipeProcessType: item.processType || item.recipeProcessType || "",
//         remark: item.remark || "",
//         sequence: index + 1 // Ensure proper sequencing
//       }));
    
//     // Delete existing processes and create new ones
//     // (Processes are simpler and don't need the same careful handling as steps with chemicals)
//     await RecipeProcess.deleteMany({ washRecipeId: id });
    
//     if (processes.length > 0) {
//       const processesToCreate = processes.map(process => ({
//         washRecipeId: id,
//         laundryProcessId: process.laundryProcessId,
//         recipeProcessType: process.recipeProcessType,
//         remark: process.remark,
//         sequence: process.sequence
//       }));
      
//       const savedProcesses = await RecipeProcess.insertMany(processesToCreate);
//       newProcessIds.push(...savedProcesses.map(proc => proc._id));
//     }
    
//     // Delete recipe items that weren't in the update
//     if (recipeItemsToDelete.size > 0) {
//       await RecipeItem.deleteMany({ 
//         _id: { $in: Array.from(recipeItemsToDelete) } 
//       });
      
//       // Delete chemicals associated with deleted recipe items
//       // This is necessary to avoid orphaned chemicals
//       await StepItem.deleteMany({
//         recipeItemId: { $in: Array.from(recipeItemsToDelete) }
//       });
//     }
    
//     // IMPORTANT FIX: Delete all chemicals NOT explicitly marked for keeping
//     // Get all existing chemical IDs
//     const allExistingChemicalIds = existingStepItems.map(chem => chem._id.toString());
//     // Filter to get chemicals to delete
//     const chemicalsToDelete = allExistingChemicalIds.filter(
//       id => !chemicalsToKeep.has(id)
//     );
    
//     if (chemicalsToDelete.length > 0) {
//       await StepItem.deleteMany({ 
//         _id: { $in: chemicalsToDelete } 
//       });
//     }
    
//     // Update wash recipe with new references
//     await WashRecipe.findByIdAndUpdate(id, {
//       steps: newStepIds,
//       recipeProcessId: newProcessIds
//     });
    
//     // Fetch the updated wash recipe for response
//     const updatedWashRecipe = await WashRecipe.findById(id)
//       .populate({
//         path: "orderId",
//         select: "orderNo season style fabric fabricSupplier keyNo orderQty orderDate articleNo",
//         populate: {
//           path: "style",
//           select: "name styleNo",
//         }
//       })
//       .populate({
//         path: "recipeProcessId",
//         populate: {
//           path: "laundryProcessId",
//           select: "name recipeProcessType",
//         },
//       });
    
//     res.status(200).json({ 
//       message: "Wash recipe updated successfully.",
//       washRecipe: updatedWashRecipe
//     });
    
//   } catch (error) {
//     console.error("Error updating wash recipe:", error);
//     res.status(500).json({ 
//       message: "Failed to update wash recipe.", 
//       error: error.message 
//     });
//   }
// };