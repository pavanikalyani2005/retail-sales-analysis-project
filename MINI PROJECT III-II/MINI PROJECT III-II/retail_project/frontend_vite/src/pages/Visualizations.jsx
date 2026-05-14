import { useEffect, useState } from "react";
import axios from "axios";
import 'chart.js/auto';
import { Line, Bar, Pie } from "react-chartjs-2";

export default function VisualizationsPage() {
  const [data, setData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [forecast, setForecast] = useState([]);
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = (s = startDate, e = endDate) => {
    setLoading(true);
    Promise.all([
      axios.get("http://127.0.0.1:8000/data", { params: { start_date: s || undefined, end_date: e || undefined } }),
      axios.get("http://127.0.0.1:8000/anomaly", { params: { start_date: s || undefined, end_date: e || undefined } }),
      axios.get("http://127.0.0.1:8000/kpis", { params: { start_date: s || undefined, end_date: e || undefined } })
    ])
    .then(([dataRes, anomalyRes]) => {
      setData(dataRes.data.data || []);
      const anomaliesRaw = anomalyRes.data.anomalies || [];
      const anomaliesMapped = Array.isArray(anomaliesRaw) && anomaliesRaw.length && typeof anomaliesRaw[0] === 'number'
        ? anomaliesRaw.map(idx => [idx, (dataRes.data.data?.[idx]?.sales ?? null)])
        : anomaliesRaw;
      setAnomalies(anomaliesMapped);
      setKpis(dataRes.data.metadata || (anomalyRes.data.metadata || null));
      setKpis(prev => prev || (dataRes.data.kpis || null));
      setKpis(kpis || (dataRes.data.kpis || null));
      setKpis(kpis || null);
      setKpis(dataRes.data.kpis || dataRes.data.metadata || null);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching visualization data:", err);
      setLoading(false);
    });
  };

  const fetchForecast = (s = startDate, e = endDate) => {
    axios.get("http://127.0.0.1:8000/spark-forecast", { params: { start_date: s || undefined, end_date: e || undefined } })
      .then(res => {
        const f = res.data.forecast || res.data || [];
        setForecast(f);
      })
      .catch(err => {
        console.error('Forecast error', err);
        setForecast([]);
      });
  };

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#555" }}>⏳ Loading visualizations...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#555" }}>No data available to render visualizations.</p>
        <p style={{ fontSize: "14px", color: "#888" }}>Make sure the backend `/data` endpoint is returning records.</p>
      </div>
    );
  }

  const labels = data.map((_, i) => `T${i}`);
  const sales = data.map(d => d.sales);

  // layout safety: ensure charts have enough height on small screens
  const chartStyle = { height: 260 };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    }
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: "Sales",
        data: sales,
        borderColor: "#3498db",
        backgroundColor: "rgba(52,152,219,0.1)",
        tension: 0.3,
        fill: true
      }
    ]
  };

  const barData = {
    labels: data.map(d => d.product_id),
    datasets: [
      {
        label: "Sales by Product",
        data: data.map(d => d.sales),
        backgroundColor: data.map(() => `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.7)`),
      }
    ]
  };

  const storeCounts = data.reduce((acc, row) => {
    acc[row.store_id] = (acc[row.store_id] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(storeCounts),
    datasets: [
      {
        data: Object.values(storeCounts),
        backgroundColor: ["#3498db", "#2ecc71", "#f39c12", "#e74c3c"],
      }
    ]
  };

  return (
    <div style={{ backgroundColor: "#ecf0f1", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>📊 Visualizations</h1>
        <p style={{ color: "#7f8c8d", fontSize: "16px", marginBottom: "30px" }}>
          Interactive charts showing sales, breakdowns, and anomalies
        </p>

        {/* Controls: date range */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: 14 }}>From:&nbsp;
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </label>
          <label style={{ fontSize: 14 }}>To:&nbsp;
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </label>
          <button onClick={() => { fetchAll(startDate, endDate); fetchForecast(); }} style={{ padding: "8px 14px", cursor: "pointer" }}>Apply</button>
          <button onClick={() => fetchForecast()} style={{ padding: "8px 14px", cursor: "pointer" }}>Run Forecast</button>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { icon: "💰", label: "Total Sales", value: `$${kpis.total_sales?.toFixed?.(2) ?? kpis.total_sales ?? 'N/A'}` },
              { icon: "📈", label: "Avg Daily", value: `$${kpis.avg_daily_sales?.toFixed?.(2) ?? kpis.avg_daily_sales ?? 'N/A'}` },
              { icon: "📦", label: "Orders", value: kpis.order_count ?? 'N/A' },
              { icon: "📉", label: "Growth %", value: `${kpis.growth_rate?.toFixed?.(2) ?? kpis.growth_rate ?? 'N/A'}%` }
            ].map((stat, idx) => (
              <div key={idx} style={{ background: "white", padding: 14, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>{stat.icon}</div>
                <div style={{ fontSize: 12, color: "#7f8c8d" }}>{stat.label}</div>
                <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 6 }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Forecast Results */}
        {forecast && forecast.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 10 }}>🔮 Forecast (Spark MLlib)</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {forecast.map((v, i) => (
                <div key={i} style={{ background: 'white', padding: 12, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: 100, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#7f8c8d' }}>Day {i+1}</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginTop: 6 }}>${Number(v).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", minHeight: 320 }}>
            <h3 style={{ marginBottom: "12px" }}>Line Chart - Sales Over Time</h3>
            <div style={chartStyle}><Line data={lineData} options={chartOptions} /></div>
          </div>

          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", minHeight: 320 }}>
            <h3 style={{ marginBottom: "12px" }}>Bar Chart - Sales by Product</h3>
            <div style={chartStyle}><Bar data={barData} options={chartOptions} /></div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", minHeight: 260 }}>
            <h3 style={{ marginBottom: "12px" }}>Pie Chart - Store Distribution</h3>
            <div style={{ width: "100%", height: 220 }}><Pie data={pieData} options={chartOptions} /></div>
          </div>

          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "12px" }}>Anomalies</h3>
            <div style={{ color: "#e74c3c", fontWeight: "bold" }}>{anomalies.length} anomalies detected</div>
            <ul style={{ marginTop: "10px" }}>
              {anomalies.map((a, idx) => (
                <li key={idx}>Index: {a[0]} — Value: {a[1]}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
