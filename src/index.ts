import express from "express";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Metrics tracking
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

// Metrics middleware
app.use((req, res, next) => {
  requestCount++;
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness check endpoint
app.get("/ready", (req, res) => {
  res.status(200).json({
    status: "ready",
    uptime: process.uptime(),
  });
});

// Metrics endpoint for Prometheus
app.get("/metrics", (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  res.set("Content-Type", "text/plain");
  res.send(`# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${requestCount}

# HELP http_errors_total Total number of HTTP errors
# TYPE http_errors_total counter
http_errors_total ${errorCount}

# HELP app_uptime_seconds Application uptime in seconds
# TYPE app_uptime_seconds gauge
app_uptime_seconds ${uptime}

# HELP nodejs_memory_usage_bytes Node.js memory usage
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}
nodejs_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}
nodejs_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}
`);
});

// Main endpoint
app.get("/", (req, res) => {
  const requestInfo = {
    message: "Welcome to DevOps Demo Service",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };
  res.json(requestInfo);
});

// API endpoint
app.get("/api/info", (req, res) => {
  res.json({
    service: "DevOps Demo",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    errorCount++;
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Metrics: http://localhost:${port}/metrics`);
});
