import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import { PageHeader, Box } from "@primer/react";
import BrandName from "../BrandName";
import "./auth.css";
import AuthToast from "./AuthToast";

import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

const getAuthErrorMessage = (err, fallbackMessage) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  fallbackMessage;

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { setCurrentUser } = useAuth();

  const handleSignup = async e => {
    const apiUrl = import.meta.env.VITE_API_URL;
    e.preventDefault();

    const normalizedEmail = email.trim();
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedEmail || !normalizedPassword) {
      setToastMessage("Username, email, and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/signup`, {
        email: normalizedEmail,
        password: normalizedPassword,
        username: normalizedUsername,
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
          "Signup failed. Please check the entered details and try again.",
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
                <PageHeader.Title>
                  Sign Up to <BrandName />
                </PageHeader.Title>
              </PageHeader.TitleArea>
            </PageHeader>
          </Box>
        </div>

        <form className="login-box" onSubmit={handleSignup}>
          <div>
            <label className="label">Username</label>
            <input
              autoComplete="off"
              name="username"
              id="username"
              className="input"
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

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
            {loading ? "Loading..." : "Create an account"}
          </button>
        </form>

        <div className="pass-box">
          <p>
            Already have an account? <Link to="/auth">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
