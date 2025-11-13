import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import NavBar from "../NavBar";
import { useLocation } from "react-router-dom";

const Dashboard = (req, res) => {
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [userFeed, setUserFeed] = useState([]);

  const location = useLocation();
  const searchTerm = new URLSearchParams(location.search).get("q");

  // Fetching Suggested Repos
  useEffect(() => {
    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3002/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(data);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };
    fetchSuggestedRepositories();
  }, []);

  // Fetching User Feed
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchFeed = async () => {
      try {
        const response = await fetch(`http://localhost:3002/feed/${userId}`);
        const data = await response.json();
        console.log(data);
        setUserFeed(data);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };
    fetchFeed();
  }, []);

  return (
    <>
      <NavBar onUserSearch={setSearchedUsers} />

      <section id="dashboard">
        <aside className="suggestions">
          <h3>Suggested Repositories</h3>
          {suggestedRepositories.map(repo => {
            return (
              <div key={repo._id}>
                <h4>{repo.name}</h4>
                <h4>{repo.description}</h4>
              </div>
            );
          })}
        </aside>
        <main className="middle">
          {/* --- ACTIVITY FEED --- */}
          <div className="activity-feed dark mb-4">
            <h3 className="activity-feed-title">Personal Feed</h3>
            {userFeed.length === 0 ? (
              <div className="activity-feed-empty dark">
                No recent activity yet. <br /> Start Following Users to start
                with
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
                    <div className="activity-content">
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
          </div>

          {/* Searched Users Box */}
          <div className="project-status-banner">
            <strong>🚧 Project in Progress!</strong>
            <ul>
              <li>
                🔐 <b>Backend Authorization</b> setup coming soon
              </li>
              <li>
                📰 <b>Chat Functionality</b> will be available on the home page
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
    </>
  );
};

export default Dashboard;
