import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      icon: "📊",
      title: "Real-Time Analytics",
      description: "Monitor sales trends and key metrics in real-time with Apache Spark distributed processing"
    },
    {
      icon: "🔮",
      title: "AI Forecasting",
      description: "Predict future sales using advanced ML models (Spark MLlib Linear Regression)"
    },
    {
      icon: "🚨",
      title: "Anomaly Detection",
      description: "Detect unusual sales patterns automatically with statistical z-score analysis"
    },
    {
      icon: "📈",
      title: "Trend Analysis",
      description: "Analyze sales trends with moving averages, growth rates, and seasonal patterns"
    },
    {
      icon: "🎯",
      title: "Data Insights",
      description: "Explore your data with interactive dashboards and detailed statistical summaries"
    },
    {
      icon: "⚙️",
      title: "Spark Pipeline",
      description: "Enterprise-grade big data processing with distributed feature engineering and model training"
    }
  ];

  const pages = [
    {
      icon: "📊",
      title: "Data Explorer",
      description: "View and explore raw data, statistics, and distributions",
      path: "/data",
      color: "#3498db"
    },
    {
      icon: "🔮",
      title: "Future Predictions",
      description: "See AI-powered forecasts for next 5 days (Spark MLlib)",
      path: "/predictions",
      color: "#2ecc71"
    },
    {
      icon: "📈",
      title: "Current Trends",
      description: "Analyze real-time market trends and sales patterns",
      path: "/trends",
      color: "#f39c12"
    },
    {
      icon: "📉",
      title: "Visualizations",
      description: "Interactive charts for anomalies, forecasts, and data",
      path: "/visualizations",
      color: "#e74c3c"
    }
  ];

  return (
    <div style={{ backgroundColor: "#ecf0f1", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "80px 20px",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ fontSize: "48px", marginBottom: "20px", fontWeight: "bold" }}>
          Big Data Analytics and Forecasting
        </h1>
        <p style={{ fontSize: "20px", marginBottom: "30px", opacity: 0.9 }}>
          Enterprise-grade time-series forecasting and anomaly detection powered by Spark MLlib
        </p>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/visualizations" style={{
            backgroundColor: "white",
            color: "#667eea",
            padding: "12px 30px",
            borderRadius: "25px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            📊 View Dashboard
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: "60px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", color: "#2c3e50", marginBottom: "50px" }}>
          ✨ Platform Features
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px"
        }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
              transition: "all 0.3s",
              cursor: "pointer",
              border: "2px solid transparent"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
              e.currentTarget.style.borderColor = "#667eea";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = "transparent";
            }}
            >
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>{feature.icon}</div>
              <h3 style={{ color: "#2c3e50", marginBottom: "10px", fontSize: "18px" }}>
                {feature.title}
              </h3>
              <p style={{ color: "#7f8c8d", lineHeight: "1.6", fontSize: "14px" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pages Navigation Section */}
      <div style={{ padding: "60px 20px", backgroundColor: "white", marginTop: "40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "32px", color: "#2c3e50", marginBottom: "10px" }}>
            📍 Navigation Hub
          </h2>
          <p style={{ textAlign: "center", color: "#7f8c8d", marginBottom: "50px", fontSize: "16px" }}>
            Explore different sections of the platform
          </p>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px"
          }}>
            {pages.map((page, idx) => (
              <Link key={idx} to={page.path} style={{ textDecoration: "none" }}>
                <div style={{
                  backgroundColor: "white",
                  border: `3px solid ${page.color}`,
                  padding: "30px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
                  e.currentTarget.style.backgroundColor = page.color;
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.08)";
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "black";
                }}
                >
                  <div style={{ fontSize: "50px", marginBottom: "15px", textAlign: "center" }}>
                    {page.icon}
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px", textAlign: "center" }}>
                    {page.title}
                  </h3>
                  <p style={{ fontSize: "14px", lineHeight: "1.6", textAlign: "center", flex: 1 }}>
                    {page.description}
                  </p>
                  <div style={{ textAlign: "center", marginTop: "20px", fontSize: "18px" }}>
                    ➜
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div style={{ padding: "60px 20px", backgroundColor: "#2c3e50", color: "white", marginTop: "40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "28px", marginBottom: "40px" }}>
            ⚙️ Technology Stack
          </h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
            textAlign: "center"
          }}>
            <div>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔥</div>
              <h3>Backend</h3>
              <p style={{ fontSize: "14px", color: "#bdc3c7" }}>
                FastAPI • Apache Spark • PySpark MLlib • Python 3.14
              </p>
            </div>
            <div>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>⚛️</div>
              <h3>Frontend</h3>
              <p style={{ fontSize: "14px", color: "#bdc3c7" }}>
                React 19 • Vite 7.3 • Chart.js 4.5 • React Router
              </p>
            </div>
            <div>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📊</div>
              <h3>Data Processing</h3>
              <p style={{ fontSize: "14px", color: "#bdc3c7" }}>
                Spark DataFrames • Feature Engineering • Z-Score Analysis
              </p>
            </div>
            <div>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>🤖</div>
              <h3>ML Models</h3>
              <p style={{ fontSize: "14px", color: "#bdc3c7" }}>
                Linear Regression • ARIMA • Statsmodels • Spark MLlib
              </p>
            </div>
            <div>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📈</div>
              <h3>Metrics</h3>
              <p style={{ fontSize: "14px", color: "#bdc3c7" }}>
                MAE • RMSE • R² • MSE • RegressionMetrics
              </p>
            </div>
            <div>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>🚀</div>
              <h3>Deployment</h3>
              <p style={{ fontSize: "14px", color: "#bdc3c7" }}>
                Docker • Kubernetes • YARN • Cloud Ready
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ padding: "60px 20px", backgroundColor: "#ecf0f1" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "30px",
            textAlign: "center"
          }}>
            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "#3498db" }}>24</div>
              <p style={{ color: "#7f8c8d", marginTop: "10px" }}>Data Records</p>
            </div>
            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "#2ecc71" }}>5</div>
              <p style={{ color: "#7f8c8d", marginTop: "10px" }}>Forecast Steps</p>
            </div>
            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "#e74c3c" }}>2</div>
              <p style={{ color: "#7f8c8d", marginTop: "10px" }}>Anomalies Detected</p>
            </div>
            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "#9b59b6" }}>0.7854</div>
              <p style={{ color: "#7f8c8d", marginTop: "10px" }}>Model R² Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "30px 20px", backgroundColor: "#2c3e50", color: "white", textAlign: "center", marginTop: "40px" }}>
        <p>🚀 Apache Spark Big Data Analytics Platform | Production-Ready Dashboard</p>
        <p style={{ fontSize: "12px", color: "#95a5a6", marginTop: "10px" }}>
          Distributed Data Processing • Real-time Analytics • ML Forecasting
        </p>
      </div>
    </div>
  );
}
