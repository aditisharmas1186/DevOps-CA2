import mongoose from "mongoose";

const dataRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessData",
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    processedData: {
      revenue: Number,
      date: { type: Date, required: false },
      customerId: String,
      productId: String,
      quantity: Number,
      price: Number,
      category: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
dataRecordSchema.index({ userId: 1, "processedData.date": 1 });
dataRecordSchema.index({ userId: 1, businessDataId: 1 });

export default mongoose.model("DataRecord", dataRecordSchema);
