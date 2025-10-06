import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    metrics: {
      totalRevenue: {
        type: Number,
        default: 0,
      },
      totalOrders: {
        type: Number,
        default: 0,
      },
      uniqueCustomers: {
        type: Number,
        default: 0,
      },
      avgOrderValue: {
        type: Number,
        default: 0,
      },
      newCustomers: {
        type: Number,
        default: 0,
      },
      returningCustomers: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
      },
      churnRate: {
        type: Number,
        default: 0,
      },
    },
    growth: {
      revenueGrowth: Number,
      customerGrowth: Number,
      orderGrowth: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
analyticsSchema.index({ userId: 1, period: 1, date: 1 }, { unique: true });
analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ userId: 1, "metrics.totalRevenue": -1 });
analyticsSchema.index({ userId: 1, period: 1, "metrics.totalRevenue": -1 });
analyticsSchema.index({ userId: 1, "metrics.uniqueCustomers": -1 });

export default mongoose.model("Analytics", analyticsSchema);
