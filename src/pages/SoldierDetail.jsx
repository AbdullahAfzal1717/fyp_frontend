import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SoldierDetail = () => {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/vitals/${id}`);
        setHistory(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load soldier data");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  if (loading)
    return <p style={{ padding: "20px" }}>Loading soldier data...</p>;
  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;

  const current = history[0];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h2>🪖 Soldier {id} — Health Details</h2>

      {current && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            background:
              current.riskLevel === "CRITICAL"
                ? "#ffcccc"
                : current.riskLevel === "WARNING"
                ? "#fff3cd"
                : "#d4edda",
          }}
        >
          <strong>Current Status:</strong> {current.riskLevel}
        </div>
      )}

      {/* Heart Rate Chart */}
      <h3>❤️ Heart Rate Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(t) => new Date(t).toLocaleTimeString()}
          />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="heartRate" stroke="#ff0000" />
        </LineChart>
      </ResponsiveContainer>

      {/* Temperature Chart */}
      <h3>🌡️ Temperature Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(t) => new Date(t).toLocaleTimeString()}
          />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="temperature" stroke="#ff9900" />
        </LineChart>
      </ResponsiveContainer>

      {/* SpO2 Chart */}
      <h3>🫁 SpO₂ Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(t) => new Date(t).toLocaleTimeString()}
          />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="spo2" stroke="#0066ff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SoldierDetail;
