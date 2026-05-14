#!/usr/bin/env python
"""
Spark Pipeline Validation Script
Tests all components of the Apache Spark big data pipeline
"""

import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test all required imports"""
    print("=" * 60)
    print("TEST 1: Checking Imports")
    print("=" * 60)
    
    try:
        print("✓ Importing pandas...", end=" ")
        import pandas as pd
        print("OK")
        
        print("✓ Importing numpy...", end=" ")
        import numpy as np
        print("OK")
        
        print("✓ Importing sklearn...", end=" ")
        import sklearn
        print("OK")
        
        print("✓ Importing statsmodels...", end=" ")
        import statsmodels
        print("OK")
        
        print("✓ Importing pyspark...", end=" ")
        import pyspark
        print(f"OK (v{pyspark.__version__})")
        
        print("✓ Importing fastapi...", end=" ")
        import fastapi
        print("OK")
        
        print("\n✅ All imports successful!\n")
        return True
    except Exception as e:
        print(f"\n❌ Import failed: {e}\n")
        return False


def test_data_loading():
    """Test data loading"""
    print("=" * 60)
    print("TEST 2: Loading Data")
    print("=" * 60)
    
    try:
        import pandas as pd
        
        data_path = Path(__file__).parent / "data" / "data.csv"
        if not data_path.exists():
            print(f"❌ Data file not found: {data_path}\n")
            return False
        
        print(f"✓ Reading CSV from: {data_path}")
        df = pd.read_csv(data_path)
        
        print(f"✓ Rows: {len(df)}, Columns: {len(df.columns)}")
        print(f"✓ Columns: {list(df.columns)}")
        print(f"✓ Dtypes:\n{df.dtypes}")
        print(f"\n✓ First 3 rows:\n{df.head(3)}")
        
        print("\n✅ Data loading successful!\n")
        return True
    except Exception as e:
        print(f"❌ Data loading failed: {e}\n")
        return False


def test_anomaly_detection():
    """Test anomaly detection"""
    print("=" * 60)
    print("TEST 3: Anomaly Detection")
    print("=" * 60)
    
    try:
        import pandas as pd
        from model.anomaly import detect_anomalies
        
        data_path = Path(__file__).parent / "data" / "data.csv"
        df = pd.read_csv(data_path)
        
        print(f"✓ Detecting anomalies in {len(df)} records...")
        anomalies = detect_anomalies(df['sales'].values)
        
        print(f"✓ Found {len(anomalies)} anomalies")
        for idx, val in anomalies:
            print(f"  - Index {idx}: Sales = ${val:.2f}")
        
        print("\n✅ Anomaly detection working!\n")
        return True
    except Exception as e:
        print(f"❌ Anomaly detection failed: {e}\n")
        import traceback
        traceback.print_exc()
        return False


def test_arima_forecast():
    """Test ARIMA forecasting"""
    print("=" * 60)
    print("TEST 4: ARIMA Forecasting")
    print("=" * 60)
    
    try:
        import pandas as pd
        from model.train_model import train_and_predict
        
        data_path = Path(__file__).parent / "data" / "data.csv"
        df = pd.read_csv(data_path)
        
        print(f"✓ Training ARIMA model on {len(df)} data points...")
        forecast = train_and_predict(df['sales'].values, steps=5)
        
        print(f"✓ Generated {len(forecast)} forecast steps:")
        for i, val in enumerate(forecast, 1):
            print(f"  - Step {i}: ${val:.2f}")
        
        print("\n✅ ARIMA forecasting working!\n")
        return True
    except Exception as e:
        print(f"❌ ARIMA forecasting failed: {e}\n")
        import traceback
        traceback.print_exc()
        return False


def test_spark_session():
    """Test Spark session creation"""
    print("=" * 60)
    print("TEST 5: Spark Session")
    print("=" * 60)
    
    try:
        from pyspark.sql import SparkSession
        
        print("✓ Creating Spark session...")
        spark = SparkSession.builder \
            .appName("ValidationTest") \
            .master("local[*]") \
            .getOrCreate()
        
        print(f"✓ Spark version: {spark.version}")
        print(f"✓ App name: {spark.sparkContext.appName}")
        print(f"✓ Master: {spark.sparkContext.master}")
        print(f"✓ Parallelism: {spark.sparkContext.defaultParallelism}")
        
        # Stop the session
        spark.stop()
        
        print("\n✅ Spark session working!\n")
        return True
    except Exception as e:
        print(f"❌ Spark session failed: {e}\n")
        import traceback
        traceback.print_exc()
        return False


def test_spark_pipeline():
    """Test Spark pipeline"""
    print("=" * 60)
    print("TEST 6: Spark Pipeline")
    print("=" * 60)
    
    try:
        from model.spark_pipeline import run_spark_pipeline
        
        data_path = Path(__file__).parent / "data" / "data.csv"
        
        print(f"✓ Running Spark pipeline on {data_path}...")
        print("  (This may take 10-30 seconds on first run due to JVM startup)\n")
        
        result = run_spark_pipeline(str(data_path))
        
        print(f"✓ Pipeline completed!")
        print(f"✓ Status: {result.get('status')}")
        print(f"✓ Model type: {result.get('model_type')}")
        
        metrics = result.get('metrics', {})
        print(f"\n✓ Metrics:")
        print(f"  - MAE (Mean Absolute Error):  ${metrics.get('mae', 0):.4f}")
        print(f"  - RMSE (Root Mean Squared):   ${metrics.get('rmse', 0):.4f}")
        print(f"  - R² (Coefficient):           {metrics.get('r2', 0):.4f}")
        print(f"  - MSE (Mean Squared Error):   {metrics.get('mse', 0):.4f}")
        
        forecast = result.get('forecast', [])
        print(f"\n✓ Forecast ({len(forecast)} steps):")
        for i, val in enumerate(forecast, 1):
            print(f"  - Step {i}: ${val:.2f}")
        
        print("\n✅ Spark pipeline working!\n")
        return True
    except Exception as e:
        print(f"❌ Spark pipeline failed: {e}\n")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("🚀 SPARK PIPELINE VALIDATION TEST SUITE")
    print("=" * 60 + "\n")
    
    tests = [
        ("Python Imports", test_imports),
        ("Data Loading", test_data_loading),
        ("Anomaly Detection", test_anomaly_detection),
        ("ARIMA Forecasting", test_arima_forecast),
        ("Spark Session", test_spark_session),
        ("Spark Pipeline", test_spark_pipeline),
    ]
    
    results = {}
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except Exception as e:
            print(f"❌ Test '{name}' crashed: {e}\n")
            results[name] = False
    
    # Summary
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n{'✅ All tests passed!' if passed == total else f'⚠️  {passed}/{total} tests passed'}\n")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
