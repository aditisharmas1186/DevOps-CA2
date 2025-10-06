import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Send, 
  TrendingUp, 
  Calendar,
  Download,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { aiAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AIInsights = () => {
  const [query, setQuery] = useState('');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    fetchSummary();
    fetchRecommendations();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await aiAPI.getSummary('monthly');
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      // Set mock data for demo
      setSummary({
        summary: `**Executive Summary - Monthly Performance**

Your business has shown strong performance this month with significant growth across key metrics. Revenue increased by 12.5% compared to last month, driven primarily by improved customer acquisition and higher average order values.

**Key Achievements:**
- Total revenue reached $245,000, exceeding targets by 8%
- Customer base grew by 8.3% with 245 new customers acquired
- Average order value improved to $100, up from $95 last month
- Conversion rate increased to 3.2%, showing improved sales efficiency

**Growth Trends:**
The data shows consistent upward momentum across all major KPIs. Software category continues to be the top performer, contributing 35% of total revenue. Customer retention has improved with churn rate decreasing to 2.1%.

**Areas of Focus:**
While overall performance is strong, there are opportunities to optimize the training category which shows the highest growth potential at 22.1% but lower absolute revenue.`,
        period: 'monthly',
        generatedAt: new Date()
      });
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await aiAPI.getRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Set mock data for demo
      setRecommendations({
        recommendations: `**Strategic Recommendations for Business Growth**

Based on your current performance data and market trends, here are prioritized actionable recommendations:

**1. Optimize Training Category (High Impact)**
- Action: Increase marketing spend on training services by 30%
- Expected Outcome: 15-20% revenue increase in this category
- Timeline: 2-3 months
- Success Metrics: Training revenue growth, lead conversion rate

**2. Implement Customer Retention Program (High Impact)**
- Action: Launch loyalty program for customers with 3+ purchases
- Expected Outcome: Reduce churn rate from 2.1% to 1.5%
- Timeline: 1 month implementation
- Success Metrics: Customer lifetime value, repeat purchase rate

**3. Expand Software Offerings (Medium Impact)**
- Action: Introduce premium software tiers with advanced features
- Expected Outcome: 25% increase in software category revenue
- Timeline: 3-4 months
- Success Metrics: Upsell rate, average revenue per user

**4. Optimize Pricing Strategy (Medium Impact)**
- Action: A/B test 5-10% price increases on consulting services
- Expected Outcome: 8-12% margin improvement
- Timeline: 1 month testing period
- Success Metrics: Conversion rate, revenue per customer

**5. Enhance Customer Support (Low Impact, High Satisfaction)**
- Action: Implement live chat support during business hours
- Expected Outcome: Improved customer satisfaction and retention
- Timeline: 2 weeks
- Success Metrics: Support ticket resolution time, CSAT scores`,
        priority: 'high',
        generatedAt: new Date()
      });
    }
  };

  const generateForecast = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getForecast('revenue', 30);
      setForecast(response.data);
      toast.success('Forecast generated successfully');
    } catch (error) {
      console.error('Failed to generate forecast:', error);
      toast.error('Failed to generate forecast');
      // Set mock data for demo
      setForecast({
        analysis: `**30-Day Revenue Forecast Analysis**

Based on historical data patterns and current trends, here's the revenue forecast for the next 30 days:

**Forecast Summary:**
- Projected revenue: $285,000 - $315,000
- Expected growth: 16-28% over current month
- Confidence level: Medium-High (75%)

**Key Assumptions:**
1. Current growth trajectory continues at 12-15% monthly rate
2. No major market disruptions or seasonal effects
3. Marketing spend remains consistent
4. Customer acquisition rate maintains current pace

**Daily Projections (Sample):**
- Week 1: $8,500 - $9,200 daily average
- Week 2: $9,000 - $9,800 daily average  
- Week 3: $9,200 - $10,100 daily average
- Week 4: $9,500 - $10,500 daily average

**Risk Factors:**
- Economic uncertainty could impact B2B sales
- Seasonal variations in Q4 may affect demand
- Competition pricing changes could influence conversion

**Recommendations:**
- Maintain current marketing investment levels
- Prepare inventory for projected demand increase
- Monitor weekly performance against forecast`,
        confidence: 'medium',
        horizon: 30,
        metric: 'revenue'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await aiAPI.getInsights(query, 'monthly');
      const newInsight = {
        id: Date.now(),
        query,
        response: response.data.insights,
        timestamp: new Date()
      };
      
      setInsights(prev => [newInsight, ...prev]);
      setQuery('');
      toast.success('Insights generated successfully');
    } catch (error) {
      console.error('Failed to get insights:', error);
      toast.error('Failed to generate insights');
      
      // Add mock response for demo
      const mockInsight = {
        id: Date.now(),
        query,
        response: `Based on your business data, here are insights for "${query}":

Your current performance shows strong momentum with revenue growth of 12.5% month-over-month. The key drivers appear to be improved customer acquisition (245 new customers) and higher average order values ($100 vs $95 previously).

**Key Observations:**
- Software category is your strongest performer with $85,000 in revenue
- Training services show the highest growth rate at 22.1%
- Customer retention has improved with churn dropping to 2.1%
- Conversion rate of 3.2% is above industry average

**Recommendations:**
1. Double down on training services marketing given the high growth rate
2. Consider premium software tiers to capture more value from existing customers
3. Implement retention programs to maintain the improved churn rate

The data suggests you're well-positioned for continued growth with the right strategic focus.`,
        timestamp: new Date()
      };
      
      setInsights(prev => [mockInsight, ...prev]);
      setQuery('');
    } finally {
      setLoading(false);
    }
  };

  const suggestedQueries = [
    "What are my top performing products this month?",
    "How can I improve customer retention?",
    "What's driving my revenue growth?",
    "Which customer segments should I focus on?",
    "How does my performance compare to last quarter?"
  ];

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'summary', label: 'Business Summary', icon: Calendar },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'forecast', label: 'Forecasting', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Get intelligent business insights, forecasts, and recommendations powered by AI.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <div className="space-y-6">
          {/* Chat Interface */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Business Assistant</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Ask questions about your business data and get intelligent insights.
              </p>
            </div>

            {/* Query Form */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <form onSubmit={handleQuerySubmit} className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask me anything about your business data..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Ask AI
                      </>
                    )}
                  </button>
                </div>

                {/* Suggested Queries */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Try asking:</span>
                  {suggestedQueries.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setQuery(suggestion)}
                      className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Chat History */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {insights.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No insights yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Ask your first question to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {insights.map((insight) => (
                    <div key={insight.id} className="space-y-4">
                      {/* User Query */}
                      <div className="flex justify-end">
                        <div className="max-w-3xl bg-primary-600 text-white rounded-lg px-4 py-3">
                          <p className="text-sm">{insight.query}</p>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex justify-start">
                        <div className="max-w-3xl bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                              {insight.response}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {insight.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Summary</h3>
              </div>
              <button
                onClick={fetchSummary}
                className="flex items-center px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {summary ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                  {summary.summary}
                </div>
                <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                  Generated on {summary.generatedAt.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full">
                  High Priority
                </span>
                <button
                  onClick={fetchRecommendations}
                  className="flex items-center px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {recommendations ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                  {recommendations.recommendations}
                </div>
                <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                  Generated on {recommendations.generatedAt.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Forecasting</h3>
              </div>
              <button
                onClick={generateForecast}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Generate Forecast
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6">
            {forecast ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      30-day revenue forecast generated
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    forecast.confidence === 'high' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : forecast.confidence === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  }`}>
                    {forecast.confidence} confidence
                  </span>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                    {forecast.analysis}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No forecast generated yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Click the button above to generate a revenue forecast</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;