import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";
import NavBar from "../NavBar";
import { UnderlineNav } from "@primer/react";
import Overview from "./tabs/overview";
import UserRepos from "./tabs/UserRepos";
import StarRepos from "./tabs/StarRepos";
import "./profile.css";

const Profile = () => {
  const { userName } = useParams();
  const [visitedUser, setVisitedUser] = useState(null); // user being viewed
  const [loggedInUser, setLoggedInUser] = useState(null); // session user

  // Edit/Tab stuff (as before)
  const [enableEdit, setEnableEdit] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [username, setUsername] = useState("");
  const [userBio, setUserBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Tab sync
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // Fetch visited user details by username param
  useEffect(() => {
    if (!userName) return;
    const fetchVisitedUser = async () => {
      try {
        const resp = await axios.get(
          `http://localhost:3002/searchUser/${userName}`
        );
        const user = (resp.data.users && resp.data.users[0]) || null;
        setVisitedUser(user);
        setUsername(user?.username || "");
        setUserBio(user?.bio || "");
      } catch (error) {
        setVisitedUser(null);
      }
    };
    fetchVisitedUser();
  }, [userName]);

  // Fetch logged-in user by localStorage userId
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    axios
      .get(`http://localhost:3002/getUserProfile/${userId}`)
      .then(res => setLoggedInUser(res.data))
      .catch(() => setLoggedInUser(null));
  }, []);

  // Auth check: canEdit if ids match
  const canEdit =
    loggedInUser && visitedUser && loggedInUser._id === visitedUser._id;

  // Tab switching sync
  const handleTabChange = tab => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Edit mode handlers
  const handleEditProfile = () => setEnableEdit(prev => !prev);
  const handleProfileUpdation = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", userBio);
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }
      const res = await axios.put(
        `http://localhost:3002/updateUserProfile/${visitedUser._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      window.location.href = `/profile/${res.data.username}`;
    } catch (err) {
      alert("User updation Failed!");
      setLoading(false);
    }
  };
  const handleImageClick = () => fileInputRef.current?.click();
  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Loading or error fallback
  if (!visitedUser)
    return (
      <div className="profile-page-wrapper">
        <NavBar />
        User not found.
      </div>
    );

  return (
    <>
      <NavBar />
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current={activeTab === "overview" ? "page" : undefined}
          icon="book"
          onClick={() => handleTabChange("overview")}
          sx={{ backgroundColor: "transparent", color: "white" }}>
          Overview
        </UnderlineNav.Item>
        {canEdit ? (
          <UnderlineNav.Item
            aria-current={activeTab === "repos" ? "page" : undefined}
            icon="repo"
            onClick={() => handleTabChange("repos")}
            sx={{ backgroundColor: "transparent", color: "whitesmoke" }}>
            Your Repositories
          </UnderlineNav.Item>
        ) : (
          <UnderlineNav.Item
            aria-current={activeTab === "repos" ? "page" : undefined}
            icon="repo"
            onClick={() => handleTabChange("repos")}
            sx={{ backgroundColor: "transparent", color: "whitesmoke" }}>
            Repositories
          </UnderlineNav.Item>
        )}
        <UnderlineNav.Item
          aria-current={activeTab === "starred" ? "page" : undefined}
          icon="star"
          onClick={() => handleTabChange("starred")}
          sx={{ backgroundColor: "transparent", color: "whitesmoke" }}>
          Starred Repositories
        </UnderlineNav.Item>
      </UnderlineNav>

      <div className="profile-page-wrapper">
        {!enableEdit ? (
          <div className="user-profile-section">
            <div className="profile-image">
              <img
                src={visitedUser.avatar || "/default-avatar.png"}
                alt="avatar"
              />
            </div>
            <div className="name">
              <h3>{visitedUser.username}</h3>
              <p>{visitedUser.bio}</p>
            </div>
            {canEdit ? (
              <button className="follow-btn" onClick={handleEditProfile}>
                Edit Profile
              </button>
            ) : (
              <button className="follow-btn">Follow</button>
            )}
            <div className="follower">
              <p>{visitedUser.followers?.length || 0} Followers</p>
              <p> | </p>
              <p>{visitedUser.followedUsers?.length || 0} Following</p>
            </div>
          </div>
        ) : (
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
                      : visitedUser.avatar
                  }
                  alt="avatar"
                  onClick={handleImageClick}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <div className="name">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
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
                <p>{visitedUser.followers?.length || 0} Followers</p>
                <p> | </p>
                <p>{visitedUser.followedUsers?.length || 0} Following</p>
              </div>
            </div>
          </form>
        )}

        <div className="right-section">
          {activeTab === "overview" && (
            <Overview user={visitedUser} canEdit={canEdit} />
          )}
          {activeTab === "repos" && (
            <UserRepos user={visitedUser} isOwner={canEdit} />
          )}
          {activeTab === "starred" && (
            <StarRepos userId={visitedUser._id} canEdit={canEdit} />
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
