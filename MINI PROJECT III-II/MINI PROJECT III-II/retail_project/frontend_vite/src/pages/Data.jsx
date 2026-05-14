import { useEffect, useState } from "react";
import axios from "axios";

export default function DataPage() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/data")
      .then((res) => {
        const rawData = res.data.data || [];
        setData(rawData);

        // Calculate statistics
        const sales = rawData.map(d => Number(d.sales || 0));
        const prices = rawData.map(d => Number(d.price || 0));

        setStats({
          totalRecords: rawData.length,
          avgSales: (sales.reduce((a, b) => a + b, 0) / sales.length).toFixed(2),
          maxSales: Math.max(...sales).toFixed(2),
          minSales: Math.min(...sales).toFixed(2),
          avgPrice: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
          maxPrice: Math.max(...prices).toFixed(2),
          minPrice: Math.min(...prices).toFixed(2),
          uniqueStores: [...new Set(rawData.map(d => d.store_id))].length,
          uniqueProducts: [...new Set(rawData.map(d => d.product_id))].length
        });

        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#555" }}>⏳ Loading data...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ecf0f1", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>📊 Data Explorer</h1>
          <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
            Explore and analyze raw transaction data with detailed statistics
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            marginBottom: "40px"
          }}>
            {[
              { icon: "📦", label: "Total Records", value: stats.totalRecords },
              { icon: "💰", label: "Avg Sales", value: `$${stats.avgSales}` },
              { icon: "📈", label: "Max Sales", value: `$${stats.maxSales}` },
              { icon: "📉", label: "Min Sales", value: `$${stats.minSales}` },
              { icon: "💵", label: "Avg Price", value: `$${stats.avgPrice}` },
              { icon: "🏪", label: "Stores", value: stats.uniqueStores },
              { icon: "🏷️", label: "Products", value: stats.uniqueProducts },
              { icon: "📊", label: "Price Range", value: `$${stats.minPrice}-$${stats.maxPrice}` }
            ].map((stat, idx) => (
              <div key={idx} style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
                <div style={{ fontSize: "12px", color: "#7f8c8d", marginBottom: "8px" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#2c3e50" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Data Table */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "20px",
            backgroundColor: "#667eea",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            📋 Transaction Data ({sortedData.length} records)
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#ecf0f1", borderBottom: "2px solid #bdc3c7" }}>
                  {["timestamp", "store_id", "product_id", "sales", "price"].map(col => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      style={{
                        padding: "15px",
                        textAlign: "left",
                        cursor: "pointer",
                        fontWeight: "bold",
                        color: "#2c3e50",
                        userSelect: "none",
                        backgroundColor: sortColumn === col ? "#d5dce1" : "#ecf0f1",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#d5dce1"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = sortColumn === col ? "#d5dce1" : "#ecf0f1"}
                    >
                      {col === "timestamp" ? "⏰" : col === "store_id" ? "🏪" : col === "product_id" ? "📦" : col === "sales" ? "💰" : "💵"} {col}
                      {sortColumn === col && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid #ecf0f1",
                      backgroundColor: idx % 2 === 0 ? "white" : "#f9f9f9",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0ff"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "white" : "#f9f9f9"}
                  >
                    <td style={{ padding: "12px", color: "#555" }}>
                      {row.timestamp}
                    </td>
                    <td style={{ padding: "12px", color: "#555", fontWeight: "bold" }}>
                      {row.store_id}
                    </td>
                    <td style={{ padding: "12px", color: "#555", fontWeight: "bold" }}>
                      {row.product_id}
                    </td>
                    <td style={{ padding: "12px", color: "#2ecc71", fontWeight: "bold" }}>
                      ${row.sales.toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", color: "#3498db", fontWeight: "bold" }}>
                      ${row.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            padding: "15px 20px",
            backgroundColor: "#ecf0f1",
            fontSize: "12px",
            color: "#7f8c8d"
          }}>
            💡 Click on column headers to sort data
          </div>
        </div>
      </div>
    </div>
  );
}
