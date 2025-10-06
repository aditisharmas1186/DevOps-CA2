import * as Sentry from "@sentry/node";

export const initErrorTracking = (app) => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
      ],
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      profilesSampleRate: 1.0,
    });

    // The request handler must be the first middleware
    app.use(Sentry.Handlers.requestHandler());

    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }
};

export const captureError = (error, context = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  }
  console.error("Error:", error, "Context:", context);
};

export const captureMessage = (message, level = "info", context = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureMessage(message, level);
    });
  }
  console.log(`${level.toUpperCase()}: ${message}`, context);
};
