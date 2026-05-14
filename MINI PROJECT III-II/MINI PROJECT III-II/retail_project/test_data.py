import os
import sys
import pandas as pd

# Test data loading
app_dir = os.path.dirname(os.path.abspath(__file__))
data_file = os.path.join(app_dir, "data", "data.csv")

print(f"App directory: {app_dir}")
print(f"Data file path: {data_file}")
print(f"File exists: {os.path.exists(data_file)}")

if os.path.exists(data_file):
    try:
        df = pd.read_csv(data_file)
        print(f"Data loaded successfully")
        print(f"Data shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        print(f"First 5 sales values: {df['sales'].tolist()[:5]}")
        
        # Test anomaly detection
        sys.path.insert(0, os.path.join(app_dir, "app"))
        from model.anomaly import detect_anomalies
        
        data = df["sales"].astype(float).tolist()
        anomalies = detect_anomalies(data)
        print(f"Anomalies detected: {anomalies}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
