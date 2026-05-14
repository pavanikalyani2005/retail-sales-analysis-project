import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Data from "./pages/Data";
import Predictions from "./pages/Predictions";
import Trends from "./pages/Trends";
import Visualizations from "./pages/Visualizations";

function App() {
  return (
    <Router>
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
        <header style={{ background: "white", padding: "12px 20px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 22 }}>🚀 Retail Analytics</div>
            <nav style={{ display: "flex", gap: 12, marginLeft: 12 }}>
              <Link to="/" style={{ textDecoration: "none", color: "#333" }}>Home</Link>
              <Link to="/data" style={{ textDecoration: "none", color: "#333" }}>Data</Link>
              <Link to="/predictions" style={{ textDecoration: "none", color: "#333" }}>Predictions</Link>
              <Link to="/trends" style={{ textDecoration: "none", color: "#333" }}>Trends</Link>
              <Link to="/visualizations" style={{ textDecoration: "none", color: "#333" }}>Visualizations</Link>
            </nav>
          </div>
          <div style={{ fontSize: 13, color: "#7f8c8d" }}>Local • dev</div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/data" element={<Data />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/visualizations" element={<Visualizations />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
