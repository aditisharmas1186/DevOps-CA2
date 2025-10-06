import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import { analyticsAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const ChartCard = ({ title, chart: Chart, data, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    {loading ? (
      <LoadingSpinner />
    ) : (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {Chart}
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [timeframe, setTimeframe] = useState("12");
  const [activeChart, setActiveChart] = useState("revenue");

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard({ period, timeframe });
      console.log("Analytics API Response:", response.data);

      // Transform dates to proper format for charts
      const processedData = {
        ...response.data,
        historicalData: (response.data.historicalData || []).map((item) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString(),
          revenue: Number(item.revenue || 0),
          orders: Number(item.orders || 0),
          customers: Number(item.customers || 0),
          avgOrderValue: Number(item.avgOrderValue || 0),
        })),
        yearlyTrends: Object.entries(response.data.yearlyComparison || {})
          .map(([year, data]) => ({
            year,
            revenue: Number(data.revenue || 0),
            orders: Number(data.orders || 0),
            customers: data.customers.size,
            products: data.products.size,
            categories: data.categories.size,
            avgOrderValue: data.orders ? data.revenue / data.orders : 0,
          }))
          .sort((a, b) => a.year.localeCompare(b.year)),
      };

      console.log("Processed Analytics Data:", processedData);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Analytics data fetch error:", error);
      toast.error("Failed to load analytics data");
      // Set mock data for demo
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = async () => {
    try {
      setLoading(true);
      await analyticsAPI.generateAnalytics(period);
      toast.success(`${period} analytics generated successfully`);
      await fetchAnalyticsData();
    } catch (error) {
      console.error("Generate analytics error:", error);
      toast.error("Failed to generate analytics");
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = () => ({
    currentMetrics: {
      totalRevenue: 245000,
      totalOrders: 2450,
      uniqueCustomers: 1650,
      avgOrderValue: 100,
      newCustomers: 245,
      returningCustomers: 1405,
      conversionRate: 3.2,
      churnRate: 2.1,
    },
    historicalData: Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${String(i + 1).padStart(2, "0")}`,
      revenue: 180000 + i * 5000 + Math.random() * 10000,
      orders: 1800 + i * 50 + Math.random() * 100,
      customers: 1200 + i * 30 + Math.random() * 50,
      avgOrderValue: 95 + Math.random() * 10,
      conversionRate: 2.5 + Math.random() * 1.5,
      churnRate: 1.5 + Math.random() * 1,
    })),
    growthRates: {
      revenueGrowth: 12.5,
      customerGrowth: 8.3,
      orderGrowth: 11.2,
    },
    topCategories: [
      { category: "Software", revenue: 85000, orders: 850, growth: 15.2 },
      { category: "Consulting", revenue: 65000, orders: 650, growth: 8.7 },
      { category: "Training", revenue: 55000, orders: 550, growth: 22.1 },
      { category: "Support", revenue: 40000, orders: 400, growth: 5.3 },
    ],
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { currentMetrics, historicalData, growthRates, topCategories } =
    analyticsData;

  const chartOptions = [
    { id: "revenue", label: "Revenue Trend", icon: TrendingUp },
    { id: "orders", label: "Orders Analysis", icon: BarChart3 },
    { id: "yearly", label: "Year-over-Year Growth", icon: Activity },
    { id: "customers", label: "Customer Metrics", icon: Activity },
    { id: "performance", label: "Performance KPIs", icon: PieChart },
  ];

  const colors = [
    "#3B82F6",
    "#14B8A6",
    "#F97316",
    "#8B5CF6",
    "#EF4444",
    "#10B981",
  ];

  const renderChart = () => {
    switch (activeChart) {
      case "revenue":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "orders":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                formatter={(value) => [value.toLocaleString(), "Orders"]}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="orders" fill="#14B8A6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "customers":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="customers"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
                name="Total Customers"
              />
              <Line
                type="monotone"
                dataKey="avgOrderValue"
                stroke="#8B5CF6"
                strokeWidth={2}
                name="Avg Order Value"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case "performance":
        const pieData = topCategories.map((cat, index) => ({
          name: cat.category,
          value: cat.revenue,
          color: colors[index % colors.length],
        }));

        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                contentStyle={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Advanced Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Deep dive into your business metrics and performance indicators.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="6">Last 6 periods</option>
            <option value="12">Last 12 periods</option>
            <option value="24">Last 24 periods</option>
          </select>

          <button
            onClick={generateAnalytics}
            className="flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>

          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${currentMetrics.totalRevenue?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600">
              {growthRates.revenueGrowth?.toFixed(1) || "0"}%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              vs last period
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {currentMetrics.conversionRate?.toFixed(1) || "0"}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600">+0.3%</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              vs last period
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Churn Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {currentMetrics.churnRate?.toFixed(1) || "0"}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm font-medium text-red-600">-0.2%</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              vs last period
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Customer Growth
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {growthRates.customerGrowth?.toFixed(1) || "0"}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600">
              {currentMetrics.newCustomers || 0} new
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              this period
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Analytics Charts
            </h3>

            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              {chartOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveChart(option.id)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      activeChart === option.id
                        ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">{renderChart()}</div>
      </div>

      {/* Category Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Category Performance
          </h3>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {topCategories?.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.orders} orders
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${category.revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center">
                    {category.growth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        category.growth >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Math.abs(category.growth).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
