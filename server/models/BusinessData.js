import mongoose from "mongoose";

const businessDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["csv", "xlsx"],
      required: true,
    },
    columns: [
      {
        name: String,
        type: {
          type: String,
          enum: ["string", "number", "date", "boolean"],
        },
        mappedTo: {
          type: String,
          enum: [
            "revenue",
            "date",
            "customer_id",
            "product_id",
            "quantity",
            "price",
            "category",
            "other",
            "none",
          ],
        },
      },
    ],
    totalRows: {
      type: Number,
      required: true,
    },
    metadata: {
      dateRange: {
        start: Date,
        end: Date,
      },
      totalRevenue: Number,
      uniqueCustomers: Number,
      avgOrderValue: Number,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    processingError: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BusinessData", businessDataSchema);
