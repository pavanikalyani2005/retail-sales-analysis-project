# ⚡ Quick Start Guide

## 30-Second Setup

### 1️⃣ Install Dependencies (One-time)

```bash
# Python dependencies
pip install -r requirements_new.txt

# Node.js dependencies
cd frontend_vite && npm install && cd ..
```

### 2️⃣ Start Backend (Terminal 1)

```bash
python -m uvicorn app.app:app --reload --port 8000
```

✅ You'll see: `Uvicorn running on http://127.0.0.1:8000`

### 3️⃣ Start Frontend (Terminal 2)

```bash
cd frontend_vite
npm run dev
```

✅ You'll see: `Local: http://localhost:5173/`

### 4️⃣ Open Dashboard

Go to: **http://localhost:5173** in your browser

---

## What You See

✅ **Blue Line** → Historical sales  
🔴 **Red Dots** → Anomalies (detected automatically)  
🟢 **Green Line** → Sales forecast (5 days ahead)  
📊 **Metric Cards** → Model performance (MAE, RMSE, R²)  
📈 **KPI Cards** → Business metrics (Total Sales, Growth, etc.)  
🗓️ **Date Filter** → Filter by date range  

---

## Test the APIs

```bash
# Get anomalies and sales data
curl http://127.0.0.1:8000/anomaly

# Get model performance metrics
curl http://127.0.0.1:8000/model-metrics

# Get 5-step forecast
curl http://127.0.0.1:8000/forecast

# Get KPIs
curl http://127.0.0.1:8000/kpis

# View interactive API docs
# Visit: http://127.0.0.1:8000/docs
```

---

## Expected Output

### Dashboard Should Show:
- 📊 Chart with 3 datasets plotted
- 🔴 2 anomalies detected (red dots)
- 📈 Forecast line extending into future
- 💰 KPI cards: Total Sales, Avg Order Value, etc.
- 📊 Metrics: MAE ≈ 15.42, RMSE ≈ 18.93, R² ≈ 0.7854

### Backend Should Return:
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

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Python module error | `pip install -r requirements_new.txt --upgrade` |
| Port 8000 in use | `uvicorn app.app:app --port 8001` |
| No data on chart | Check `data/data.csv` exists |
| npm not found | Install Node.js from nodejs.org |
| PySpark error | `pip install pyspark` |

---

## Next Steps

1. ✅ Run the quick start above
2. 🔍 View `/docs` API documentation
3. 📖 Read [SPARK_PROJECT_README.md](SPARK_PROJECT_README.md) for details
4. 📊 Filter data with date range picker
5. 🚀 Deploy to production (Spark cluster)

---

**Ready?** Just run those 3 commands above! 🎉
