import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRole }) => {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const agent = JSON.parse(localStorage.getItem("agent"));

  if (allowedRole === "admin" && admin) {
    return children;
  }

  if (allowedRole === "agent" && agent) {
    return children;
  }

  // If neither match, redirect to login
  return <Navigate to="/login" />;
};

export default PrivateRoute;
