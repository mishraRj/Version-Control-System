import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import "./navbar.css";
import {
  HomeIcon,
  RepoIcon,
  StarIcon,
  SignOutIcon,
  PersonIcon,
  IssueOpenedIcon,
} from "@primer/octicons-react";

const NavBar = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const { setCurrentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:3002/getUserProfile/${userId}`
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

  return (
    <nav>
      <Link to={"/"}>
        <div className="logoContainer">
          <img
            src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
            alt="github logo"
            className="gitHubLogo"
          />
          <h3>Github</h3>
        </div>
      </Link>

      <div className="navFields">
        <input
          type="text"
          placeholder="🔍  Type / to search..."
          id="input-field"
          className="search-bar"
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
              console.log("menuOpen:", !menuOpen);
            }}
          />

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">
                <PersonIcon size={20} /> Profile
              </Link>
              <Link to="/profile?tab=repos#" className="dropdown-item">
                <RepoIcon size={20} /> Your Repos
              </Link>
              <Link to="/profile?tab=starred#" className="dropdown-item">
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
