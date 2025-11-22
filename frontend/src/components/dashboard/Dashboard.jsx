import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import NavBar from "../NavBar";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../Footer";

const Dashboard = (req, res) => {
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [userFeed, setUserFeed] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchTerm = new URLSearchParams(location.search).get("q");

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetching User Feed
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token"); // JWT from login
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/feed/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setUserFeed(data);
      } catch (err) {
        console.log("Error while passing repositories", err);
        console.log(err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // Fetching Suggested Users
  useEffect(() => {
    const token = localStorage.getItem("token"); // JWT from login
    const fetchSuggestedUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/allUsers`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        // Randomly shuffle and pick 5
        const shuffled = data.sort(() => 0.5 - Math.random());
        const result = shuffled.slice(0, 5);
        setSuggestedUsers(result);
      } catch (err) {
        console.log("Error while fetching Suggested Users", err);
        console.log(err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestedUsers();
  }, []);

  return (
    <>
      <NavBar onUserSearch={setSearchedUsers} />

      <section id="dashboard">
        <aside className="suggestions">
          <h3 className="suggestions-title">Active Users</h3>
          <div className="suggestions-list">
            {loading ? (
              "Loading..."
            ) : (
              <>
                {suggestedUsers.map(user => (
                  <div
                    className="suggestion-row"
                    key={user._id}
                    onClick={() => navigate(`/profile/${user.username}`)}>
                    <img
                      className="suggestion-avatar"
                      src={user.avatar}
                      alt={user.username}
                    />
                    <div className="suggestion-info">
                      <div className="suggestion-username">{user.username}</div>
                      <div className="suggestion-bio">{user.about1}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>

        <main className="middle">
          {/* --- ACTIVITY FEED --- */}
          <div className="activity-feed dark mb-4">
            <h3 className="activity-feed-title">Personal Feed</h3>
            {loading ? (
              "Loading..."
            ) : (
              <>
                {userFeed.length === 0 ? (
                  <div className="activity-feed-empty dark">
                    No recent activity yet. <br /> Start Following Users to
                    start with
                  </div>
                ) : (
                  <ul className="activity-feed-list dark">
                    {userFeed.map(activity => (
                      <li
                        className={`activity-item activity-type-${activity.type} dark`}
                        key={activity._id}>
                        <img
                          className="activity-avatar"
                          src={activity.user?.avatar || "/default-avatar.png"}
                          alt={activity.user?.username || "User"}
                        />
                        <div
                          className="activity-content"
                          onClick={() =>
                            navigate(`/profile/${activity.user?.username}`)
                          }>
                          <span className="activity-user">
                            {activity.user?.username || "User"}
                          </span>
                          <span className="activity-desc">
                            {activity.description}
                          </span>
                        </div>
                        <span className="activity-time">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Searched Users Box */}
          <div className="project-status-banner">
            <strong>🚧 Project in Progress!</strong>
            <ul>
              <li>
                📰 <b>Chat Functionality</b> will be available on the home page
              </li>
              <li>
                📱 <b>Responsiveness</b> coming soon
              </li>
              <li>
                💬 <b>Comments on Issues</b> coming soon
              </li>
              <li>
                ...and much more!{" "}
                <span className="status-comingsoon">
                  More features coming soon 🚀
                </span>
              </li>
            </ul>
            <p className="status-note">
              Most core functionality is already live. Explore the working
              GitHub-style repo & commit UI below!
            </p>
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

export default Dashboard;
