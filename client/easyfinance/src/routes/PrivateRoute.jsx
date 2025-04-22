// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("admin"));

  return admin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
