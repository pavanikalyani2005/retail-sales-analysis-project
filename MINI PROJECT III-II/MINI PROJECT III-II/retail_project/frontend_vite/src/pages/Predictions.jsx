import { useEffect, useState } from "react";
import axios from "axios";

export default function PredictionsPage() {
  const [sparkForecast, setSparkForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/spark-forecast")
      .then((res) => {
        setSparkForecast(res.data.forecast || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching forecast:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#555" }}>⏳ Loading forecasts...</p>
      </div>
    );
  }

  const futureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString();
  };

  return (
    <div style={{ backgroundColor: "#ecf0f1", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>🔮 Future Predictions</h1>
          <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
            AI-powered sales forecasts for the next 5 days using Spark MLlib model
          </p>
        </div>

        {/* Spark MLlib Forecast */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          overflow: "hidden",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          <div style={{
            padding: "20px",
            backgroundColor: "#2ecc71",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            ⚡ Spark MLlib Forecasts
          </div>
          <div style={{ padding: "20px" }}>
            <p style={{ color: "#7f8c8d", marginBottom: "20px", fontSize: "14px" }}>
              Distributed machine learning model for scalable predictions
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sparkForecast.map((value, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  borderLeft: "4px solid #2ecc71"
                }}>
                  <div>
                    <div style={{ fontWeight: "bold", color: "#2c3e50" }}>Day {idx + 1}</div>
                    <div style={{ fontSize: "12px", color: "#7f8c8d" }}>{futureDate(idx + 1)}</div>
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#2ecc71" }}>
                    ${value.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
