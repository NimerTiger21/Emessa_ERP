import mongoose from "mongoose";
import dotenv from "dotenv";
import Fabric from "./models/order/Fabric.js";
import Style from "./models/order/Style.js";
import CustomAccount from "./models/order/CustomAccount.js";
import CompositionItem from "./models/order/CompositionItem.js";
import Brand from "./models/order/Brand.js";

dotenv.config(); // Load environment variables

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB for seeding"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

async function seedDatabase() {
  try {
    // 🔥 **Clear existing data** (optional for fresh seeding)
    //await Fabric.deleteMany();
    //await Style.deleteMany();
    //await CustomAccount.deleteMany();
    //await CompositionItem.deleteMany(); // Clear existing CompositionItems
    //await Brand.deleteMany(); // Clear existing brands if any
    console.log("🧹 Old records cleared");
/*
    // 1️⃣ **Seed Customers**
    const customers = await CustomAccount.insertMany([
      { type: "Customer", code: "CUST001", name: "BRAX", address: "Germany", contactEmail: "brax@example.com" },
      { type: "Customer", code: "CUST002", name: "CAMEL ACTIVE", address: "France", contactEmail: "camel@example.com" },
      { type: "Customer", code: "CUST003", name: "GERRY WEBER", address: "Italy", contactEmail: "gerry@example.com" },
      { type: "Customer", code: "CUST004", name: "JEAN CARRIERE", address: "Spain", contactEmail: "jean@example.com" },
      { type: "Customer", code: "CUST005", name: "MARC O’POLO", address: "UK", contactEmail: "marc@example.com" },
      
      { type: "Customer", code: "CUST006", name: "BETTY BARCLAY", address: "UK", contactEmail: "betty@example.com" },
      { type: "Customer", code: "CUST007", name: "FUSSL", address: "USA", contactEmail: "fussl@example.com" },
      { type: "Customer", code: "CUST008", name: "FIVE FELLAS", address: "USA", contactEmail: "five@example.com" },
    ]);

    // 2️⃣ **Seed Fabric Suppliers & Retrieve Inserted IDs**
    const supplierData = [
      //{ type: "Supplier", code: "S001", name: "Sharabati", address: "Turkey", contactEmail: "sharabati@example.com" },
      //{ type: "Supplier", code: "S002", name: "DNM", address: "Italy", contactEmail: "dnm@example.com" },
      //{ type: "Supplier", code: "S003", name: "CALIK", address: "Spain", contactEmail: "calik@example.com" },
      
      { type: "Supplier", code: "S004", name: "Berto", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S005", name: "Blue Point Textile", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S006", name: "BOSSA", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S007", name: "Candiani", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S008", name: "Coats", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S009", name: "Copen Tunisia", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S010", name: "Freudenberg", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S011", name: "Guldogan", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S012", name: "Horizon", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S013", name: "Kipas", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S014", name: "Maritas Denim", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S015", name: "NH", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S016", name: "Niggeler & Kupfer", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S017", name: "ORTA", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S018", name: "QST", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S019", name: "Realteks", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S020", name: "RESEARCHES", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S021", name: "ROYO", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S022", name: "Tenowo", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S023", name: "TUSA", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S024", name: "Velcorex (SAIC)", address: "Spain", contactEmail: "calik@example.com" },
      { type: "Supplier", code: "S025", name: "Zy.Tex", address: "Spain", contactEmail: "calik@example.com" },
    ];
    const suppliers = await CustomAccount.insertMany(supplierData);
    // const supplierMap = suppliers.reduce((acc, supplier) => {
    //   acc[supplier.code] = supplier._id; // Map supplier code to ObjectId
    //   return acc;
    // }, {});

    // 3️⃣ **Seed Styles**
    await Style.insertMany([
      { name: "Cadiz" },
      { name: "Caren New" },
      { name: "Carola" },
      { name: "Chuck" },
      { name: "Lavina Joy" },
      { name: "Lora" },
      { name: "Luke" },
    ]);

    // 4️⃣ **Seed Fabrics (Ensuring Supplier References Are Set)**
    await Fabric.insertMany([
      { code: "F001", name: "Denim Blue", color: "Blue", supplier: supplierMap["S001"] },
      { code: "F002", name: "Cotton White", color: "White", supplier: supplierMap["S002"] },
      { code: "F003", name: "Linen Gray", color: "Gray", supplier: supplierMap["S003"] },
    ]);
    // 5️⃣ **Seed Composition Items**
    const compositionItems = await CompositionItem.insertMany([
      { name: 'Cotton', abbrPrefix: 'C' },
      { name: 'Polyester', abbrPrefix: 'P' },
      { name: 'Wool', abbrPrefix: 'W' },
      { name: 'Silk', abbrPrefix: 'S' },
      { name: 'Nylon', abbrPrefix: 'N' }
    ]);*/
    // 1️⃣ **Seed Brands**
    /*const brands = await Brand.insertMany([
      { name: "HAKA", customer: "679c1b99ca355f3aacfc3dc8" }, // Link to BRAX
      { name: "RAPHAELA", customer: "679c1b99ca355f3aacfc3dc8" }, 
      { name: "Eurex", customer: "679c1b99ca355f3aacfc3dc8" }, 
      { name: "DOB", customer: "679c1b99ca355f3aacfc3dc8" },
      
      { name: "MOPD Women", customer: "679c1b99ca355f3aacfc3dcc" },
      { name: "MOPD Men", customer: "679c1b99ca355f3aacfc3dcc" },
      { name: "MOP Casual Men", customer: "679c1b99ca355f3aacfc3dcc" },
      { name: "MOP Casual Women", customer: "679c1b99ca355f3aacfc3dcc" },
      { name: "MOPD Women Tops", customer: "679c1b99ca355f3aacfc3dcc" },
      
      { name: "CAMEL ACTIVE", customer: "679c1b99ca355f3aacfc3dc9" },
      { name: "GERRY WEBER", customer: "679c1b99ca355f3aacfc3dca" },
      { name: "BETTY BARCLAY", customer: "67a356e887dcfbfa5123b13f" },
      { name: "JEAN CARRIERE", customer: "67a356e887dcfbfa5123b140" },
      { name: "FIVE FELLAS", customer: "67a356e887dcfbfa5123b141" }
    ]);*/

    console.log("✅ Database successfully seeded!");
    mongoose.connection.close(); // Close connection after seeding
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    mongoose.connection.close();
  }
}

// Run the seeding function
seedDatabase();
