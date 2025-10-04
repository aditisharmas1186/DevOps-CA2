# Road Accident Risk Prediction – Kaggle Playground Series S5E10  

This repository contains our solution for the **Kaggle Playground Series – Season 5, Episode 10 (S5E10)** competition.  
The competition challenges participants to predict **accident risk scores** for road segments based on their characteristics, environmental conditions, and historical accident data.  

🔗 [Competition Link](https://www.kaggle.com/competitions/playground-series-s5e10)  

---

## Team Members
- **Adyasha Subhadarsini**  
- **Aarya Patil**  

---

## Competition Overview  

- **Problem Statement**  
  Predict the **continuous accident risk score (`accident_risk`)** for road segments given their features.  
  The target is a **float between 0 and 1**, representing the probability of accident occurrence.  

- **Timeline**  
  - Competition launched: *3 days ago*  
  - Deadline: **1 November 2025**  
  - Submissions allowed: daily  
  - Evaluation metric: **Root Mean Squared Error (RMSE)**  

- **Leaderboard**  
  - Public leaderboard is based on a hidden split of the test dataset.  
  - Final private leaderboard will be revealed after the competition closes.  

---

## 📊 Dataset  

Two main CSV files were provided by Kaggle:  

1. **train_Road.csv**  
   - Rows: **517,754**  
   - Columns: **14** (features + target `accident_risk`)  

2. **test_Road.csv**  
   - Rows: **172,585**  
   - Columns: **13** (only features, no target)  

### Feature Summary
- **road_type** – categorical (urban, rural, highway)  
- **num_lanes** – integer (number of lanes)  
- **curvature** – float (curvature factor of road)  
- **speed_limit** – integer (speed limit of road)  
- **lighting** – categorical (daylight, night, dim)  
- **weather** – categorical (clear, rainy, foggy)  
- **road_signs_present** – boolean flag  
- **public_road** – boolean flag  
- **time_of_day** – categorical (morning, afternoon, evening)  
- **holiday** – binary flag  
- **school_season** – binary flag  
- **num_reported_accidents** – integer (historical accidents)  

**Target variable**:  
- `accident_risk` → continuous float between 0 and 1  

---

## Approach & Methodology  

We designed our pipeline to balance **performance**, **generalization**, and **interpretability**.  

### 🔹 1. Data Preprocessing
- Dropped the `id` column (not useful for prediction).  
- Label-encoded categorical and boolean features.  
- Missing values replaced with sentinel `-999`.  
- Ensured **train and test alignment** (same columns in same order).  

### 🔹 2. Cross-Validation
- Used **5-fold KFold CV** for robust score estimation.  
- Out-of-fold (OOF) predictions stored for RMSE calculation.  

### 🔹 3. Models Used
We built an **ensemble of gradient boosting models**, each trained with tuned parameters:  

1. **LightGBM**  
   - `num_leaves=256`, `learning_rate=0.01`, early stopping = 200 rounds  
   - Fast training, great for tabular data  

2. **XGBoost**  
   - `max_depth=8`, `colsample_bytree=0.8`, `subsample=0.8`  
   - Strong regularization, prevents overfitting  

3. **CatBoost**  
   - `depth=8`, `learning_rate=0.01`, `l2_leaf_reg=3`  
   - Excellent for handling categorical variables  

4. **Ensemble**  
   - Final predictions = simple average of LightGBM + XGBoost + CatBoost  
   - This reduces variance and usually outperforms single models  

### 🔹 4. Optimization
- Used **early stopping** (200 rounds) for all models.  
- Averaged across CV folds for stable results.  
- Predictions clipped between **0 and 1** (valid accident risk range).  

---

## ⚙️ Technical Stack  

- **Language**: Python 3.13  
- **Environment**: VS Code (local) + Kaggle Kernels (validation)  
- **Libraries**:  
  - `pandas`, `numpy` → data preprocessing  
  - `scikit-learn` → cross-validation, metrics  
  - `lightgbm`, `xgboost`, `catboost` → machine learning models  

---

## 📈 Results  

- **LightGBM CV RMSE**: ~0.0560  
- **XGBoost CV RMSE**: ~0.0562  
- **CatBoost CV RMSE**: ~0.0558  
- **Ensemble CV RMSE**: **~0.0554**  

Our ensemble model consistently performs better than individual models.  

---

## 📤 Outputs  

The final submission is saved as **`submission_Road.csv`** with the format:  

```csv
id,accident_risk
517754,0.1324
517755,0.2017
517756,0.0873
517757,0.4589
...
