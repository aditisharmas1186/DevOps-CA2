import express from "express";
import { auth } from "../middleware/auth.js";
import Analytics from "../models/Analytics.js";
import DataRecord from "../models/DataRecord.js";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";

const router = express.Router();

function calculateGrowthRate(current, previous) {
  if (!previous || previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
}

// Helper function to calculate metrics
async function calculateMetrics(records = [], previousPeriodRecords = []) {
  const metrics = {
    totalRevenue: 0,
    totalOrders: records.length,
    uniqueCustomers: new Set(),
    topProducts: {},
    topCategories: {},
    timeDistribution: {},
    yearlyComparison: {},
    customerRetention: {
      total: 0,
      returning: 0,
      new: 0,
      rate: 0,
    },
    performance: {
      conversionRate: 0,
      avgOrderValue: 0,
      revenuePerCustomer: 0,
      orderFrequency: 0,
      churnRate: 0,
    },
    growth: {
      revenue: 0,
      customers: 0,
      orders: 0,
      avgOrderValue: 0,
    },
    trends: {
      daily: {},
      weekly: {},
      monthly: {},
    },
  };

  // Initialize and calculate previous period metrics
  const previousMetrics = {
    totalRevenue: 0,
    totalOrders: 0,
    uniqueCustomers: new Set(),
  };

  // Process previous period records if available
  previousPeriodRecords.forEach((record) => {
    const data = record.processedData;
    previousMetrics.totalRevenue += data.revenue || 0;
    previousMetrics.totalOrders++;
    if (data.customerId) {
      previousMetrics.uniqueCustomers.add(data.customerId);
    }
  });

  records.forEach((record) => {
    const data = record.processedData;

    // Revenue and order calculations
    if (data.revenue) {
      metrics.totalRevenue += data.revenue;
    }

    // Customer tracking and retention
    if (data.customerId) {
      metrics.uniqueCustomers.add(data.customerId);

      // Check if customer existed in previous period
      if (
        previousPeriodRecords.some(
          (pr) => pr.processedData.customerId === data.customerId
        )
      ) {
        metrics.customerRetention.returning++;
      } else {
        metrics.customerRetention.new++;
      }
    }

    // Product analytics with detailed metrics
    if (data.productId) {
      if (!metrics.topProducts[data.productId]) {
        metrics.topProducts[data.productId] = {
          revenue: 0,
          orders: 0,
          quantity: 0,
        };
      }
      metrics.topProducts[data.productId].revenue += data.revenue || 0;
      metrics.topProducts[data.productId].orders++;
      metrics.topProducts[data.productId].quantity += data.quantity || 1;
    }

    // Category analytics with performance metrics
    if (data.category) {
      if (!metrics.topCategories[data.category]) {
        metrics.topCategories[data.category] = {
          revenue: 0,
          orders: 0,
          avgOrderValue: 0,
          percentageOfTotal: 0,
        };
      }
      metrics.topCategories[data.category].revenue += data.revenue || 0;
      metrics.topCategories[data.category].orders++;
    }

    // Time-based analytics
    if (data.date) {
      const dateObj = new Date(data.date);
      const dateKey = dateObj.toISOString().split("T")[0];
      const yearKey = dateObj.getFullYear().toString();

      // Daily distribution
      metrics.timeDistribution[dateKey] =
        (metrics.timeDistribution[dateKey] || 0) + (data.revenue || 0);

      // Yearly comparison
      if (!metrics.yearlyComparison[yearKey]) {
        metrics.yearlyComparison[yearKey] = {
          revenue: 0,
          orders: 0,
          customers: new Set(),
          products: new Set(),
          categories: new Set(),
        };
      }

      metrics.yearlyComparison[yearKey].revenue += data.revenue || 0;
      metrics.yearlyComparison[yearKey].orders++;
      if (data.customerId)
        metrics.yearlyComparison[yearKey].customers.add(data.customerId);
      if (data.productId)
        metrics.yearlyComparison[yearKey].products.add(data.productId);
      if (data.category)
        metrics.yearlyComparison[yearKey].categories.add(data.category);
    }
  });

  // Convert Set to number for uniqueCustomers
  const uniqueCustomersCount = metrics.uniqueCustomers.size;
  metrics.uniqueCustomers = uniqueCustomersCount;

  // Calculate performance metrics
  metrics.performance.avgOrderValue = metrics.totalOrders
    ? metrics.totalRevenue / metrics.totalOrders
    : 0;
  metrics.performance.revenuePerCustomer = uniqueCustomersCount
    ? metrics.totalRevenue / uniqueCustomersCount
    : 0;
  metrics.performance.conversionRate = uniqueCustomersCount
    ? (metrics.totalOrders / uniqueCustomersCount) * 100
    : 0;

  // Calculate customer retention total
  metrics.customerRetention.total =
    metrics.customerRetention.returning + metrics.customerRetention.new;

  // Calculate growth rates using the previously initialized previousMetrics
  metrics.growth.revenue = calculateGrowthRate(
    metrics.totalRevenue,
    previousMetrics.totalRevenue
  );
  metrics.growth.customers = calculateGrowthRate(
    uniqueCustomersCount,
    previousMetrics.uniqueCustomers.size
  );
  metrics.growth.orders = calculateGrowthRate(
    metrics.totalOrders,
    previousMetrics.totalOrders
  );

  return metrics;
}

// Get dashboard metrics
router.get("/dashboard", auth, async (req, res) => {
  try {
    const { period = "monthly", timeframe = "6" } = req.query;

    // Get current period metrics
    const currentMetrics = await getCurrentPeriodMetrics(req.userId, period);

    // Get historical data for charts
    const historicalData = await getHistoricalData(
      req.userId,
      period,
      parseInt(timeframe)
    );

    // Calculate growth rates
    const growthRates = await calculateGrowthRates(req.userId, period);

    // Get top performing categories/products
    const topCategories = await getTopCategories(req.userId);

    res.json({
      currentMetrics,
      historicalData,
      growthRates,
      topCategories,
      period,
      timeframe,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
});

// Generate analytics for a specific period
router.post("/generate/:period", auth, async (req, res) => {
  try {
    const { period } = req.params;
    const validPeriods = ["daily", "weekly", "monthly"];

    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: "Invalid period" });
    }

    await generateAnalytics(req.userId, period);

    res.json({ message: `${period} analytics generated successfully` });
  } catch (error) {
    console.error("Generate analytics error:", error);
    res.status(500).json({ message: "Server error generating analytics" });
  }
});

// Get revenue trends
router.get("/revenue-trends", auth, async (req, res) => {
  try {
    const { period = "daily", days = 30 } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trends = await Analytics.find({
      userId: req.userId,
      period,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    res.json({ trends });
  } catch (error) {
    console.error("Revenue trends error:", error);
    res.status(500).json({ message: "Server error fetching revenue trends" });
  }
});

// Helper functions
async function getCurrentPeriodMetrics(userId, period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case "daily":
      startDate = startOfDay(now);
      break;
    case "weekly":
      startDate = startOfWeek(now);
      break;
    case "monthly":
      startDate = startOfMonth(now);
      break;
    default:
      startDate = startOfMonth(now);
  }

  // Get all records for the current period
  const records = await DataRecord.find({
    userId,
    "processedData.date": { $gte: startDate, $lte: now },
  });

  // Calculate metrics from the records
  const metrics = {
    totalRevenue: 0,
    totalOrders: records.length,
    uniqueCustomers: new Set(),
    topProducts: {},
    avgOrderValue: 0,
  };

  let totalValue = 0;
  records.forEach((record) => {
    const data = record.processedData;

    // Revenue and value calculations
    metrics.totalRevenue += data.revenue || 0;
    const orderValue = data.price * (data.quantity || 1) || 0;
    totalValue += orderValue;

    // Track unique customers
    if (data.customerId) {
      metrics.uniqueCustomers.add(data.customerId);
    }

    // Track product performance
    if (data.productId) {
      if (!metrics.topProducts[data.productId]) {
        metrics.topProducts[data.productId] = {
          revenue: 0,
          quantity: 0,
        };
      }
      metrics.topProducts[data.productId].revenue += data.revenue || 0;
      metrics.topProducts[data.productId].quantity += data.quantity || 1;
    }
  });

  // Calculate averages and finalize metrics
  // Finalize metrics calculations
  metrics.uniqueCustomers = metrics.uniqueCustomers.size;
  if (metrics.customerRetention) {
    metrics.customerRetention.total =
      (metrics.customerRetention.returning || 0) +
      (metrics.customerRetention.new || 0);
  } else {
    metrics.customerRetention = { total: 0, returning: 0, new: 0 };
  }

  // Initialize and calculate performance KPIs
  metrics.performance = {
    avgOrderValue: metrics.totalRevenue / metrics.totalOrders || 0,
    revenuePerCustomer: metrics.totalRevenue / metrics.uniqueCustomers || 0,
    conversionRate: (metrics.totalOrders / metrics.uniqueCustomers) * 100 || 0,
  };

  // Get previous period data for comparison
  const prevPeriodMetrics = {
    totalRevenue: 0,
    totalOrders: 0,
    uniqueCustomers: 0,
  };

  // Calculate growth rates using current values and defaults for previous period
  metrics.growth = {
    revenue: calculateGrowthRate(
      metrics.totalRevenue,
      prevPeriodMetrics.totalRevenue
    ),
    customers: calculateGrowthRate(
      metrics.uniqueCustomers,
      prevPeriodMetrics.uniqueCustomers
    ),
    orders: calculateGrowthRate(
      metrics.totalOrders,
      prevPeriodMetrics.totalOrders
    ),
  };

  // Process top categories data
  if (!metrics.topCategories || typeof metrics.topCategories !== "object") {
    metrics.topCategories = {};
  }

  // Process each category
  Object.keys(metrics.topCategories).forEach((category) => {
    const cat = metrics.topCategories[category];
    if (cat) {
      cat.avgOrderValue = cat.revenue / cat.orders || 0;
      cat.percentageOfTotal = (cat.revenue / metrics.totalRevenue) * 100 || 0;
    }
  });

  // Convert top categories to sorted array
  metrics.topCategories = Object.entries(metrics.topCategories)
    .map(([name, data]) => ({
      name,
      ...data,
    }))
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

  return metrics;
}

async function getHistoricalData(userId, period, timeframe) {
  const endDate = new Date();
  let startDate;

  switch (period) {
    case "daily":
      startDate = subDays(endDate, timeframe);
      break;
    case "weekly":
      startDate = subWeeks(endDate, timeframe);
      break;
    case "monthly":
      startDate = subMonths(endDate, timeframe);
      break;
    default:
      startDate = subMonths(endDate, 6);
  }

  // Get all data records for the period
  const records = await DataRecord.find({
    userId,
    "processedData.date": { $gte: startDate, $lte: endDate },
  }).sort({ "processedData.date": 1 });

  // Group data by date based on the period
  const groupedData = {};
  records.forEach((record) => {
    const date = record.processedData.date;
    if (!date) return;

    let groupKey;
    switch (period) {
      case "daily":
        groupKey = startOfDay(date).toISOString();
        break;
      case "weekly":
        groupKey = startOfWeek(date).toISOString();
        break;
      case "monthly":
        groupKey = startOfMonth(date).toISOString();
        break;
      default:
        groupKey = startOfMonth(date).toISOString();
    }

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = {
        date: new Date(groupKey),
        revenue: 0,
        orders: 0,
        uniqueCustomers: new Set(),
        totalValue: 0,
      };
    }

    const group = groupedData[groupKey];
    group.revenue += record.processedData.revenue || 0;
    group.orders++;
    if (record.processedData.customerId) {
      group.uniqueCustomers.add(record.processedData.customerId);
    }
    group.totalValue +=
      record.processedData.price * (record.processedData.quantity || 1) || 0;
  });

  // Convert grouped data to array and calculate averages
  return Object.values(groupedData)
    .map((group) => ({
      date: group.date,
      revenue: group.revenue,
      orders: group.orders,
      customers: group.uniqueCustomers.size,
      avgOrderValue: group.orders > 0 ? group.totalValue / group.orders : 0,
    }))
    .sort((a, b) => a.date - b.date);
}

async function calculateGrowthRates(userId, period) {
  const current = await getCurrentPeriodMetrics(userId, period);

  // Get previous period for comparison
  const now = new Date();
  let previousStartDate;

  switch (period) {
    case "daily":
      previousStartDate = subDays(startOfDay(now), 1);
      break;
    case "weekly":
      previousStartDate = subWeeks(startOfWeek(now), 1);
      break;
    case "monthly":
      previousStartDate = subMonths(startOfMonth(now), 1);
      break;
    default:
      previousStartDate = subMonths(startOfMonth(now), 1);
  }

  const previous = await Analytics.findOne({
    userId,
    period,
    date: previousStartDate,
  });

  if (!previous) {
    return {
      revenueGrowth: 0,
      customerGrowth: 0,
      orderGrowth: 0,
    };
  }

  const revenueGrowth = calculatePercentageGrowth(
    current.totalRevenue,
    previous.metrics.totalRevenue
  );

  const customerGrowth = calculatePercentageGrowth(
    current.uniqueCustomers,
    previous.metrics.uniqueCustomers
  );

  const orderGrowth = calculatePercentageGrowth(
    current.totalOrders,
    previous.metrics.totalOrders
  );

  return {
    revenueGrowth,
    customerGrowth,
    orderGrowth,
  };
}

async function getTopCategories(userId) {
  const pipeline = [
    { $match: { userId: userId } },
    {
      $group: {
        _id: "$processedData.category",
        totalRevenue: { $sum: "$processedData.revenue" },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ];

  const topCategories = await DataRecord.aggregate(pipeline);

  return topCategories.map((cat) => ({
    category: cat._id || "Uncategorized",
    revenue: cat.totalRevenue,
    orders: cat.totalOrders,
  }));
}

async function generateAnalytics(userId, period, specificDate = null) {
  const now = specificDate || new Date();
  let startDate, endDate;

  switch (period) {
    case "daily":
      startDate = startOfDay(now);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      break;
    case "weekly":
      startDate = startOfWeek(now);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      break;
    case "monthly":
      startDate = startOfMonth(now);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      break;
  }

  // Get data for the period
  const dataRecords = await DataRecord.find({
    userId,
    "processedData.date": { $gte: startDate, $lt: endDate },
  });

  // Calculate metrics
  const metrics = calculateMetricsFromData(dataRecords);

  // Upsert analytics record
  await Analytics.findOneAndUpdate(
    { userId, period, date: startDate },
    {
      userId,
      period,
      date: startDate,
      metrics,
    },
    { upsert: true, new: true }
  );
}

function calculateMetricsFromData(dataRecords) {
  const totalRevenue = dataRecords.reduce(
    (sum, record) => sum + (record.processedData.revenue || 0),
    0
  );

  const totalOrders = dataRecords.length;

  const uniqueCustomers = new Set(
    dataRecords.map((record) => record.processedData.customerId)
  ).size;

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate new vs returning customers (simplified)
  const customerCounts = {};
  dataRecords.forEach((record) => {
    const customerId = record.processedData.customerId;
    customerCounts[customerId] = (customerCounts[customerId] || 0) + 1;
  });

  const newCustomers = Object.values(customerCounts).filter(
    (count) => count === 1
  ).length;
  const returningCustomers = uniqueCustomers - newCustomers;

  return {
    totalRevenue,
    totalOrders,
    uniqueCustomers,
    avgOrderValue,
    newCustomers,
    returningCustomers,
    conversionRate: 0, // Would need additional data to calculate
    churnRate: 0, // Would need historical customer data
  };
}

function calculatePercentageGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getDefaultMetrics() {
  return {
    totalRevenue: 0,
    totalOrders: 0,
    uniqueCustomers: 0,
    avgOrderValue: 0,
    newCustomers: 0,
    returningCustomers: 0,
    conversionRate: 0,
    churnRate: 0,
  };
}

export default router;
