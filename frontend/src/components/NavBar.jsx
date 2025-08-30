import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import "./navbar.css";
import { IssueOpenedIcon } from "@primer/octicons-react";

const NavBar = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const { setCurrentUser } = useAuth();

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
          <Link to={"/profile"}>
            <img src={userDetails.avatar} alt="" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
