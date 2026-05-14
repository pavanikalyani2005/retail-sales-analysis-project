import { useEffect, useState } from "react";
import axios from "axios";

export default function TrendsPage() {
  const [data, setData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("http://127.0.0.1:8000/data"),
      axios.get("http://127.0.0.1:8000/kpis")
    ])
      .then(([dataRes, kpisRes]) => {
        const rawData = dataRes.data.data || [];
        setData(rawData);
        setKpis(kpisRes.data || kpisRes.data);

        // Calculate trends
        const sales = rawData.map(d => Number(d.sales || 0));
        const first10Avg = (sales.slice(0, 10).reduce((a, b) => a + b, 0) / Math.min(10, sales.length)).toFixed(2);
        const last10Avg = (sales.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, sales.length)).toFixed(2);
        const trend = ((last10Avg - first10Avg) / first10Avg * 100).toFixed(2);

        // Moving averages
        const ma5 = [];
        const ma10 = [];
        for (let i = 0; i < sales.length; i++) {
          if (i >= 4) {
            const sum5 = sales.slice(i - 4, i + 1).reduce((a, b) => a + b, 0);
            ma5.push((sum5 / 5).toFixed(2));
          }
          if (i >= 9) {
            const sum10 = sales.slice(i - 9, i + 1).reduce((a, b) => a + b, 0);
            ma10.push((sum10 / 10).toFixed(2));
          }
        }

        setTrends({
          first10Avg,
          last10Avg,
          trend,
          ma5: ma5.slice(-5),
          ma10: ma10.slice(-3),
          volatility: (Math.max(...sales) - Math.min(...sales)).toFixed(2),
          stdDev: (Math.sqrt(sales.reduce((sq, n) => sq + Math.pow(n - (sales.reduce((a, b) => a + b, 0) / sales.length || 0), 2), 0) / Math.max(1, sales.length))).toFixed(2)
        });

        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#555" }}>⏳ Loading trends...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ecf0f1", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>📈 Current Trends</h1>
          <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
            Analyze real-time sales trends, moving averages, and market patterns
          </p>
        </div>

        {/* Main Trend Indicator */}
        {trends && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            padding: "40px",
            marginBottom: "30px",
            textAlign: "center",
            borderTop: `4px solid ${trends.trend >= 0 ? "#2ecc71" : "#e74c3c"}`
          }}>
            <div style={{ fontSize: "14px", color: "#7f8c8d", marginBottom: "15px" }}>
              Overall Trend
            </div>
            <div style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: trends.trend >= 0 ? "#2ecc71" : "#e74c3c",
              marginBottom: "10px"
            }}>
              {trends.trend >= 0 ? "📈" : "📉"} {Math.abs(trends.trend)}%
            </div>
            <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
              {trends.trend >= 0 
                ? `Sales trending UP: ${trends.last10Avg} vs ${trends.first10Avg} (average)` 
                : `Sales trending DOWN: ${trends.last10Avg} vs ${trends.first10Avg} (average)`}
            </p>
          </div>
        )}

        {/* Statistics Grid */}
        {trends && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "40px"
          }}>
            {[
              { icon: "📊", label: "Volatility", value: `$${trends.volatility}`, desc: "Range between high/low" },
              { icon: "📉", label: "Std Deviation", value: trends.stdDev, desc: "Sales variability" },
              { icon: "📈", label: "Early Avg (First 10)", value: `$${trends.first10Avg}`, desc: "Period average" },
              { icon: "📍", label: "Recent Avg (Last 10)", value: `$${trends.last10Avg}`, desc: "Recent period" }
            ].map((stat, idx) => (
              <div key={idx} style={{
                backgroundColor: "white",
                padding: "25px",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>{stat.icon}</div>
                <div style={{ fontSize: "12px", color: "#7f8c8d", marginBottom: "8px" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: "22px", fontWeight: "bold", color: "#2c3e50", marginBottom: "8px" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "11px", color: "#95a5a6" }}>
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Moving Averages */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          marginBottom: "40px"
        }}>
          {/* MA 5 */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "20px",
              backgroundColor: "#3498db",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold"
            }}>
              📊 5-Day Moving Average
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ color: "#7f8c8d", marginBottom: "20px", fontSize: "13px" }}>
                Short-term trend smoothing
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {trends?.ma5.map((value, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "6px",
                    borderLeft: "3px solid #3498db"
                  }}>
                    <span style={{ color: "#555", fontWeight: "bold" }}>MA {idx + 1}</span>
                    <span style={{ color: "#3498db", fontWeight: "bold" }}>${value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MA 10 */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "20px",
              backgroundColor: "#2ecc71",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold"
            }}>
              📈 10-Day Moving Average
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ color: "#7f8c8d", marginBottom: "20px", fontSize: "13px" }}>
                Long-term trend smoothing
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {trends?.ma10.map((value, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "6px",
                    borderLeft: "3px solid #2ecc71"
                  }}>
                    <span style={{ color: "#555", fontWeight: "bold" }}>MA {10 - idx}</span>
                    <span style={{ color: "#2ecc71", fontWeight: "bold" }}>${value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Summary */}
        {kpis && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            padding: "30px"
          }}>
            <h2 style={{ color: "#2c3e50", marginBottom: "25px" }}>📊 Business KPIs</h2>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px"
            }}>
              {[
                { icon: "💰", label: "Total Sales", value: `$${kpis.total_sales.toFixed(2)}` },
                { icon: "📈", label: "Avg Order Value", value: `$${kpis.avg_order_value.toFixed(2)}` },
                { icon: "📦", label: "Order Count", value: kpis.order_count },
                { icon: "📊", label: "Avg Daily Sales", value: `$${kpis.avg_daily_sales.toFixed(2)}` },
                { icon: "📉", label: "Growth Rate", value: `${kpis.growth_rate.toFixed(2)}%` },
                { icon: "🏆", label: "Top Product", value: kpis.top_product }
              ].map((kpi, idx) => (
                <div key={idx} style={{
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  borderLeft: "4px solid #667eea",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>{kpi.icon}</div>
                  <div style={{ fontSize: "12px", color: "#7f8c8d", marginBottom: "8px" }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#2c3e50" }}>
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trend Insights */}
        <div style={{
          marginTop: "40px",
          backgroundColor: "#e8f8f5",
          border: "2px solid #16a085",
          borderRadius: "12px",
          padding: "25px"
        }}>
          <h3 style={{ color: "#16a085", marginBottom: "15px" }}>💡 Trend Insights</h3>
          <ul style={{ color: "#555", lineHeight: "1.9", paddingLeft: "20px" }}>
            <li>Moving averages help smooth out daily fluctuations</li>
            <li>5-day MA: Quick response to recent changes</li>
            <li>10-day MA: More stable, long-term trend indicator</li>
            <li>High volatility: Consider inventory buffers</li>
            <li>Growth rate: Monitor for seasonal patterns</li>
            <li>Cross-over points: Potential trend reversals</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
