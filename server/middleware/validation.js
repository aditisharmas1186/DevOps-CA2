import { body, param, query, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      message: "Validation Error",
      errors: errors.array(),
    });
  };
};

// Analytics validations
export const analyticsValidation = {
  getDashboard: [
    query("period")
      .optional()
      .isIn(["daily", "weekly", "monthly", "quarterly", "yearly"]),
    query("timeframe").optional().isInt({ min: 1, max: 12 }),
  ],

  generateAnalytics: [param("period").isIn(["daily", "weekly", "monthly"])],
};

// Data validations
export const dataValidation = {
  uploadFile: [
    body("type").isIn(["csv", "xlsx"]),
    body("mapping").optional().isObject(),
  ],

  updateMappings: [
    body("mappings").isObject(),
    body("mappings.*.field").isString(),
    body("mappings.*.type").isIn([
      "revenue",
      "date",
      "customer_id",
      "product_id",
      "quantity",
      "price",
      "category",
      "other",
    ]),
  ],
};

// AI validations
export const aiValidation = {
  getInsights: [
    body("query").isString().notEmpty(),
    body("period").optional().isIn(["weekly", "monthly", "quarterly"]),
  ],

  getForecast: [
    body("metric").isIn(["revenue", "orders", "customers"]),
    body("horizon").isInt({ min: 7, max: 365 }),
  ],
};

// User validations
export const userValidation = {
  updateProfile: [
    body("firstName").optional().isString().trim().notEmpty(),
    body("lastName").optional().isString().trim().notEmpty(),
    body("email").optional().isEmail().normalizeEmail(),
  ],

  updatePreferences: [
    body("theme").optional().isIn(["light", "dark"]),
    body("emailNotifications").optional().isBoolean(),
    body("dashboardLayout").optional().isArray(),
  ],
};
