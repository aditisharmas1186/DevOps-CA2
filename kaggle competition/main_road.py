# main_road.py
import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import KFold
import lightgbm as lgb

# ------------------------
# Config
# ------------------------
TRAIN_FNAME = "train_Road.csv"
TEST_FNAME = "test_Road.csv"
TARGET = "accident_risk"
N_SPLITS = 5
SEED = 42
OUTPUT = "submission_Road.csv"

np.random.seed(SEED)

# ------------------------
# Sanity checks & load
# ------------------------
if not os.path.exists(TRAIN_FNAME) or not os.path.exists(TEST_FNAME):
    print(f"ERROR: make sure {TRAIN_FNAME} and {TEST_FNAME} exist in the working folder.")
    sys.exit(1)

train = pd.read_csv(TRAIN_FNAME)
test = pd.read_csv(TEST_FNAME)

print("Train shape:", train.shape)
print("Test shape:", test.shape)
print("Train columns:", list(train.columns))
print("Test columns:", list(test.columns))

if TARGET not in train.columns:
    print(f"ERROR: target column '{TARGET}' not found in {TRAIN_FNAME}.")
    sys.exit(1)

# ------------------------
# Prepare X, y, and test
# ------------------------
# Capture test ids (if present)
test_ids = test["id"] if "id" in test.columns else None
id_col = "id" if test_ids is not None else None

# drop target from train features
X = train.drop(columns=[TARGET])
y = train[TARGET].copy()

# drop id from features if present in either
if "id" in X.columns:
    X = X.drop(columns=["id"])
if "id" in test.columns:
    X_test = test.drop(columns=["id"])
else:
    X_test = test.copy()

# ------------------------
# Deterministic categorical encoding (safe)
# ------------------------
# find columns that are object or bool in X (we rely on these being categorical)
cat_cols = X.select_dtypes(include=["object", "bool"]).columns.tolist()

for col in cat_cols:
    # build deterministic union of categories (train order first then test)
    train_vals = pd.Index(X[col].astype(str).unique())
    test_vals = pd.Index(X_test[col].astype(str).unique()) if col in X_test.columns else pd.Index([])
    union = train_vals.append(test_vals).unique()
    mapping = {val: i for i, val in enumerate(union)}
    # map both train and test (missing -> NaN)
    X[col] = X[col].astype(str).map(mapping)
    if col in X_test.columns:
        X_test[col] = X_test[col].astype(str).map(mapping)
    else:
        # if test doesn't have this column for some reason, create it filled with NaN
        X_test[col] = np.nan

# ------------------------
# Fill missing values
# ------------------------
X = X.fillna(-999)
X_test = X_test.fillna(-999)

# ------------------------
# Align train/test features (ensure same columns & same order)
# ------------------------
X, X_test = X.align(X_test, join="inner", axis=1)  # keep only intersection (safe)
print("Final Train shape:", X.shape)
print("Final Test shape:", X_test.shape)

if X.shape[1] != X_test.shape[1]:
    print("ERROR: train/test feature count mismatch after alignment.")
    sys.exit(1)

# ------------------------
# LightGBM params
# ------------------------
params = {
    "objective": "regression",
    "metric": "rmse",
    "boosting_type": "gbdt",
    "learning_rate": 0.05,
    "num_leaves": 128,
    "feature_fraction": 0.9,
    "bagging_fraction": 0.8,
    "bagging_freq": 5,
    "seed": SEED,
    "verbose": -1,
}

# ------------------------
# CV training
# ------------------------
folds = KFold(n_splits=N_SPLITS, shuffle=True, random_state=SEED)
oof_preds = np.zeros(len(X))
test_preds = np.zeros(len(X_test))

for fold, (tr_idx, val_idx) in enumerate(folds.split(X, y)):
    print(f"\n=== Fold {fold+1}/{N_SPLITS} ===")
    X_tr, X_val = X.iloc[tr_idx], X.iloc[val_idx]
    y_tr, y_val = y.iloc[tr_idx], y.iloc[val_idx]

    dtrain = lgb.Dataset(X_tr, label=y_tr)
    dval = lgb.Dataset(X_val, label=y_val, reference=dtrain)

    model = lgb.train(
        params,
        dtrain,
        num_boost_round=5000,
        valid_sets=[dtrain, dval],
        callbacks=[
            lgb.early_stopping(200),
            lgb.log_evaluation(200),
        ],
    )

    best_iter = model.best_iteration if model.best_iteration is not None else model.num_trees()
    print(f"Best iteration: {best_iter}")

    oof_preds[val_idx] = model.predict(X_val, num_iteration=best_iter)
    test_preds += model.predict(X_test, num_iteration=best_iter) / N_SPLITS

# ------------------------
# RMSE (calculated with numpy to avoid sklearn version differences)
# ------------------------
rmse = np.sqrt(np.mean((y.values - oof_preds) ** 2))
print(f"\n✅ CV RMSE: {rmse:.6f}")

# ------------------------
# Clip predictions (accident_risk is in [0,1] in train)
# ------------------------
test_preds = np.clip(test_preds, 0.0, 1.0)

# ------------------------
# Save submission
# ------------------------
if test_ids is not None:
    submission = pd.DataFrame({id_col: test_ids})
else:
    submission = pd.DataFrame({"id": np.arange(len(test_preds))})

submission[TARGET] = test_preds
submission.to_csv(OUTPUT, index=False)
print(f"✅ Submission saved to {OUTPUT}")
