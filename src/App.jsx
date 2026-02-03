import { Routes, Route, Navigate } from "react-router-dom";
import SuperAdminDashboard from "./pages/SuperAdmin/AdminDashboard/SuperAdminDashboard";
import ManageSectors from "./pages/SuperAdmin/ManageSectors/ManageSectors";
import Dashboard from "./pages/Viewer/Dashboard/Dashboard";
import Sidebar from "./components/Sidebar/Sidebar";
import RegisterSoldier from "./pages/Viewer/RegisterSoldier/RegisterSoldier";
import SoldierRoster from "./pages/Viewer/SoldeirRoster/SoldierRoster";
import SoldierDetail from "./pages/Viewer/SoldierDetails/SoldierDetail";
import Login from "./pages/Auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";

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
