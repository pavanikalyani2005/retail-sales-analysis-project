"""
Apache Spark-based Time-Series Analytics and Forecasting Pipeline
Distributed data processing with feature engineering and MLlib models
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, year, month, dayofmonth, hour, row_number, lag
from pyspark.sql.window import Window
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.regression import LinearRegression
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.mllib.evaluation import RegressionMetrics
import pandas as pd
import os

class SparkTimeSeriesPipeline:
    """
    Spark-based pipeline for time-series forecasting with distributed processing,
    feature engineering, and model evaluation.
    """
    
    def __init__(self):
        """Initialize Spark session"""
        self.spark = SparkSession.builder \
            .appName("TimeSeriesForecastingPipeline") \
            .master("local[*]") \
            .config("spark.sql.session.timeZone", "UTC") \
            .getOrCreate()
        
        # Suppress INFO logs for cleaner output
        self.spark.sparkContext.setLogLevel("ERROR")
        self.model = None
        self.scaler = None
        self.metrics = {}
    
    def load_data(self, csv_path):
        """Load CSV data into Spark DataFrame with distributed processing"""
        try:
            df = self.spark.read.csv(csv_path, header=True, inferSchema=True)
            print(f"✅ Loaded {df.count()} records from {csv_path}")
            return df
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return None
    
    def preprocess_data(self, df):
        """
        Preprocess time-series data:
        - Convert timestamp
        - Handle nulls
        - Sort by time
        """
        try:
            # Convert timestamp string to timestamp type
            df = df.withColumn("timestamp", col("timestamp").cast("timestamp"))
            
            # Drop rows with null sales
            df = df.dropna(subset=["sales"])
            
            # Sort by timestamp for time-series processing
            df = df.orderBy("timestamp")
            
            print(f"✅ Preprocessed: {df.count()} valid records")
            return df
        except Exception as e:
            print(f"❌ Preprocessing error: {e}")
            return None
    
    def feature_engineering(self, df):
        """
        Feature engineering for time-series:
        - Temporal features (hour, day, month, year)
        - Lag features (previous sales values)
        - Moving averages
        - Trend features
        """
        try:
            # Extract temporal features
            df = df.withColumn("year", year(col("timestamp")))
            df = df.withColumn("month", month(col("timestamp")))
            df = df.withColumn("day", dayofmonth(col("timestamp")))
            df = df.withColumn("hour", hour(col("timestamp")))
            
            # Create lag features (previous sales values)
            window_spec = Window.orderBy("timestamp")
            df = df.withColumn("lag_1", lag("sales", 1).over(window_spec))
            df = df.withColumn("lag_2", lag("sales", 2).over(window_spec))
            df = df.withColumn("lag_3", lag("sales", 3).over(window_spec))
            
            # Fill NaN lag values with 0
            df = df.fillna(0, subset=["lag_1", "lag_2", "lag_3"])
            
            # One-hot encode store_id
            from pyspark.ml.feature import StringIndexer, OneHotEncoder
            indexer = StringIndexer(inputCol="store_id", outputCol="store_encoded")
            df = indexer.fit(df).transform(df)
            
            # Time index for time-series ordering
            df = df.withColumn("time_index", row_number().over(window_spec))
            
            print(f"✅ Feature engineering completed: {len(df.columns)} features")
            return df
        except Exception as e:
            print(f"❌ Feature engineering error: {e}")
            return None
    
    def train_model(self, df):
        """
        Train Linear Regression model using Spark MLlib on distributed data
        """
        try:
            # Select features for training
            feature_cols = ["hour", "month", "day", "year", "lag_1", "lag_2", "lag_3", "time_index", "store_encoded"]
            
            # Assemble features into a single vector
            assembler = VectorAssembler(
                inputCols=feature_cols,
                outputCol="features"
            )
            df_assembled = assembler.transform(df)
            
            # Scale features for better convergence
            self.scaler = StandardScaler(inputCol="features", outputCol="scaled_features")
            self.scaler = self.scaler.fit(df_assembled)
            df_scaled = self.scaler.transform(df_assembled)
            
            # Split data: 80% train, 20% test
            train_df, test_df = df_scaled.randomSplit([0.8, 0.2], seed=42)
            
            # Train Linear Regression model using Spark MLlib
            self.model = LinearRegression(
                featuresCol="scaled_features",
                labelCol="sales",
                maxIter=100,
                regParam=0.01,
                elasticNetParam=0.5
            )
            
            self.model = self.model.fit(train_df)
            
            print(f"✅ Model Training:")
            print(f"   - Training samples: {train_df.count()}")
            print(f"   - Test samples: {test_df.count()}")
            print(f"   - Coefficients: {len(self.model.coefficients)}")
            
            # Evaluate model
            self._evaluate_model(test_df)
            
            return self.model, test_df
        except Exception as e:
            print(f"❌ Model training error: {e}")
            import traceback
            traceback.print_exc()
            return None, None
    
    def _evaluate_model(self, test_df):
        """
        Calculate performance metrics:
        - MAE (Mean Absolute Error)
        - RMSE (Root Mean Squared Error)
        - R² (R-squared)
        """
        try:
            # Make predictions
            predictions = self.model.transform(test_df)
            
            # Convert to RDD for RegressionMetrics
            predictionAndLabels = predictions.select("prediction", "sales") \
                .rdd.map(lambda row: (row[0], row[1]))
            
            # Calculate metrics
            metrics = RegressionMetrics(predictionAndLabels)
            
            self.metrics = {
                "mae": metrics.meanAbsoluteError,
                "rmse": metrics.rootMeanSquaredError,
                "r2": metrics.r2Score,
                "mse": metrics.meanSquaredError
            }
            
            print(f"\n📊 Model Performance Metrics:")
            print(f"   - MAE:  ${self.metrics['mae']:.2f}")
            print(f"   - RMSE: ${self.metrics['rmse']:.2f}")
            print(f"   - R²:   {self.metrics['r2']:.4f}")
            print(f"   - MSE:  {self.metrics['mse']:.2f}\n")
            
        except Exception as e:
            print(f"❌ Evaluation error: {e}")
    
    def forecast(self, df, steps=5):
        """
        Generate forecasts for next N periods
        """
        try:
            if self.model is None:
                print("❌ No model trained yet")
                return []
            
            # Get the last record for features
            last_row = df.tail(1)
            
            # Extract features from last row
            feature_cols = ["hour", "month", "day", "year", "lag_1", "lag_2", "lag_3", "time_index", "store_encoded"]
            assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
            last_prepared = assembler.transform(last_row)
            last_scaled = self.scaler.transform(last_prepared)
            
            # Make predictions
            forecasts = []
            for i in range(steps):
                pred_df = self.model.transform(last_scaled)
                pred_value = pred_df.select("prediction").collect()[0][0]
                forecasts.append(float(pred_value))
            
            print(f"✅ Generated {steps}-step forecast: {[f'{v:.2f}' for v in forecasts]}")
            return forecasts
        except Exception as e:
            print(f"❌ Forecast error: {e}")
            return []
    
    def get_summary(self):
        """Return pipeline summary"""
        return {
            "model_type": "Spark MLlib Linear Regression",
            "metrics": self.metrics,
            "status": "trained" if self.model else "not_trained"
        }


def run_spark_pipeline(csv_path):
    """
    Execute complete Spark pipeline:
    1. Load data
    2. Preprocess
    3. Feature engineering
    4. Train model
    5. Forecast
    """
    print("\n" + "="*60)
    print("🚀 SPARK TIME-SERIES FORECASTING PIPELINE")
    print("="*60 + "\n")
    
    pipeline = SparkTimeSeriesPipeline()
    
    # Load data
    df = pipeline.load_data(csv_path)
    if df is None:
        return None
    
    # Preprocess
    df = pipeline.preprocess_data(df)
    if df is None:
        return None
    
    # Feature engineering
    df = pipeline.feature_engineering(df)
    if df is None:
        return None
    
    # Train model
    model, test_df = pipeline.train_model(df)
    if model is None:
        return None
    
    # Generate forecast
    forecast = pipeline.forecast(df, steps=5)
    
    print("="*60 + "\n")
    
    return pipeline


if __name__ == "__main__":
    # Test the pipeline
    csv_path = "data/data.csv"
    if os.path.exists(csv_path):
        pipeline = run_spark_pipeline(csv_path)
    else:
        print(f"❌ Data file not found: {csv_path}")
