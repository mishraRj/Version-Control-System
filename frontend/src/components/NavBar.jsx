import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../authContext";
import "./navbar.css";
import {
  RepoIcon,
  StarIcon,
  SignOutIcon,
  PersonIcon,
  IssueOpenedIcon,
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

      if (userId) {
        try {
          const response = await axios.get(
            `${apiUrl}/getUserProfile/${userId}`
          );
          setUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/login");
  };

  const handleSearch = async () => {
    // Update the URL with query param (q=...)
    if (searchValue) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    } else {
      navigate("/");
    }
    try {
      const response = await axios.get(`${apiUrl}/searchUser/${searchValue}`);
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
          <img
            src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
            alt="github logo"
            className="gitHubLogo"
          />
          <h3>G!thub</h3>
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
        <div className="issueCheck">
          <IssueOpenedIcon size={16} />
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
