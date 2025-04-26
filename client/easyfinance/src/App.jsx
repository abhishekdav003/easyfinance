import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegisterForm from "./components/forms/AdminRegisterForm";
import PrivateRoute from "./routes/PrivateRoute";
import "./App.css"
import AddClientForm from "./components/forms/ClientRegistration";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminRegisterForm />} />
        <Route path="/login" element={<AdminLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
              
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
