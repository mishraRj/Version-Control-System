import React, { useState, useEffect } from "react";
import "./dashboard/Dashboard.css";
import NavBar from "./NavBar";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer";

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null); // session user
  const [loadingUserIds, setLoadingUserIds] = useState([]);
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Get search term from URL on mount/update (react-router v6)
  const searchTerm = new URLSearchParams(location.search).get("q") || "";

  // Always update input box too
  useEffect(() => {
    setSearchValue(searchTerm);
  }, [searchTerm]);

  // Fetch users by searchTerm
  useEffect(() => {
    if (!searchTerm) {
      setSearchedUsers([]);
      return;
    }
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await axios.get(`${apiUrl}/searchUser/${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Calculate isFollowing for each
        const apiUsers = resp.data.users || [];
        const processedUsers = apiUsers.map(user => ({
          ...user,
          isFollowing: loggedInUser?.followedUsers?.includes(user._id),
        }));
        setSearchedUsers(processedUsers);
      } catch (error) {
        setSearchedUsers([]);
      }
    };
    fetchUsers();
  }, [searchTerm, loggedInUser]);

  // Fetch logged-in user by localStorage userId
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId) return;
    axios
      .get(`${apiUrl}/getUserProfile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setLoggedInUser(res.data))
      .catch(() => setLoggedInUser(null));
  }, []);

  const existingUser =
    loggedInUser && searchedUsers && loggedInUser._id === searchedUsers._id;

  const handleFollowToggle = async (visitedUserId, currentlyFollowing) => {
    if (!loggedInUser?._id || !visitedUserId) return;
    // Add user to loading ids
    setLoadingUserIds(prev => [...prev, visitedUserId]);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/toggleFollow/${visitedUserId}`,
        { loggedInUserId: loggedInUser._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchedUsers(prev =>
        prev.map(user =>
          user._id === visitedUserId
            ? { ...user, isFollowing: !currentlyFollowing }
            : user
        )
      );
    } catch (err) {
      console.error("Cannot follow/unfollow user: ", err);
    } finally {
      // Remove user from loading ids
      setLoadingUserIds(prev => prev.filter(id => id !== visitedUserId));
    }
  };

  // Fetching Suggested Repos
  useEffect(() => {
    if (!loggedInUser?._id) return;
    const fetchSuggestedRepositories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${apiUrl}/repo/user/${loggedInUser._id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setSuggestedRepositories(data.repositories);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };
    fetchSuggestedRepositories();
  }, [loggedInUser]);

  return (
    <>
      <NavBar />
      <section id="dashboard">
        <aside className="repo-suggestions">
          <h3 className="repo-suggestions-title">Suggested Repositories</h3>
          <div className="repo-suggestions-list">
            {suggestedRepositories.map(repo => (
              <div
                className="repo-suggestion-row"
                key={repo._id}
                onClick={() =>
                  navigate(`/${repo.owner.username}/${repo.name}`)
                }>
                <img
                  className="repo-suggestion-avatar"
                  src={repo.owner?.avatar}
                  alt="Repo Owner"
                />
                <div className="repo-suggestion-info">
                  <div className="repo-suggestion-name">{repo.name}</div>
                  <div className="repo-suggestion-status">
                    {repo.visibility}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="middle">
          <div className="search-users-list" style={{ marginBottom: "50px" }}>
            <h2>Search Results for "{searchValue}"</h2>
            {searchedUsers.length === 0 && (
              <div
                style={{
                  opacity: 0.78,
                  fontSize: "1.07rem",
                  marginTop: "22px",
                }}>
                No users found.
              </div>
            )}
            {searchedUsers
              .filter(user => loggedInUser?._id !== user._id)
              .map(user => (
                <div
                  key={user._id}
                  className="searched-user-card"
                  onClick={() => navigate(`/profile/${user.username}`)}>
                  <div className="usercard-row">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      className="usercard-avatar"
                      alt="avatar"
                    />
                    <span className="searched-user-username">
                      {user.username}
                    </span>
                  </div>
                  <p className="searched-user-bio">
                    {user.bio || "No bio yet."}
                  </p>
                  <div className="userBtns">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleFollowToggle(user._id, user.isFollowing);
                      }}
                      className={user.isFollowing ? "following-btn" : ""}
                      disabled={loadingUserIds.includes(user._id)}>
                      {loadingUserIds.includes(user._id)
                        ? "Loading..."
                        : user.isFollowing
                        ? "Following"
                        : "Follow"}
                    </button>

                    <button onClick={e => e.stopPropagation()}>
                      Connect +
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </main>
        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li>
              <p>AI Workshop - Jan 10</p>
            </li>
            <li>
              <p>Cloud Expo - Feb 28</p>
            </li>
            <li>
              <p>Startup Pitch Day - Mar 12</p>
            </li>
            <li>
              <p>Cybersecurity Summit - Apr 7</p>
            </li>
            <li>
              <p>Open Source Con - May 19</p>
            </li>
            <li>
              <p>Blockchain Forum - Jul 3</p>
            </li>
            <li>
              <p>UX Design Conference - Aug 21</p>
            </li>
            <li>
              <p>Mobile Dev Camp - Sep 9</p>
            </li>
            <li>
              <p>JavaScript World - Oct 14</p>
            </li>
            <li>
              <p>DevOps Summit - Nov 30</p>
            </li>
          </ul>
        </aside>
      </section>
      <Footer />
    </>
  );
};

export default Search;
