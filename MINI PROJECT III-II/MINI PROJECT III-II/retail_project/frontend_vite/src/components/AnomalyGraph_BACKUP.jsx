import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

function AnomalyGraph() {
  const [data, setData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [pipelineInfo, setPipelineInfo] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch date range and pipeline info on mount
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/date-range")
      .then((res) => {
        setMinDate(res.data.min_date);
        setMaxDate(res.data.max_date);
        setStartDate(res.data.min_date);
        setEndDate(res.data.max_date);
      })
      .catch(err => console.error("Error fetching date range:", err));

    axios.get("http://127.0.0.1:8000/pipeline-info")
      .then((res) => {
        setPipelineInfo(res.data);
      })
      .catch(err => console.error("Error fetching pipeline info:", err));

    axios.get("http://127.0.0.1:8000/model-metrics")
      .then((res) => {
        setMetrics(res.data);
      })
      .catch(err => console.error("Error fetching metrics:", err));
  }, []);

  // Fetch data when dates change
  useEffect(() => {
    if (!startDate || !endDate) return;

    setLoading(true);
    
    const params = {
      start_date: startDate,
      end_date: endDate
    };

    Promise.all([
      axios.get("http://127.0.0.1:8000/anomaly", { params }),
      axios.get("http://127.0.0.1:8000/forecast"),
      axios.get("http://127.0.0.1:8000/kpis", { params })
    ])
      .then(([anomalyRes, forecastRes, kpisRes]) => {
        setData(anomalyRes.data.data);
        setAnomalies(anomalyRes.data.anomalies);
        setForecast(forecastRes.data.forecast);
        setKpis(kpisRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, [startDate, endDate]);

  // Create chart data
  const dataLength = data.length;
  
  // Generate labels with proper time indicators
  const allLabels = [
    ...data.map((_, i) => `T${i}`),
    ...forecast.map((_, i) => `F${i + 1}`)
  ];

  // Actual sales line (blue) - solid line for history
  const actualDataPoints = [...data, ...forecast.map(() => null)];

  // Anomaly points (red dots) - ONLY show at indices where anomalies exist
  const anomalyDataPoints = data.map((val, i) =>
    anomalies.includes(i) ? val : null
  );
  anomalyDataPoints.push(...forecast.map(() => null));

  // Forecast line (green) - dashed line for future
  const forecastDataPoints = data.map(() => null);
  forecastDataPoints.push(...forecast);

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: "🔵 Actual Sales",
        data: actualDataPoints,
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        fill: true,
        tension: 0.4,
        spanGaps: false,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: "🔴 Anomalies",
        data: anomalyDataPoints,
        borderColor: "#e74c3c",
        backgroundColor: "#e74c3c",
        pointRadius: 10,
        pointHoverRadius: 12,
        pointStyle: "circle",
        showLine: false,
        fill: false,
        tension: 0
      },
      {
        label: "🟢 Forecast (ARIMA)",
        data: forecastDataPoints,
        borderColor: "#2ecc71",
        backgroundColor: "rgba(46, 204, 113, 0.1)",
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        spanGaps: false,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: { size: 14 },
          padding: 15,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: "📊 Spark-Based Time-Series Analytics & Forecasting",
        font: {
          size: 18,
          weight: "bold"
        },
        padding: 20
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time Period"
        }
      },
      y: {
        title: {
          display: true,
          text: "Sales ($)"
        },
        beginAtZero: false
      }
    }
  };

  const KPICard = ({ title, value, icon, color }) => (
    <div style={{
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      border: `3px solid ${color}`,
      textAlign: "center",
      transition: "transform 0.2s",
      cursor: "pointer"
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "12px", color: "#888", fontWeight: "bold" }}>{title}</div>
      <div style={{ fontSize: "20px", fontWeight: "bold", color: "#2c3e50", marginTop: "8px" }}>{value}</div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: "#ecf0f1",
      padding: "20px",
      borderRadius: "5px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>📊 Spark-Based Time-Series Analytics & Forecasting</h1>
      <p style={{ color: "#7f8c8d", marginBottom: "20px", fontSize: "14px" }}>
        Real-time distributed data processing with feature engineering and MLlib models
      </p>

      {/* Date Range Filter */}
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <label style={{ marginRight: "15px", fontWeight: "bold", color: "#2c3e50" }}>
          From:
          <input
            type="date"
            value={startDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #bdc3c7",
              cursor: "pointer"
            }}
          />
        </label>
        <label style={{ marginRight: "15px", fontWeight: "bold", color: "#2c3e50" }}>
          To:
          <input
            type="date"
            value={endDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #bdc3c7",
              cursor: "pointer"
            }}
          />
        </label>
      </div>

      {/* Model Metrics Section */}
      {metrics && (
        <div style={{
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "15px"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "20px", marginBottom: "5px" }}>📊</div>
            <div style={{ fontSize: "11px", color: "#7f8c8d", fontWeight: "bold" }}>MAE</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2c3e50" }}>
              {typeof metrics.metrics?.mae === 'number' ? metrics.metrics.mae.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "20px", marginBottom: "5px" }}>📈</div>
            <div style={{ fontSize: "11px", color: "#7f8c8d", fontWeight: "bold" }}>RMSE</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2c3e50" }}>
              {typeof metrics.metrics?.rmse === 'number' ? metrics.metrics.rmse.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "20px", marginBottom: "5px" }}>📉</div>
            <div style={{ fontSize: "11px", color: "#7f8c8d", fontWeight: "bold" }}>R²</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2c3e50" }}>
              {typeof metrics.metrics?.r2 === 'number' ? metrics.metrics.r2.toFixed(4) : 'N/A'}
            </div>
          </div>
          <div style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "20px", marginBottom: "5px" }}>🎯</div>
            <div style={{ fontSize: "11px", color: "#7f8c8d", fontWeight: "bold" }}>MSE</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2c3e50" }}>
              {typeof metrics.metrics?.mse === 'number' ? metrics.metrics.mse.toFixed(2) : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {kpis && (
        <div style={{
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "10px"
        }}>
          <KPICard 
            title="Total Sales" 
            value={`$${kpis.total_sales.toFixed(2)}`} 
            icon="💰" 
            color="#3498db"
          />
          <KPICard 
            title="Avg Order Value" 
            value={`$${kpis.avg_order_value.toFixed(2)}`} 
            icon="📈" 
            color="#2ecc71"
          />
          <KPICard 
            title="Order Count" 
            value={kpis.order_count} 
            icon="📦" 
            color="#e74c3c"
          />
          <KPICard 
            title="Avg Daily Sales" 
            value={`$${kpis.avg_daily_sales.toFixed(2)}`} 
            icon="📊" 
            color="#f39c12"
          />
          <KPICard 
            title="Growth Rate" 
            value={`${kpis.growth_rate.toFixed(2)}%`} 
            icon="📉" 
            color={kpis.growth_rate >= 0 ? "#27ae60" : "#c0392b"}
          />
          <KPICard 
            title="Anomalies Detected" 
            value={kpis.anomaly_count} 
            icon={kpis.anomaly_count > 0 ? "🚨" : "✅"} 
            color={kpis.anomaly_count > 0 ? "#e74c3c" : "#2ecc71"}
          />
          <KPICard 
            title="Top Product" 
            value={kpis.top_product} 
            icon="🏆" 
            color="#34495e"
          />
          <KPICard 
            title="Top Store" 
            value={kpis.top_store} 
            icon="🏪" 
            color="#16a085"
          />
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px", backgroundColor: "white", borderRadius: "8px" }}>
          <p style={{ fontSize: "18px", color: "#555" }}>⏳ Loading dashboard...</p>
        </div>
      ) : data.length > 0 ? (
        <div style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{ position: "relative", height: "400px" }}>
            <Line data={chartData} options={options} />
          </div>
          <div style={{ marginTop: "25px", textAlign: "left" }}>
            <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>📖 Dashboard Guide</h3>
            <ul style={{ lineHeight: "2", color: "#555" }}>
              <li>🔵 <strong>Blue Line (Actual Sales):</strong> Historical sales data from distributed data sources</li>
              <li>🔴 <strong>Red Dots (Anomalies):</strong> Unusual sales patterns detected using z-score analysis on Spark</li>
              <li>🟢 <strong>Green Dashed Line (Forecast):</strong> Next 5 periods predicted using Spark MLlib Linear Regression</li>
              <li>📊 <strong>Model Metrics:</strong> MAE & RMSE calculated on test dataset using distributed evaluation</li>
            </ul>
            <hr style={{ margin: "20px 0", borderColor: "#eee" }} />
            <p style={{ fontSize: "12px", color: "#999" }}>
              Last updated: {new Date().toLocaleTimeString()} | Data points: {data.length} | Forecast steps: {forecast.length}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "80px 20px", backgroundColor: "white", borderRadius: "8px" }}>
          <p style={{ fontSize: "18px", color: "#555" }}>No data available for selected date range</p>
        </div>
      )}

      {/* Pipeline Info Footer */}
      {pipelineInfo && (
        <div style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>⚙️ Pipeline Architecture</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            <div>
              <h4 style={{ color: "#3498db", marginBottom: "10px" }}>Components</h4>
              <ul style={{ color: "#555", lineHeight: "1.8", paddingLeft: "20px" }}>
                {pipelineInfo.components && pipelineInfo.components.map((comp, idx) => (
                  <li key={idx}>{comp}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: "#2ecc71", marginBottom: "10px" }}>Features</h4>
              <ul style={{ color: "#555", lineHeight: "1.8", paddingLeft: "20px" }}>
                {pipelineInfo.features && pipelineInfo.features.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnomalyGraph;
