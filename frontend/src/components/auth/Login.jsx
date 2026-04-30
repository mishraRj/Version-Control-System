import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import { PageHeader, Box } from "@primer/react";
import "./auth.css";
import AuthToast from "./AuthToast";

import logo from "../../assets/github-mark-white.svg";
import { Link } from "react-router-dom";

const getAuthErrorMessage = (err, fallbackMessage) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  fallbackMessage;

const Login = () => {
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { setCurrentUser } = useAuth();

  const handleLogin = async e => {
    const apiUrl = import.meta.env.VITE_API_URL;
    e.preventDefault();

    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setToastMessage("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/login`, {
        email: normalizedEmail,
        password: normalizedPassword,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setToastMessage(
        getAuthErrorMessage(
          err,
          "Login failed. Please check your email and password.",
        ),
      );
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <AuthToast
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
      <div className="login-logo-container">
        <img className="logo-login" src={logo} alt="Logo" />
      </div>

      <div className="login-box-wrapper">
        <div className="login-heading">
          <Box sx={{ padding: 1 }}>
            <PageHeader>
              <PageHeader.TitleArea variant="large">
                <PageHeader.Title>Sign in to G!tHub</PageHeader.Title>
              </PageHeader.TitleArea>
            </PageHeader>
          </Box>
        </div>
        <form className="login-box" onSubmit={handleLogin}>
          <div>
            <label className="label">Email address</label>
            <input
              autoComplete="off"
              name="Email"
              id="Email"
              className="input"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="div">
            <label className="label">Password</label>
            <input
              autoComplete="off"
              name="Password"
              id="Password"
              className="input"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            variant="primary"
            type="submit"
            className="btn btn-success login-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign in"}
          </button>
        </form>
        <div className="pass-box">
          <p>
            New to GitHub? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
