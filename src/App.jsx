import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SoldierDetail from "./pages/SoldierDetail";
import SoldierRoster from "./pages/SoldierRoster";
import RegisterSoldier from "./pages/RegisterSoldier";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar/Sidebar";

// A wrapper to add the Sidebar to protected pages
const Layout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1">{children}</div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
            <Layout>
              {" "}
              <SoldierDetail />{" "}
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
