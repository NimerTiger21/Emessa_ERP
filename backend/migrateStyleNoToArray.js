require("dotenv").config();
const mongoose = require("mongoose");

// Replace with your actual MONGO_CLOUD_URI
const MONGO_URI = process.env.MONGO_CLOUD_URI || "your-mongodb-atlas-uri";

// Define a basic schema (you only need _id and styleNo)
const styleSchema = new mongoose.Schema({
  styleNo: mongoose.Schema.Types.Mixed, // Allow reading both String and Array
}, { strict: false }); // Ignore other fields

const Style = mongoose.model("Style", styleSchema);

async function migrateStyleNoToArray() {
  try {
    await mongoose.connect(process.env.MONGO_CLOUD_URI);
    console.log("Connected to MongoDB Atlas");

    const stylesToMigrate = await Style.find({ styleNo: { $type: "string" } });

    console.log(`Found ${stylesToMigrate.length} styles to migrate...`);

    for (const style of stylesToMigrate) {
      const original = style.styleNo;

      // Split by space or comma (trimmed and filtered)
      const newStyleNoArray = original
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (Array.isArray(newStyleNoArray) && newStyleNoArray.length > 0) {
        await Style.updateOne(
          { _id: style._id },
          { $set: { styleNo: newStyleNoArray } }
        );
        console.log(`✅ Updated style ${style._id} | "${original}" →`, newStyleNoArray);
      } else {
        console.warn(`⚠️ Skipped invalid styleNo for ${style._id}: "${original}"`);
      }
    }

    console.log("🎉 Migration complete.");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Migration error:", err);
    mongoose.disconnect();
  }
}

migrateStyleNoToArray();
