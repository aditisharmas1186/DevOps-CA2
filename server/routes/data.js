import express from "express";
import multer from "multer";
import csv from "csv-parser";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { auth } from "../middleware/auth.js";
import BusinessData from "../models/BusinessData.js";
import DataRecord from "../models/DataRecord.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".csv", ".xlsx", ".xls"];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV and Excel files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload and analyze data file
router.post("/upload", auth, upload.single("dataFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, filename, path: filePath } = req.file;
    const fileExt = path.extname(originalname).toLowerCase();

    let data = [];
    let columns = [];

    try {
      if (fileExt === ".csv") {
        // Parse CSV file
        const results = [];
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => results.push(row))
            .on("end", () => {
              data = results;
              if (data.length > 0) {
                columns = Object.keys(data[0]).map((col) => ({
                  name: col,
                  type: detectColumnType(
                    data.map((row) => row[col]).slice(0, 100)
                  ),
                  mappedTo: suggestMapping(col),
                }));
              }
              resolve();
            })
            .on("error", reject);
        });
      } else {
        // Parse Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length > 0) {
          columns = Object.keys(data[0]).map((col) => ({
            name: col,
            type: detectColumnType(data.map((row) => row[col]).slice(0, 100)),
            mappedTo: suggestMapping(col),
          }));
        }
      }

      // Save business data metadata
      const businessData = new BusinessData({
        userId: req.userId,
        fileName: originalname,
        fileType: fileExt.substring(1),
        columns,
        totalRows: data.length,
        metadata: await calculateMetadata(data, columns),
      });

      await businessData.save();

      function suggestMapping(columnName) {
        const normalized = columnName.toLowerCase().replace(/[^a-z0-9]/g, "_");

        // Date fields
        if (/date|time|when|timestamp|created|updated/i.test(columnName))
          return "date";

        // Revenue/monetary fields
        if (/revenue|sales|amount|price|cost|value|total/i.test(columnName))
          return "revenue";

        // Customer fields
        if (/customer|client|user|account/i.test(columnName))
          return "customer_id";

        // Product fields
        if (/product|item|sku|service/i.test(columnName)) return "product_id";

        // Quantity fields
        if (/quantity|qty|count|units|number/i.test(columnName))
          return "quantity";

        // Category/Type fields
        if (/category|type|segment|department|group/i.test(columnName))
          return "category";

        // Status fields
        if (/status|state|condition/i.test(columnName)) return "status";

        return "none";
      }

      // Process and save data records (in batches for large files)
      const batchSize = 1000;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const records = batch.map((row) => ({
          userId: req.userId,
          businessDataId: businessData._id,
          data: row,
          processedData: processRowData(row, columns),
        }));

        await DataRecord.insertMany(records);
      }

      // Mark as processed
      businessData.isProcessed = true;
      await businessData.save();

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        message: "File uploaded and processed successfully",
        businessData,
        preview: data.slice(0, 10), // Return first 10 rows as preview
      });
    } catch (parseError) {
      console.error("File parsing error:", parseError);

      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.status(400).json({
        message: "Error parsing file",
        error: parseError.message,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: "Server error during file upload" });
  }
});

// Get user's uploaded datasets
router.get("/datasets", auth, async (req, res) => {
  try {
    const datasets = await BusinessData.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.json({ datasets });
  } catch (error) {
    console.error("Get datasets error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update column mappings
router.put("/datasets/:id/mappings", auth, async (req, res) => {
  try {
    const { mappings } = req.body;

    const businessData = await BusinessData.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!businessData) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    // Update column mappings
    businessData.columns = businessData.columns.map((col) => ({
      ...col,
      mappedTo: mappings[col.name] || col.mappedTo,
    }));

    await businessData.save();

    // Reprocess data records with new mappings
    const dataRecords = await DataRecord.find({
      businessDataId: businessData._id,
    });

    for (const record of dataRecords) {
      record.processedData = processRowData(record.data, businessData.columns);
      await record.save();
    }

    res.json({
      message: "Column mappings updated successfully",
      businessData,
    });
  } catch (error) {
    console.error("Update mappings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper functions
function detectColumnType(values) {
  // Skip empty values
  const nonEmptyValues = values.filter(
    (v) => v !== null && v !== undefined && v !== ""
  );
  if (nonEmptyValues.length === 0) return "string";

  // Check for dates
  const potentialDates = nonEmptyValues.slice(0, 5).map((v) => new Date(v));
  if (potentialDates.every((d) => !isNaN(d.getTime()))) return "date";

  // Check for numbers
  if (nonEmptyValues.every((v) => !isNaN(parseFloat(v)))) return "number";

  // Check if all values are true/false/yes/no
  const normalizedValues = nonEmptyValues.map((v) => String(v).toLowerCase());
  if (
    normalizedValues.every((v) =>
      ["true", "false", "yes", "no", "0", "1"].includes(v)
    )
  )
    return "boolean";

  // Default to string
  return "string";
}

function suggestMapping(columnName) {
  const name = columnName.toLowerCase();

  if (
    name.includes("revenue") ||
    name.includes("sales") ||
    name.includes("amount") ||
    name.includes("total")
  ) {
    return "revenue";
  }
  if (
    name.includes("date") ||
    name.includes("time") ||
    name.includes("created")
  ) {
    return "date";
  }
  if (
    name.includes("customer") ||
    name.includes("user") ||
    name.includes("client")
  ) {
    return "customer_id";
  }
  if (name.includes("product") || name.includes("item")) {
    return "product_id";
  }
  if (
    name.includes("quantity") ||
    name.includes("qty") ||
    name.includes("count")
  ) {
    return "quantity";
  }
  if (name.includes("price") || name.includes("cost")) {
    return "price";
  }
  if (
    name.includes("category") ||
    name.includes("type") ||
    name.includes("segment")
  ) {
    return "category";
  }

  return "other";
}

function processRowData(row, columns) {
  const processed = {
    revenue: 0,
    date: null,
    customerId: "",
    productId: "",
    quantity: 0,
    price: 0,
    category: "",
  };

  columns.forEach((col) => {
    const value = row[col.name];
    if (!value || value === "") return;

    switch (col.mappedTo) {
      case "revenue":
      case "price":
      case "quantity":
        processed[col.mappedTo] = parseFloat(value) || 0;
        break;
      case "date":
        const parsedDate = new Date(value);
        processed.date = !isNaN(parsedDate.getTime()) ? parsedDate : null;
        break;
      case "customer_id":
        processed.customerId = String(value || "");
        break;
      case "product_id":
        processed.productId = String(value || "");
        break;
      case "category":
        processed.category = String(value || "");
        break;
    }
  });

  return processed;
}

async function calculateMetadata(data, columns) {
  const metadata = {};

  // Find date column
  const dateColumn = columns.find((col) => col.mappedTo === "date");
  if (dateColumn) {
    const dates = data
      .map((row) => new Date(row[dateColumn.name]))
      .filter((date) => !isNaN(date));

    if (dates.length > 0) {
      metadata.dateRange = {
        start: new Date(Math.min(...dates)),
        end: new Date(Math.max(...dates)),
      };
    }
  }

  // Calculate revenue metrics
  const revenueColumn = columns.find((col) => col.mappedTo === "revenue");
  if (revenueColumn) {
    const revenues = data.map(
      (row) => parseFloat(row[revenueColumn.name]) || 0
    );
    metadata.totalRevenue = revenues.reduce((sum, val) => sum + val, 0);
    metadata.avgOrderValue = metadata.totalRevenue / data.length;
  }

  // Count unique customers
  const customerColumn = columns.find((col) => col.mappedTo === "customer_id");
  if (customerColumn) {
    const uniqueCustomers = new Set(
      data.map((row) => row[customerColumn.name])
    );
    metadata.uniqueCustomers = uniqueCustomers.size;
  }

  return metadata;
}

export default router;
