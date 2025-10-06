import dotenv from "dotenv";
dotenv.config();
import express from "express";
import OpenAI from "openai";
import { auth } from "../middleware/auth.js";
import DataRecord from "../models/DataRecord.js";
import Analytics from "../models/Analytics.js";
import BusinessData from "../models/BusinessData.js";

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate business insights
router.post("/insights", auth, async (req, res) => {
  try {
    const { query, period = "monthly" } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Get user's business data context
    const context = await getBusinessContext(req.userId, period);

    // Generate AI insights
    const insights = await generateInsights(query, context);

    res.json({
      query,
      insights,
      context: {
        dataPoints: context.totalDataPoints,
        dateRange: context.dateRange,
        period,
      },
    });
  } catch (error) {
    console.error("AI insights error:", error);
    res.status(500).json({
      message: "Error generating insights",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Generate business summary
router.get("/summary/:period", auth, async (req, res) => {
  try {
    const { period } = req.params;
    const validPeriods = ["weekly", "monthly", "quarterly"];

    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: "Invalid period" });
    }

    try {
      // Get business context and analytics
      const context = await getBusinessContext(req.userId, period);
      const analytics = await getRecentAnalytics(req.userId, period);

      // Generate AI summary
      const summary = await generateBusinessSummary(context, analytics, period);

      res.json({
        period,
        summary,
        generatedAt: new Date(),
        context: {
          dataPoints: context.totalDataPoints,
          dateRange: context.dateRange,
        },
      });
    } catch (error) {
      if (error.code === "insufficient_quota") {
        res.status(503).json({
          error: "AI service temporarily unavailable. Please try again later.",
          details: "API quota exceeded",
        });
      } else {
        throw error; // Let the global error handler catch other errors
      }
    }
  } catch (error) {
    console.error("AI summary error:", error);
    res.status(500).json({
      message: "Error generating summary",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Generate forecasts
router.post("/forecast", auth, async (req, res) => {
  try {
    const { metric = "revenue", horizon = 30 } = req.body;

    // Get historical data
    const historicalData = await getHistoricalDataForForecast(
      req.userId,
      metric
    );

    if (historicalData.length < 7) {
      return res.status(400).json({
        message:
          "Insufficient data for forecasting. Need at least 7 data points.",
      });
    }

    // Generate AI-powered forecast
    const forecast = await generateForecast(historicalData, metric, horizon);

    res.json({
      metric,
      horizon,
      forecast,
      confidence: forecast.confidence || "medium",
      methodology: "AI-assisted trend analysis",
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("AI forecast error:", error);
    res.status(500).json({
      message: "Error generating forecast",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get actionable recommendations
router.get("/recommendations", auth, async (req, res) => {
  try {
    // Get comprehensive business context
    const context = await getBusinessContext(req.userId, "monthly");
    const analytics = await getRecentAnalytics(req.userId, "monthly");
    const trends = await getBusinessTrends(req.userId);

    // Generate AI recommendations
    const recommendations = await generateRecommendations(
      context,
      analytics,
      trends
    );

    res.json({
      recommendations,
      priority: "high",
      generatedAt: new Date(),
      basedOn: {
        dataPoints: context.totalDataPoints,
        analyticsRecords: analytics.length,
        timeframe: "Last 30 days",
      },
    });
  } catch (error) {
    console.error("AI recommendations error:", error);
    res.status(500).json({
      message: "Error generating recommendations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Helper functions
async function getBusinessContext(userId, period) {
  // Get user's datasets
  const datasets = await BusinessData.find({ userId, isProcessed: true });

  // Get data records
  const dataRecords = await DataRecord.find({ userId });

  // Get recent analytics
  const analytics = await Analytics.find({ userId, period })
    .sort({ date: -1 })
    .limit(12);

  // Calculate summary statistics
  const totalRevenue = dataRecords.reduce(
    (sum, record) => sum + (record.processedData.revenue || 0),
    0
  );

  const dateRange = {
    start:
      dataRecords.length > 0
        ? new Date(Math.min(...dataRecords.map((r) => r.processedData.date)))
        : null,
    end:
      dataRecords.length > 0
        ? new Date(Math.max(...dataRecords.map((r) => r.processedData.date)))
        : null,
  };

  return {
    totalDataPoints: dataRecords.length,
    datasets: datasets.length,
    totalRevenue,
    dateRange,
    analytics: analytics.slice(0, 6), // Recent 6 periods
    recentMetrics: analytics[0]?.metrics || {},
  };
}

async function getRecentAnalytics(userId, period) {
  return Analytics.find({ userId, period }).sort({ date: -1 }).limit(6);
}

async function getHistoricalDataForForecast(userId, metric) {
  const analytics = await Analytics.find({ userId })
    .sort({ date: 1 })
    .limit(60); // Last 60 periods

  return analytics.map((item) => ({
    date: item.date,
    value: item.metrics[metric] || 0,
  }));
}

async function getBusinessTrends(userId) {
  const analytics = await Analytics.find({ userId })
    .sort({ date: -1 })
    .limit(12);

  if (analytics.length < 2) return {};

  const latest = analytics[0];
  const previous = analytics[1];

  return {
    revenueGrowth: calculateGrowth(
      latest.metrics.totalRevenue,
      previous.metrics.totalRevenue
    ),
    customerGrowth: calculateGrowth(
      latest.metrics.uniqueCustomers,
      previous.metrics.uniqueCustomers
    ),
    orderGrowth: calculateGrowth(
      latest.metrics.totalOrders,
      previous.metrics.totalOrders
    ),
  };
}

function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

async function generateInsights(query, context) {
  try {
    const prompt = `
You are an expert business analyst. Based on the following business data, provide insights for this query: "${query}"

Business Context:
- Total data points: ${context.totalDataPoints}
- Total revenue: $${context.totalRevenue?.toLocaleString() || 0}
- Date range: ${
      context.dateRange?.start
        ? context.dateRange.start.toLocaleDateString()
        : "N/A"
    } to ${
      context.dateRange?.end
        ? context.dateRange.end.toLocaleDateString()
        : "N/A"
    }
- Recent metrics: ${JSON.stringify(context.recentMetrics, null, 2)}

Recent analytics (last 6 periods):
${context.analytics
  .map(
    (a) =>
      `Date: ${a.date.toLocaleDateString()}, Revenue: $${
        a.metrics.totalRevenue
      }, Orders: ${a.metrics.totalOrders}, Customers: ${
        a.metrics.uniqueCustomers
      }`
  )
  .join("\n")}

Provide specific, actionable insights in a conversational tone. Include:
1. Direct answer to the query
2. Key patterns or trends observed
3. Specific recommendations
4. Relevant metrics and percentages

Keep response under 500 words and make it business-focused.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm currently unable to generate insights. Please check your API configuration and try again.";
  }
}

async function generateBusinessSummary(context, analytics, period) {
  try {
    const prompt = `
Generate a comprehensive ${period} business summary based on the following data:

Business Overview:
- Total transactions: ${context.totalDataPoints}
- Total revenue: $${context.totalRevenue?.toLocaleString() || 0}
- Active period: ${
      context.dateRange?.start
        ? context.dateRange.start.toLocaleDateString()
        : "N/A"
    } to ${
      context.dateRange?.end
        ? context.dateRange.end.toLocaleDateString()
        : "N/A"
    }

Recent Performance (${analytics.length} ${period} periods):
${analytics
  .map(
    (a) =>
      `${a.date.toLocaleDateString()}: Revenue $${a.metrics.totalRevenue?.toLocaleString()}, Orders ${
        a.metrics.totalOrders
      }, Customers ${
        a.metrics.uniqueCustomers
      }, AOV $${a.metrics.avgOrderValue?.toFixed(2)}`
  )
  .join("\n")}

Create a professional business summary that includes:
1. Executive overview of performance
2. Key achievements and milestones
3. Growth trends and patterns
4. Areas of concern or opportunity
5. Strategic recommendations for next period

Format as a structured business report. Keep it professional and data-driven.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.6,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Unable to generate business summary at this time. Please check your API configuration.";
  }
}

async function generateForecast(historicalData, metric, horizon) {
  try {
    const prompt = `
As a data analyst, create a ${horizon}-day forecast for ${metric} based on this historical data:

Historical Data (chronological):
${historicalData
  .slice(-30)
  .map((d) => `${d.date.toLocaleDateString()}: ${d.value}`)
  .join("\n")}

Provide:
1. Daily forecasted values for the next ${horizon} days
2. Confidence level (high/medium/low)
3. Key assumptions and methodology
4. Potential risks or factors that could affect the forecast

Format the forecast as a JSON array with dates and predicted values, followed by analysis.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.5,
    });

    const response = completion.choices[0].message.content;

    // Extract JSON forecast if present, otherwise return text analysis
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const forecastData = JSON.parse(jsonMatch[0]);
        return {
          data: forecastData,
          analysis: response,
          confidence: "medium",
        };
      }
    } catch (parseError) {
      // If JSON parsing fails, return the full text
    }

    return {
      analysis: response,
      confidence: "medium",
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      analysis:
        "Unable to generate forecast at this time. Please check your API configuration.",
      confidence: "low",
    };
  }
}

async function generateRecommendations(context, analytics, trends) {
  try {
    const prompt = `
As a business consultant, provide actionable recommendations based on this business data:

Current Status:
- Total revenue: $${context.totalRevenue?.toLocaleString() || 0}
- Data points: ${context.totalDataPoints}
- Recent metrics: ${JSON.stringify(context.recentMetrics, null, 2)}

Growth Trends:
- Revenue growth: ${trends.revenueGrowth?.toFixed(2) || 0}%
- Customer growth: ${trends.customerGrowth?.toFixed(2) || 0}%
- Order growth: ${trends.orderGrowth?.toFixed(2) || 0}%

Recent Performance:
${analytics
  .slice(0, 3)
  .map(
    (a) =>
      `${a.date.toLocaleDateString()}: Revenue $${a.metrics.totalRevenue?.toLocaleString()}, Orders ${
        a.metrics.totalOrders
      }, AOV $${a.metrics.avgOrderValue?.toFixed(2)}`
  )
  .join("\n")}

Provide 5-7 specific, actionable recommendations prioritized by potential impact. Each recommendation should include:
1. Specific action to take
2. Expected outcome
3. Implementation timeline
4. Success metrics

Focus on practical, implementable strategies.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Unable to generate recommendations at this time. Please check your API configuration.";
  }
}

export default router;
