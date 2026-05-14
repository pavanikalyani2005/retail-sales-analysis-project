# model/anomaly.py

import numpy as np

def detect_anomalies(data):
    """
    Detect anomalies using z-score method.
    Returns list of (index, value) tuples for anomalies.
    """
    if not data or len(data) < 2:
        return []
    
    data_array = np.array(data, dtype=float)
    mean = np.mean(data_array)
    std = np.std(data_array)
    
    if std == 0:
        return []
    
    anomalies = []
    
    for i, value in enumerate(data_array):
        z_score = abs((value - mean) / std)
        if z_score > 2:  # z-score > 2 is considered anomaly
            anomalies.append((i, float(value)))
    
    return anomalies
