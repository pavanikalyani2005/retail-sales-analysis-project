# ✅ First-Run Validation Checklist

Complete this checklist to ensure your Spark time-series analytics project is fully functional.

---

## Phase 1: Environment Setup

### Python & Dependencies
- [ ] Python 3.8+ installed: `python --version`
- [ ] Virtual environment created and activated
- [ ] `pip install -r requirements_new.txt` completed without errors
- [ ] Verify PySpark: `python -c "import pyspark; print(pyspark.__version__)"`

### Node.js & Frontend
- [ ] Node.js installed: `node --version` (v14+)
- [ ] npm installed: `npm --version` (v6+)
- [ ] Dependencies installed: `cd frontend_vite && npm install` (no errors)
- [ ] Vite build verified: `npm run build` completes successfully

### Data Files
- [ ] `data/data.csv` file exists (24 records)
- [ ] CSV contains columns: `timestamp`, `store_id`, `product_id`, `sales`, `price`
- [ ] First row has headers (not skipped)

---

## Phase 2: Backend Tests

### API Server Startup
```bash
cd retail_project
python -m uvicorn app.app:app --reload --port 8000
```

- [ ] Server starts without errors
- [ ] Message shows: "Uvicorn running on http://127.0.0.1:8000"
- [ ] No port conflict errors (if error, use `--port 8001`)

### Health Check
```bash
curl http://127.0.0.1:8000/
```

- [ ] Response: `{"status":"ok"}` or similar
- [ ] HTTP status: 200

### API Documentation
- [ ] Visit http://127.0.0.1:8000/docs
- [ ] Swagger UI loads
- [ ] All 8 endpoints listed:
  - [ ] `/`
  - [ ] `/anomaly`
  - [ ] `/forecast`
  - [ ] `/spark-forecast`
  - [ ] `/model-metrics`
  - [ ] `/kpis`
  - [ ] `/date-range`
  - [ ] `/pipeline-info`

### Anomaly Endpoint Test
```bash
curl http://127.0.0.1:8000/anomaly
```

- [ ] Response is valid JSON
- [ ] Contains `data` array with 24 records
- [ ] Contains `anomalies` array with 2 items (indices 1 and 19)
- [ ] Sample response structure:
  ```json
  {
    "data": [...24 items...],
    "anomalies": [[1, 149], [19, 146]],
    "date_range": {...}
  }
  ```

### Forecast Endpoint Test
```bash
curl http://127.0.0.1:8000/forecast
```

- [ ] Response returns 5 forecast values
- [ ] Values are numeric (float)
- [ ] Sample values: `[100, 105, 110, 115, 120]` (approximate)

### KPI Endpoint Test
```bash
curl http://127.0.0.1:8000/kpis
```

- [ ] Response contains 8 KPI values:
  - [ ] `total_sales` (sum of all sales)
  - [ ] `avg_order_value` (average per transaction)
  - [ ] `order_count` (24 in this dataset)
  - [ ] `avg_daily_sales` (average per day)
  - [ ] `growth_rate` (percentage)
  - [ ] `anomaly_count` (2)
  - [ ] `top_product` (string ID)
  - [ ] `top_store` (string ID)

### Model Metrics Endpoint Test
```bash
curl http://127.0.0.1:8000/model-metrics
```

- [ ] Response structure:
  ```json
  {
    "status": "trained",
    "metrics": {
      "mae": 15.42,
      "rmse": 18.93,
      "r2": 0.7854,
      "mse": 358.34
    }
  }
  ```
- [ ] All metric values are numeric (non-zero)
- [ ] R² is between 0 and 1
- [ ] MAE < RMSE (always true)

### Pipeline Info Endpoint Test
```bash
curl http://127.0.0.1:8000/pipeline-info
```

- [ ] Response shows components list
- [ ] Response shows features list
- [ ] Contains at least 3 components
- [ ] Contains at least 3 features

---

## Phase 3: Frontend Tests

### Frontend Server Startup
```bash
cd frontend_vite
npm run dev
```

- [ ] Build completes without errors
- [ ] Message shows: "Local: http://localhost:5173/"
- [ ] No compilation errors

### Dashboard Access
- [ ] Visit http://localhost:5173
- [ ] Page loads (doesn't show 404 or error)
- [ ] Title visible (contains "Spark" or "Analytics")

### Chart Component
- [ ] Chart renders (not blank)
- [ ] Chart has title: "📊 Spark-Based Time-Series Analytics & Forecasting"
- [ ] Chart has legend (blue, red, green lines)
- [ ] X-axis shows dates/index
- [ ] Y-axis shows sales values

### Data Visualization
- [ ] 🔵 Blue line visible (actual sales data)
- [ ] 🔴 Red dots visible at correct positions (anomalies at indices 1 and 19)
- [ ] 🟢 Green line visible (forecast predictions)
- [ ] All three datasets plotted correctly

### KPI Cards Section
- [ ] 8 KPI cards visible
- [ ] Cards show:
  - [ ] 💰 Total Sales
  - [ ] 📈 Avg Order Value
  - [ ] 📦 Order Count
  - [ ] 📊 Avg Daily Sales
  - [ ] 📉 Growth Rate
  - [ ] 🚨 Anomalies
  - [ ] 🏆 Top Product
  - [ ] 🏪 Top Store
- [ ] All values are numeric (not "undefined" or "NaN")

### Metrics Cards Section
- [ ] 4 metric cards visible
- [ ] Shows:
  - [ ] 📊 MAE
  - [ ] 📈 RMSE
  - [ ] 📉 R² (between 0-1)
  - [ ] 🎯 MSE
- [ ] Values match `/model-metrics` API response

### Date Filter
- [ ] Date input fields visible
- [ ] "From" and "To" date pickers work
- [ ] Changing dates updates the chart
- [ ] Chart re-renders without page reload
- [ ] New data reflects filtered date range

### Pipeline Architecture Section
- [ ] "Pipeline Architecture" section visible at bottom
- [ ] Shows components: Data Ingestion, DataFrames, Feature Engineering, MLlib, Metrics
- [ ] Shows features: Scalable, Parallel, Distributed, Real-time

### Responsive Design
- [ ] Chart is readable on full width
- [ ] KPI cards wrap properly
- [ ] Open DevTools (F12) and check mobile view (375px width)
- [ ] Layout still usable on mobile

---

## Phase 4: Integration Tests

### Backend ↔ Frontend Communication
- [ ] Change date range on dashboard
- [ ] Verify new data appears in chart
- [ ] Check browser Network tab (F12 → Network):
  - [ ] Requests to `/anomaly?start_date=...&end_date=...`
  - [ ] All requests return HTTP 200
  - [ ] Response times < 1 second

### Error Handling
- [ ] Stop backend server
- [ ] Check dashboard shows error message (not blank)
- [ ] Restart backend
- [ ] Dashboard auto-recovers and shows data

### Data Consistency
- [ ] Compare dashboard numbers with API responses:
  - [ ] `/anomaly` count matches "Anomalies" KPI card
  - [ ] `/kpis` values match individual cards
  - [ ] `/model-metrics` values match metric cards

---

## Phase 5: Validation Script

Run the comprehensive test suite:

```bash
python test_pipeline.py
```

### Expected Output
```
============================================================
🚀 SPARK PIPELINE VALIDATION TEST SUITE
============================================================

============================================================
TEST 1: Checking Imports
============================================================
✓ Importing pandas... OK
✓ Importing numpy... OK
✓ Importing sklearn... OK
✓ Importing statsmodels... OK
✓ Importing pyspark... OK (v3.5.0)
✓ Importing fastapi... OK

✅ All imports successful!

...
(More tests)
...

============================================================
📊 TEST SUMMARY
============================================================
✅ PASS - Python Imports
✅ PASS - Data Loading
✅ PASS - Anomaly Detection
✅ PASS - ARIMA Forecasting
✅ PASS - Spark Session
✅ PASS - Spark Pipeline

✅ All tests passed!
```

- [ ] All 6 tests show ✅ PASS
- [ ] No ❌ FAIL messages
- [ ] No errors or exceptions

---

## Phase 6: Data Verification

### Sample Data Record
First record in `data.csv`:

```
timestamp,store_id,product_id,sales,price
2026-02-16 08:00:00,store_1,prod_1,100,25.50
```

- [ ] 5 columns present and correct
- [ ] Timestamps in ISO format
- [ ] Sales values are positive numbers
- [ ] Price values are positive decimal numbers

### Anomaly Detection Verification
- [ ] Anomaly at index 1 has name="sales"
- [ ] Anomaly value ≈ 149 (outlier, Z-score > 2)
- [ ] Anomaly at index 19 has value ≈ 146 (outlier)
- [ ] Anomalies are statistically significant (not just slightly off)

---

## Phase 7: Performance Check

### Response Times
- [ ] API endpoints respond in < 200ms
- [ ] Chart renders in < 1 second
- [ ] Dashboard loads in < 3 seconds

### Memory Usage
- [ ] Python process using < 500MB (check Task Manager)
- [ ] npm dev server using < 200MB

### No Console Errors
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] No red error messages
- [ ] No 404 Not Found warnings
- [ ] No unhandled promise rejections

---

## Phase 8: File Structure Verification

### Required Files Exist
- [ ] `app/app.py` (FastAPI backend)
- [ ] `model/spark_pipeline.py` (Spark pipeline)
- [ ] `model/anomaly.py` (Anomaly detection)
- [ ] `model/train_model.py` (ARIMA)
- [ ] `data/data.csv` (Data file)
- [ ] `frontend_vite/src/components/AnomalyGraph.jsx` (React component)
- [ ] `frontend_vite/package.json` (npm config)
- [ ] `requirements_new.txt` (Python dependencies)

### Documentation Files Present
- [ ] `QUICKSTART.md`
- [ ] `SPARK_PROJECT_README.md`
- [ ] `DEPLOYMENT_GUIDE.md`
- [ ] `PROJECT_SUMMARY.md`
- [ ] `config_template.yaml`
- [ ] `test_pipeline.py`
- [ ] This file (`FIRST_RUN_CHECKLIST.md`)

---

## Phase 9: Production Readiness

### Code Quality
- [ ] No TODO comments left in critical code
- [ ] No hardcoded credentials or secrets
- [ ] Error messages are meaningful (no cryptic errors)
- [ ] Logging shows key operations

### Scalability
- [ ] Spark configuration documented
- [ ] Code handles different data sizes (24 to 1M+ records)
- [ ] No global variables that limit concurrency

### Deployment Readiness
- [ ] Dockerfile concept understood
- [ ] Environment variables configurable
- [ ] Database layer ready for addition
- [ ] API ready for authentication layer

---

## Phase 10: Documentation Check

- [ ] All code files have docstrings
- [ ] API endpoints documented in swagger
- [ ] Key functions have comments
- [ ] README files explain purpose and usage
- [ ] Configuration options documented

---

## 🎯 Success Criteria

Your project is **FULLY FUNCTIONAL** when:

✅ **Backend**: All 8 API endpoints return correct data
✅ **Frontend**: Dashboard displays with data and charts
✅ **Integration**: Frontend correctly consumes backend data
✅ **Validation**: `test_pipeline.py` passes all 6 tests
✅ **Performance**: Response times < 1 second
✅ **No Errors**: Console (browser + terminal) shows no errors

---

## 🚀 Next Steps

### If All Tests Pass ✅
1. Congratulations! Your project is ready
2. Review DEPLOYMENT_GUIDE.md for production deployment
3. Consider adding more data to test scalability
4. Set up monitoring (Prometheus + Grafana)
5. Add authentication (JWT)
6. Deploy to cloud (AWS, GCP, Azure)

### If Tests Fail ❌
1. Check which test failed
2. Review error message carefully
3. Verify file paths are correct
4. Check port availability (8000, 5173)
5. Review logs in terminal
6. Try restarting services
7. Run `python test_pipeline.py` for detailed diagnostics

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `pip install -r requirements_new.txt` |
| "Port 8000 in use" | Use `--port 8001` or kill process |
| "npm not found" | Install Node.js from nodejs.org |
| "Chart is blank" | Check `/anomaly` endpoint returns data |
| "No anomalies shown" | Verify `/anomaly` response includes anomalies array |
| "Metrics are NaN" | Run `test_pipeline.py` to debug |
| "Frontend can't reach API" | Verify backend is running and CORS enabled |

---

## 📋 Checkpoint Summary

Print this page and check off as you go:

**Setup Phase**: ___   
**Backend Tests**: ___   
**Frontend Tests**: ___   
**Integration Tests**: ___   
**Validation Script**: ___   
**Data Verification**: ___   
**Performance Check**: ___   
**File Structure**: ___   
**Production Readiness**: ___   
**Documentation**: ___   

**Overall Status**: ✅ **READY FOR PRODUCTION** / ⚠️ **NEEDS FIXES** / ❌ **NOT READY**

---

**Completion Date**: ________________

**Total Setup Time**: ________________

**Notes**:
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

**Good luck! 🚀**
