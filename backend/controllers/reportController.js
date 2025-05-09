const Defect = require("../models/Defect");

exports.getDefectTrends = async (req, res) => {
  try {
    // const trends = await Defect.aggregate([
    //   {
    //     $group: {
    //       _id: {
    //         year: { $year: "$detectedDate" }, // Include year to prevent cross-year grouping
    //         month: { $month: "$detectedDate" }, // Extract month (1-12)
    //         severity: "$severity",
    //       }, // Group by month and severity
    //       total: { $sum: 1 }, // Count the number of defects
    //     },
    //   },
    //   {
    //     $sort: {
    //       "_id.year": 1,
    //       "_id.month": 1, // Sort by year then month
    //     }, // Sort by month
    //   },
    // ]);
    //console.log("Trends Data:", trends); // Debugging: Log data

    
    const trends = await Defect.aggregate([
      {
        $addFields: {
          detectedMonth: { $month: "$detectedDate" }, // Extract month number (1-12)
          detectedYear: { $year: "$detectedDate" }  // Extract year
        }
      },
      {
        $group: {
          _id: {
            month: "$detectedMonth", // Use extracted month number
            year: "$detectedYear",  // Use extracted year
            severity: "$severity",
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0, // Exclude default _id
          monthNumber: "$_id.month",  // Keep month number for sorting
          month: {  // Convert month number to name
            $let: {
              vars: {
                months: [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ]
              },
              in: { $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }] }
            }
          },
          year: "$_id.year",
          severity: "$_id.severity",
          total: 1,
        },
      },
      {
        $sort: { year: 1, monthNumber: 1 },  // Sort by year and month
      },
      {
        $project: {
          _id: 0,  // Exclude default _id
          name: { $concat: ["$month", " (", "$severity", ")"] },  // Create "Month (Severity)" string
          total: 1
        }
      }
    ]);
    console.log("Trends Data:", trends); // Debugging: Log data
    res.status(200).json(trends);
  } catch (error) {
    console.error("Error fetching defect trends:", error);
    res.status(500).json({ message: "Error fetching defect trends" });
  }
};
