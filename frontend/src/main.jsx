import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./authContext.jsx";
import NavBar from "./components/NavBar";
import ProjectRoutes from "./Routes.jsx";
import { BrowserRouter as Router } from "react-router-dom";
createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Router>
      <NavBar />
      <ProjectRoutes />
    </Router>
  </AuthProvider>
);
