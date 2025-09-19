import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./profile.css";
import { UnderlineNav } from "@primer/react";
import {
  BookIcon,
  RepoIcon,
  StarIcon,
  PencilIcon,
} from "@primer/octicons-react";
import Overview from "./tabs/overview";
import UserRepos from "./tabs/UserRepos";
import StarRepos from "./tabs/StarRepos";
import NavBar from "../NavBar";
import { useSearchParams } from "react-router-dom";

const Profile = () => {
  // -------------------------------
  // ✅ State Management
  // -------------------------------
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const [userName, setUserName] = useState("");
  const [userBio, setUserBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const fileInputRef = useRef(null);

  // -------------------------------

  // ✅ Effects
  // -------------------------------

  // 🔄 Sync active tab with URL param
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // 📡 Fetch user details from backend
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await axios.get(
          `http://localhost:3002/getUserProfile/${userId}`
        );

        setUserDetails(response.data);
        setUserName(response.data.username || "");
        setUserBio(response.data.bio || "");
      } catch (err) {
        console.error("❌ Cannot fetch user details: ", err);
      }
    };

    fetchUserDetails();
  }, []);

  // -------------------------------
  // ✅ Event Handlers
  // -------------------------------

  // 🔄 Tab change handler
  const handleTabChange = tab => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ✏️ Toggle edit mode
  const handleEditProfile = () => {
    setEnableEdit(prev => !prev);
  };

  const handleProfileUpdation = async e => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("username", userName);
      formData.append("bio", userBio);

      if (selectedFile) {
        formData.append("avatar", selectedFile); // key name must match multer single('avatar')
      }

      const res = await axios.put(
        `http://localhost:3002/updateUserProfile/${userDetails._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: progressEvent => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percent}%`);
            // optionally set upload progress UI
          },
        }
      );

      // success: update local state or redirect
      // res.data should be the updated user object
      console.log("Updated user:", res.data);
      window.location.href = "/profile";
    } catch (err) {
      console.error(err);
      alert("User updation Failed!");
      setLoading(false);
    }
  };

  // 📸 Trigger file input click
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 📂 Handle file selection
  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <>
      <NavBar />
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current={activeTab === "overview" ? "page" : undefined}
          icon={BookIcon}
          onClick={() => handleTabChange("overview")}
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
          onClick={() => handleTabChange("repos")}
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
          onClick={() => handleTabChange("starred")}
          sx={{
            backgroundColor: "transparent",
            color: "whitesmoke",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}>
          Starred Repositories
        </UnderlineNav.Item>
      </UnderlineNav>

      <div className="profile-page-wrapper">
        {!enableEdit && (
          <div className="user-profile-section">
            <div className="profile-image">
              <img src={userDetails.avatar} alt="avatar" className="" />
            </div>

            <div className="name">
              <h3>{userDetails.username}</h3>
              <p>{userDetails.bio}</p>
            </div>

            <button className="follow-btn" onClick={handleEditProfile}>
              Edit Profile
            </button>

            <div className="follower">
              <p>{userDetails.followers?.length || 0} Followers</p>
              <p> | </p>
              <p>{userDetails.followedUsers?.length || 0} Following</p>
            </div>
          </div>
        )}

        {enableEdit && (
          <form action="" className="userUpdate-form">
            <div className="user-edit-profile-section">
              <div className="profile-image">
                <input
                  type="file"
                  id="upload"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <img
                  src={
                    selectedFile
                      ? URL.createObjectURL(selectedFile)
                      : userDetails.avatar
                  }
                  alt="avatar"
                  onClick={handleImageClick}
                  style={{ cursor: "pointer" }}
                />
                <span
                  className="badge bg-secondary d-flex align-items-center gap-1 position-relative"
                  style={{
                    bottom: "45px",
                    left: "200px",
                    width: "70px",
                    right: "5px",
                    cursor: "pointer",
                    padding: "6px 8px",
                    fontSize: "0.75rem",
                  }}
                  onClick={handleImageClick}>
                  <PencilIcon size={16} />
                  Edit
                </span>
              </div>

              <div className="name">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                />
                <label htmlFor="userBio">Bio:</label>
                <textarea
                  placeholder="Write something..."
                  id="userBio"
                  value={userBio}
                  maxLength={300}
                  rows={4}
                  onChange={e => setUserBio(e.target.value)}></textarea>
                <p className="text-secondary fs-6 text fw-lighter">
                  {userBio.length}/300 characters
                </p>
              </div>

              <div className="saving-btns d-flex justify-content-center align-items-center gap-3 mt-2">
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={loading}
                  onClick={handleProfileUpdation}>
                  {loading ? "Loading..." : "Save"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleEditProfile}>
                  Cancel
                </button>
              </div>

              <div className="follower">
                <p>{userDetails.followers?.length || 0} Followers</p>
                <p> | </p>
                <p>{userDetails.followedUsers?.length || 0} Following</p>
              </div>
            </div>
          </form>
        )}

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
