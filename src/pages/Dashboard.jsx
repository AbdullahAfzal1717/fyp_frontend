import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/vitals");
      setSoldiers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p style={{ padding: "20px" }}>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;

  const criticalSoldiers = soldiers.filter((s) => s.riskLevel === "CRITICAL");

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1>🪖 Soldier Health Dashboard</h1>

      {criticalSoldiers.length > 0 && (
        <div
          style={{
            background: "#ffe5e5",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h2>🚨 Critical Alerts</h2>
          {criticalSoldiers.map((c) => (
            <p key={c._id}>
              Soldier <strong>{c.soldierId}</strong> is in CRITICAL condition
            </p>
          ))}
        </div>
      )}

      {soldiers.map((s) => (
        <div
          key={s._id}
          onClick={() => navigate(`/soldier/${s.soldierId}`)}
          style={{
            cursor: "pointer",
            border: "1px solid #ccc",
            marginBottom: "15px",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>Soldier ID: {s.soldierId}</h3>
          <p>❤️ Heart Rate: {s.heartRate}</p>
          <p>🌡️ Temperature: {s.temperature}</p>
          <p>🫁 SpO₂: {s.spo2}</p>

          <span
            style={{
              padding: "5px 12px",
              borderRadius: "12px",
              fontWeight: "bold",
              ...getRiskStyle(s.riskLevel),
            }}
          >
            {s.riskLevel}
          </span>
        </div>
      ))}
    </div>
  );
};

const getRiskStyle = (risk) => {
  if (risk === "CRITICAL") return { background: "#ffcccc", color: "#a10000" };
  if (risk === "WARNING") return { background: "#fff3cd", color: "#856404" };
  return { background: "#d4edda", color: "#155724" };
};

export default Dashboard;
