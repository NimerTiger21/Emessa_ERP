// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/connectToDb");
const defectRoutes = require("./routes/defectRoutes");
const analyticsRoutes = require("./routes/defectAnalyticsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const washRoutes = require("./routes/washRoutes");
const laundryStepRoutes = require("./routes/laundryStepRoutes");
const laundryProcessRoutes = require("./routes/laundryProcessRoutes");
const chemicalItemRoutes = require("./routes/chemicalItemRoutes");
const stepItemRoutes = require("./routes/stepItemRoutes");

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:3000', // Your frontend URL
//   credentials: true
// }));
app.use(express.json());
// app.use(cookieParser()); // Uncomment if cookies are required

// Connect to the database
connectDB();

// API Routes
app.use("/api/defects", defectRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/wash-recipes", washRoutes);
// Laundry Step Routes
app.use("/api/laundry-steps", laundryStepRoutes);
app.use("/api/laundry-processes", laundryProcessRoutes);
app.use("/api/chemical-items", chemicalItemRoutes);
app.use("/api/step-items", stepItemRoutes);
app.use("/api/master-data", require("./routes/masterDataRoutes"));

// Serve static files (e.g., uploads)
app.use("/uploads", express.static("uploads"));

// Basic health check route
app.get("/", (req, res) => {
  res.send("Defect Management API is running.");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
