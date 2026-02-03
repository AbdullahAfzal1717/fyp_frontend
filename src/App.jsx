import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SoldierDetail from "./pages/SoldierDetail";
import SoldierRoster from "./pages/SoldierRoster";
import RegisterSoldier from "./pages/RegisterSoldier";
import SuperAdminDashboard from "./pages/SuperAdminDashboard"; // New Page
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar/Sidebar";
import ManageSectors from "./pages/ManageSectors";

// Professional Layout Wrapper
const Layout = ({ children }) => (
  <div className="flex h-screen overflow-hidden bg-slate-950">
    <Sidebar />
    <div className="flex-1 overflow-y-auto">{children}</div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* GHQ SUPER ADMIN ROUTE */}
      <Route
        path="/admin-hq"
        element={
          <ProtectedRoute requiredRole="SUPER_ADMIN">
            <Layout>
              <SuperAdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-sectors"
        element={
          <ProtectedRoute requiredRole="SUPER_ADMIN">
            <Layout>
              {" "}
              <ManageSectors />{" "}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* COMMANDER ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="COMMANDER">
            <Layout>
              {" "}
              <Dashboard />{" "}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/roster"
        element={
          <ProtectedRoute requiredRole="COMMANDER">
            <Layout>
              {" "}
              <SoldierRoster />{" "}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/register-soldier"
        element={
          <ProtectedRoute requiredRole="COMMANDER">
            <Layout>
              {" "}
              <RegisterSoldier />{" "}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/soldier/:id"
        element={
          <ProtectedRoute requiredRole="COMMANDER">
            <Layout>
              {" "}
              <SoldierDetail />{" "}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
