import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import BrandName from "./BrandName";
import "./navbar.css";
import logo from "../assets/logo.png";
import io from "socket.io-client";
import {
  RepoIcon,
  StarIcon,
  SignOutIcon,
  PersonIcon,
  CommentIcon,
} from "@primer/octicons-react";

const NavBar = ({ onUserSearch }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const { setCurrentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (userId) {
        try {
          const response = await axios.get(
            `${apiUrl}/getUserProfile/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, [apiUrl]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth");
  };

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchUnreadChatCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const res = await axios.get(`${apiUrl}/previousChats/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const conversations = res.data.users || [];
      const count = conversations.reduce(
        (acc, c) => acc + (c.unreadCount || 0),
        0,
      );
      setUnreadChatCount(count);
    } catch {
      try {
        const token = localStorage.getItem("token");
        const fallbackRes = await axios.get(`${apiUrl}/chat/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const conversations = fallbackRes.data.conversations || [];
        const count = conversations.reduce(
          (acc, c) => acc + (c.unreadCount || 0),
          0,
        );
        setUnreadChatCount(count);
      } catch (fallbackErr) {
        console.error("Unable to fetch unread chat count:", fallbackErr);
      }
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchUnreadChatCount();
  }, [fetchUnreadChatCount]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) return;

    const socket = io(apiUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("joinRoom", userId);
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl]);

  const handleSearch = async () => {
    // Update the URL with query param (q=...)
    if (searchValue) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    } else {
      navigate("/");
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/searchUser/${searchValue}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onUserSearch) {
        onUserSearch(response.data.users || []);
      }
      console.log("Search result:", response.data);
    } catch (err) {
      if (onUserSearch) onUserSearch([]);
      console.error("Error while searching user:", err);
    }
  };

  return (
    <nav>
      <Link to={"/"}>
        <div className="logoContainer">
          <img src={logo} alt="CodeVault logo" className="gitHubLogo" />
          <h3>
            <BrandName />
          </h3>
        </div>
      </Link>

      <div className="navFields">
        <input
          type="text"
          placeholder="🔍  Type / to search any user..."
          id="input-field"
          className="search-bar"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Link to={"/create"}>
          <div className="repoCreate"> + </div>
        </Link>
        <div
          className={`issueCheck ${unreadChatCount > 0 ? "issueCheckHasUnread" : ""}`}
          onClick={() => navigate("/chat")}>
          <CommentIcon size={16} />
          {unreadChatCount > 0 && (
            <span className="issueCheckBadge">
              {unreadChatCount > 9 ? "9+" : unreadChatCount}
            </span>
          )}
        </div>
        <div className="profile">
          <img
            src={userDetails.avatar}
            alt="profile"
            onClick={() => {
              setMenuOpen(!menuOpen);
            }}
          />

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="dropdown-menu">
              <Link
                to={`/profile/${userDetails.username}`}
                className="dropdown-item">
                <PersonIcon size={20} /> Profile
              </Link>
              <Link
                to={`/profile/${userDetails.username}?tab=repos#`}
                className="dropdown-item">
                <RepoIcon size={20} /> Your Repos
              </Link>
              <Link
                to={`/profile/${userDetails.username}?tab=starred#`}
                className="dropdown-item">
                <StarIcon size={20} /> Starred Repos
              </Link>
              <div
                onClick={handleSignOut}
                className="dropdown-item"
                style={{ cursor: "pointer" }}>
                <SignOutIcon size={20} /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
