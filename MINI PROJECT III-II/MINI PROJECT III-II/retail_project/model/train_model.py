import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
import warnings
warnings.filterwarnings('ignore')

FILE_PATH = "data/data.csv"

def train_and_predict():
    """
    Train ARIMA model on sales data and return next 5 predictions.
    Falls back to LinearRegression if ARIMA fails.
    """
    try:
        df = pd.read_csv(FILE_PATH)
        
        if df.empty or "sales" not in df.columns:
            return []
        
        # convert timestamp
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        sales_data = df['sales'].astype(float).values
        
        # ARIMA needs at least 5 data points
        if len(sales_data) < 5:
            return linear_regression_forecast(df)
        
        try:
            # Try ARIMA(1,1,1) - p=1, d=1, q=1
            model = ARIMA(sales_data, order=(1, 1, 1))
            fitted_model = model.fit()
            
            # Forecast next 5 periods
            forecast_result = fitted_model.get_forecast(steps=5)
            predictions = forecast_result.predicted_mean.tolist()
            
            return [float(p) for p in predictions]
        except Exception as arima_error:
            print(f"ARIMA failed: {arima_error}, falling back to LinearRegression")
            return linear_regression_forecast(df)
            
    except Exception as e:
        print(f"Error in train_and_predict: {e}")
        return []


def linear_regression_forecast(df):
    """Fallback: LinearRegression forecast"""
    # feature engineering
    df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
    df['time_index'] = np.arange(len(df))

    # encode categorical columns
    df = pd.get_dummies(df, columns=['store_id', 'product_id'])

    # features & target
    X = df.drop(columns=['timestamp', 'sales'], errors='ignore')
    # Remove non-numeric columns
    X = X.select_dtypes(include=[np.number])
    y = df['sales']

    if len(X) == 0 or len(y) == 0:
        return []

    # train model
    model = LinearRegression()
    model.fit(X, y)

    # take last row
    last = X.iloc[-1:].copy()

    predictions = []

    for i in range(5):
        pred = model.predict(last)[0]
        predictions.append(float(pred))

        # move time forward
        last['time_index'] += 1

    return predictions


if __name__ == "__main__":
    preds = train_and_predict()
    print("Next 5 Predictions:", preds)
