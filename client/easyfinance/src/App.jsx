import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegisterForm from "./components/forms/AdminRegisterForm";
import PrivateRoute from "./routes/PrivateRoute";
import "./App.css";
import AddClientForm from "./components/forms/ClientRegistration";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Loginpage";
import AgentDashboard from "./pages/AgentDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Separate Routes for Admin and Agent */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/agent-dashboard"
          element={
            <PrivateRoute allowedRole="agent">
              <AgentDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
