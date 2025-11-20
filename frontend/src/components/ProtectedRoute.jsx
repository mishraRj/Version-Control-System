import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // <-- correct import

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/auth" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/auth" replace />;
    }
  } catch {
    localStorage.clear();
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
