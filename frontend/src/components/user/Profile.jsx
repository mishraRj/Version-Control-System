import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon, StarIcon } from "@primer/octicons-react";
import Overview from "./tabs/overview";
import UserRepos from "./tabs/UserRepos";
import StarRepos from "./tabs/StarRepos";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const { setCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:3002/getUserProfile/${userId}`
          );
          console.log(response);
          setUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, []);

  return (
    <>
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current={activeTab === "overview" ? "page" : undefined}
          icon={BookIcon}
          onClick={() => setActiveTab("overview")}
          sx={{
            backgroundColor: "transparent",
            color: "white",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}>
          Overview
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "repos" ? "page" : undefined}
          icon={RepoIcon}
          onClick={() => setActiveTab("repos")}
          sx={{
            backgroundColor: "transparent",
            color: "whitesmoke",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}>
          Your Repositories
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "starred" ? "page" : undefined}
          icon={StarIcon}
          onClick={() => setActiveTab("starred")}
          sx={{
            backgroundColor: "transparent",
            color: "whitesmoke",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}>
          Starred Repositories
        </UnderlineNav.Item>
      </UnderlineNav>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setCurrentUser(null);

          window.location.href = "/auth";
        }}
        style={{ position: "fixed", bottom: "50px", right: "50px" }}
        id="logout">
        Logout
      </button>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image">
            <img src={userDetails.avatar} alt="avatar" className="" />
          </div>

          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>

          <button className="follow-btn">Follow</button>

          <div className="follower">
            <p>10 Follower</p>
            <p>3 Following</p>
          </div>
        </div>

        <div className="right-section">
          {activeTab === "overview" && <Overview />}
          {activeTab === "repos" && <UserRepos userId={userDetails._id} />}
          {activeTab === "starred" && <StarRepos userId={userDetails._id} />}
        </div>
      </div>
    </>
  );
};

export default Profile;
