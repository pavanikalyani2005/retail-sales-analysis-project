from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from model.train_model import train_and_predict
from model.anomaly import detect_anomalies
from model.spark_pipeline import run_spark_pipeline
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

app = FastAPI(title="Time-Series Forecasting Pipeline", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data and model paths
DATA_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "data.csv"))

# Global pipeline instance
spark_pipeline = None


def initialize_spark_pipeline():
    """Initialize Spark pipeline on startup"""
    global spark_pipeline
    try:
        if spark_pipeline is None:
            spark_pipeline = run_spark_pipeline(DATA_FILE)
        return spark_pipeline
    except Exception as e:
        print(f"⚠️ Spark pipeline initialization: {e}")
        return None


def load_data():
    """Load and prepare data"""
    try:
        if os.path.exists(DATA_FILE):
            df = pd.read_csv(DATA_FILE)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            return df
        return pd.DataFrame()
    except Exception as e:
        print(f"Error loading data: {e}")
        return pd.DataFrame()


@app.on_event("startup")
async def startup_event():
    """Initialize Spark pipeline on app startup"""
    initialize_spark_pipeline()


@app.get("/")
def health():
    """Health check endpoint"""
    return {
        "status": "operational",
        "service": "Time-Series Forecasting Pipeline",
        "spark_enabled": spark_pipeline is not None
    }


@app.get("/anomaly")
def anomaly(start_date: str = None, end_date: str = None):
    """Get actual sales data and detected anomalies with optional date filtering"""
    try:
        df = load_data()
        if df.empty or "sales" not in df.columns:
            return {"data": [], "anomalies": [], "metadata": {}}
        
        # Apply date filtering if provided
        if start_date:
            df = df[df['timestamp'] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df['timestamp'] <= pd.to_datetime(end_date)]
        
        if df.empty:
            return {"data": [], "anomalies": [], "metadata": {}}
        
        data = df["sales"].astype(float).tolist()
        anomalies_list = detect_anomalies(data)
        anomaly_indices = [idx for idx, val in anomalies_list]
        
        return {
            "data": data,
            "anomalies": anomaly_indices,
            "timestamps": df['timestamp'].astype(str).tolist(),
            "metadata": {
                "total_records": len(data),
                "anomaly_count": len(anomaly_indices),
                "min_sales": float(min(data)) if data else 0,
                "max_sales": float(max(data)) if data else 0,
                "avg_sales": float(sum(data) / len(data)) if data else 0
            }
        }
    except Exception as e:
        print(f"Error in /anomaly: {e}")
        import traceback
        traceback.print_exc()
    
    return {"data": [], "anomalies": [], "metadata": {}}


@app.get("/forecast")
def forecast():
    """Get future predictions (forecast using ARIMA)"""
    try:
        predictions = train_and_predict()
        return {"forecast": predictions}
    except Exception as e:
        print(f"Error in /forecast: {e}")
        return {"forecast": []}


@app.get("/data")
def get_data(start_date: str = None, end_date: str = None):
    """Return raw data records as JSON (list of objects) with optional date filtering"""
    try:
        df = load_data()
        if df.empty:
            return {"data": []}

        # Apply date filtering
        if start_date:
            df = df[df['timestamp'] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df['timestamp'] <= pd.to_datetime(end_date)]

        if df.empty:
            return {"data": []}

        # Ensure timestamp string representation
        df_copy = df.copy()
        if 'timestamp' in df_copy.columns:
            df_copy['timestamp'] = df_copy['timestamp'].astype(str)

        records = df_copy.to_dict(orient='records')
        return {"data": records}
    except Exception as e:
        print(f"Error in /data: {e}")
        import traceback
        traceback.print_exc()
        return {"data": []}


@app.get("/spark-forecast")
def spark_forecast():
    """Get predictions from Spark MLlib model with performance metrics"""
    try:
        # If Spark pipeline not initialized, return a simulated example forecast
        if spark_pipeline is None:
            return {
                "forecast": [82.30, 81.72, 81.78, 81.77, 81.77],
                "metrics": {},
                "model_type": "Spark MLlib (simulated)"
            }

        # Get metrics from the pipeline
        summary = spark_pipeline.get_summary()

        return {
            "forecast": summary.get("forecast", [82.30, 81.72, 81.78, 81.77, 81.77]),
            "metrics": summary.get("metrics", {}),
            "model_type": summary.get("model_type", "Spark MLlib")
        }
    except Exception as e:
        print(f"Error in /spark-forecast: {e}")
        return {"forecast": [], "metrics": {}, "model_type": "Error"}


@app.get("/lstm-forecast")
def lstm_forecast():
    """Attempt an LSTM-based forecast; fall back to simulated predictions if TensorFlow is unavailable."""
    try:
        try:
            from tensorflow.keras.models import Sequential
            from tensorflow.keras.layers import LSTM, Dense
            from tensorflow.keras.optimizers import Adam
            tf_available = True
        except Exception:
            tf_available = False

        df = load_data()
        if df.empty or 'sales' not in df.columns:
            return {"forecast": [], "note": "no data"}

        sales = df['sales'].astype(float).values

        if not tf_available or len(sales) < 10:
            # fallback simulated forecast (simple moving average)
            last5 = sales[-5:]
            avg = float(last5.mean()) if len(last5) else float(sales.mean())
            sim = [round(avg * (0.98 + 0.04 * i/4), 2) for i in range(5)]
            return {"forecast": sim, "model": "lstm_simulated", "note": "tensorflow not available or insufficient data"}

        # Build simple LSTM (very small) - reshape data
        import numpy as np
        seq_len = 5
        X, y = [], []
        for i in range(len(sales) - seq_len):
            X.append(sales[i:i+seq_len])
            y.append(sales[i+seq_len])
        X = np.array(X).reshape(-1, seq_len, 1)
        y = np.array(y)

        model = Sequential()
        model.add(LSTM(16, input_shape=(seq_len, 1)))
        model.add(Dense(1))
        model.compile(optimizer=Adam(learning_rate=0.01), loss='mse')
        model.fit(X, y, epochs=20, batch_size=8, verbose=0)

        # prepare prediction input
        preds = []
        window = sales[-seq_len:].tolist()
        for _ in range(5):
            arr = np.array(window[-seq_len:]).reshape(1, seq_len, 1)
            p = float(model.predict(arr, verbose=0)[0][0])
            preds.append(round(p, 2))
            window.append(p)

        return {"forecast": preds, "model": "lstm", "note": "trained locally"}
    except Exception as e:
        print(f"Error in /lstm-forecast: {e}")
        return {"forecast": [], "note": "error"}


@app.get("/model-metrics")
def get_model_metrics():
    """Get model performance metrics (MAE, RMSE, R²)"""
    try:
        if spark_pipeline is None:
            return {
                "status": "not_initialized",
                "metrics": {}
            }
        
        summary = spark_pipeline.get_summary()
        metrics = summary.get("metrics", {})
        
        return {
            "status": summary.get("status"),
            "metrics": {
                "mae": metrics.get("mae", 0),
                "rmse": metrics.get("rmse", 0),
                "r2": metrics.get("r2", 0),
                "mse": metrics.get("mse", 0)
            },
            "model_type": summary.get("model_type"),
            "interpretation": {
                "mae_meaning": f"Average error: ${metrics.get('mae', 0):.2f}",
                "rmse_meaning": f"Root mean squared error: ${metrics.get('rmse', 0):.2f}",
                "r2_meaning": f"R² score (0-1): {metrics.get('r2', 0):.4f} (higher is better)"
            }
        }
    except Exception as e:
        print(f"Error in /model-metrics: {e}")
        return {"status": "error", "metrics": {}}


@app.get("/kpis")
def get_kpis(start_date: str = None, end_date: str = None):
    """Get Power BI style KPIs"""
    try:
        df = load_data()
        if df.empty or "sales" not in df.columns:
            return {
                "total_sales": 0,
                "avg_daily_sales": 0,
                "order_count": 0,
                "avg_order_value": 0,
                "growth_rate": 0,
                "anomaly_count": 0,
                "top_product": "N/A",
                "top_store": "N/A"
            }
        
        # Apply date filtering
        if start_date:
            df = df[df['timestamp'] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df['timestamp'] <= pd.to_datetime(end_date)]
        
        if df.empty:
            return {
                "total_sales": 0,
                "avg_daily_sales": 0,
                "order_count": 0,
                "avg_order_value": 0,
                "growth_rate": 0,
                "anomaly_count": 0,
                "top_product": "N/A",
                "top_store": "N/A"
            }
        
        sales_data = df["sales"].astype(float)
        
        # Calculate KPIs
        total_sales = float(sales_data.sum())
        order_count = len(df)
        avg_order_value = float(sales_data.mean())
        
        # Daily sales calculation
        if 'timestamp' in df.columns:
            df['date'] = df['timestamp'].dt.date
            daily_sales = df.groupby('date')['sales'].sum()
            avg_daily_sales = float(daily_sales.mean())
        else:
            avg_daily_sales = avg_order_value
        
        # Growth rate (compare first half to second half)
        midpoint = len(df) // 2
        first_half_avg = sales_data.iloc[:midpoint].mean()
        second_half_avg = sales_data.iloc[midpoint:].mean()
        growth_rate = float(((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg != 0 else 0)
        
        # Anomaly count
        anomalies_list = detect_anomalies(sales_data.tolist())
        anomaly_count = len(anomalies_list)
        
        # Top product
        if 'product_id' in df.columns:
            top_product = df.groupby('product_id')['sales'].sum().idxmax()
        else:
            top_product = "N/A"
        
        # Top store
        if 'store_id' in df.columns:
            top_store = df.groupby('store_id')['sales'].sum().idxmax()
        else:
            top_store = "N/A"
        
        return {
            "total_sales": total_sales,
            "avg_daily_sales": avg_daily_sales,
            "order_count": order_count,
            "avg_order_value": avg_order_value,
            "growth_rate": growth_rate,
            "anomaly_count": anomaly_count,
            "top_product": str(top_product),
            "top_store": str(top_store)
        }
    except Exception as e:
        print(f"Error in /kpis: {e}")
        import traceback
        traceback.print_exc()
        return {
            "total_sales": 0,
            "avg_daily_sales": 0,
            "order_count": 0,
            "avg_order_value": 0,
            "growth_rate": 0,
            "anomaly_count": 0,
            "top_product": "N/A",
            "top_store": "N/A"
        }


@app.get("/date-range")
def get_date_range():
    """Get min and max dates from data for date picker"""
    try:
        df = load_data()
        if df.empty or 'timestamp' not in df.columns:
            return {
                "min_date": None,
                "max_date": None
            }
        
        min_date = df['timestamp'].min().strftime("%Y-%m-%d")
        max_date = df['timestamp'].max().strftime("%Y-%m-%d")
        
        return {
            "min_date": min_date,
            "max_date": max_date
        }
    except Exception as e:
        print(f"Error in /date-range: {e}")
        return {
            "min_date": None,
            "max_date": None
        }


@app.get("/pipeline-info")
def get_pipeline_info():
    """Get information about the data processing pipeline"""
    return {
        "title": "Big Data Time-Series Analytics Pipeline",
        "description": "Distributed data processing with Apache Spark and MLlib",
        "components": [
            "Distributed Data Ingestion",
            "DataFrames & RDDs",
            "Feature Engineering (Spark)",
            "MLlib Linear Regression",
            "Performance Metrics (MAE, RMSE)"
        ],
        "features": [
            "Scalable time-series processing",
            "Parallel feature engineering",
            "Distributed model training",
            "Real-time forecasting",
            "Anomaly detection"
        ]
    }



@app.get("/anomaly")
def anomaly(start_date: str = None, end_date: str = None):
    """Get actual sales data and detected anomalies with optional date filtering"""
    try:
        df = load_data()
        if df.empty or "sales" not in df.columns:
            return {"data": [], "anomalies": [], "metadata": {}}
        
        # Apply date filtering if provided
        if start_date:
            df = df[df['timestamp'] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df['timestamp'] <= pd.to_datetime(end_date)]
        
        if df.empty:
            return {"data": [], "anomalies": [], "metadata": {}}
        
        data = df["sales"].astype(float).tolist()
        anomalies_list = detect_anomalies(data)
        anomaly_indices = [idx for idx, val in anomalies_list]
        
        return {
            "data": data,
            "anomalies": anomaly_indices,
            "timestamps": df['timestamp'].astype(str).tolist(),
            "metadata": {
                "total_records": len(data),
                "anomaly_count": len(anomaly_indices),
                "min_sales": float(min(data)) if data else 0,
                "max_sales": float(max(data)) if data else 0,
                "avg_sales": float(sum(data) / len(data)) if data else 0
            }
        }
    except Exception as e:
        print(f"Error in /anomaly: {e}")
        import traceback
        traceback.print_exc()
    
    return {"data": [], "anomalies": [], "metadata": {}}


@app.get("/forecast")
def forecast():
    """Get future predictions (forecast using ARIMA)"""
    try:
        predictions = train_and_predict()
        return {"forecast": predictions}
    except Exception as e:
        print(f"Error in /forecast: {e}")
        return {"forecast": []}


@app.get("/kpis")
def get_kpis(start_date: str = None, end_date: str = None):
    """Get Power BI style KPIs"""
    try:
        df = load_data()
        if df.empty or "sales" not in df.columns:
            return {
                "total_sales": 0,
                "avg_daily_sales": 0,
                "order_count": 0,
                "avg_order_value": 0,
                "growth_rate": 0,
                "anomaly_count": 0,
                "top_product": "N/A",
                "top_store": "N/A"
            }
        
        # Apply date filtering
        if start_date:
            df = df[df['timestamp'] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df['timestamp'] <= pd.to_datetime(end_date)]
        
        if df.empty:
            return {
                "total_sales": 0,
                "avg_daily_sales": 0,
                "order_count": 0,
                "avg_order_value": 0,
                "growth_rate": 0,
                "anomaly_count": 0,
                "top_product": "N/A",
                "top_store": "N/A"
            }
        
        sales_data = df["sales"].astype(float)
        
        # Calculate KPIs
        total_sales = float(sales_data.sum())
        order_count = len(df)
        avg_order_value = float(sales_data.mean())
        
        # Daily sales calculation
        if 'timestamp' in df.columns:
            df['date'] = df['timestamp'].dt.date
            daily_sales = df.groupby('date')['sales'].sum()
            avg_daily_sales = float(daily_sales.mean())
        else:
            avg_daily_sales = avg_order_value
        
        # Growth rate (compare first half to second half)
        midpoint = len(df) // 2
        first_half_avg = sales_data.iloc[:midpoint].mean()
        second_half_avg = sales_data.iloc[midpoint:].mean()
        growth_rate = float(((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg != 0 else 0)
        
        # Anomaly count
        anomalies_list = detect_anomalies(sales_data.tolist())
        anomaly_count = len(anomalies_list)
        
        # Top product
        if 'product_id' in df.columns:
            top_product = df.groupby('product_id')['sales'].sum().idxmax()
        else:
            top_product = "N/A"
        
        # Top store
        if 'store_id' in df.columns:
            top_store = df.groupby('store_id')['sales'].sum().idxmax()
        else:
            top_store = "N/A"
        
        return {
            "total_sales": total_sales,
            "avg_daily_sales": avg_daily_sales,
            "order_count": order_count,
            "avg_order_value": avg_order_value,
            "growth_rate": growth_rate,
            "anomaly_count": anomaly_count,
            "top_product": str(top_product),
            "top_store": str(top_store)
        }
    except Exception as e:
        print(f"Error in /kpis: {e}")
        import traceback
        traceback.print_exc()
        return {
            "total_sales": 0,
            "avg_daily_sales": 0,
            "order_count": 0,
            "avg_order_value": 0,
            "growth_rate": 0,
            "anomaly_count": 0,
            "top_product": "N/A",
            "top_store": "N/A"
        }


@app.get("/date-range")
def get_date_range():
    """Get min and max dates from data for date picker"""
    try:
        df = load_data()
        if df.empty or 'timestamp' not in df.columns:
            return {
                "min_date": None,
                "max_date": None
            }
        
        min_date = df['timestamp'].min().strftime("%Y-%m-%d")
        max_date = df['timestamp'].max().strftime("%Y-%m-%d")
        
        return {
            "min_date": min_date,
            "max_date": max_date
        }
    except Exception as e:
        print(f"Error in /date-range: {e}")
        return {
            "min_date": None,
            "max_date": None
        }

