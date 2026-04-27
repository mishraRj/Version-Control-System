import React from "react";
import { Navigate, useRoutes } from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepo from "./components/repo/CreateRepo";
import ShowRepo from "./components/repo/ShowRepo";
import Search from "./components/Search";
import ChatPage from "./components/chat/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./utils/auth";

const PublicOnlyRoute = ({ children }) => {
  if (isAuthenticated()) return <Navigate to="/" replace />;

  return children;
};

const ProjectRoutes = () => {
  let elements = useRoutes([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/auth",
      element: (
        <PublicOnlyRoute>
          <Login />
        </PublicOnlyRoute>
      ),
    },
    {
      path: "/signup",
      element: (
        <PublicOnlyRoute>
          <Signup />
        </PublicOnlyRoute>
      ),
    },
    {
      path: "/profile/:userName",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },
    {
      path: "/create",
      element: (
        <ProtectedRoute>
          <CreateRepo />
        </ProtectedRoute>
      ),
    },
    {
      path: "/search",
      element: (
        <ProtectedRoute>
          <Search />
        </ProtectedRoute>
      ),
    },
    {
      path: "/chat",
      element: (
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/:username/:repoName",
      element: (
        <ProtectedRoute>
          <ShowRepo />
        </ProtectedRoute>
      ),
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return elements;
};

export default ProjectRoutes;
