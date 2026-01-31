import {  Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SoldierDetail from "./pages/SoldierDetail";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/soldier/:id"
          element={
            <ProtectedRoute>
              <SoldierDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}

export default App;
