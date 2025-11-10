import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import NavBar from "../NavBar";
import { useLocation } from "react-router-dom";

const Dashboard = (req, res) => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchedUsers, setSearchedUsers] = useState([]);

  const location = useLocation();
  const searchTerm = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/repo/user/${userId}`
        );
        const data = await response.json();
        setRepositories(data.repositories);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3002/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(data);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories); // ✅ empty query → show all repos
    } else {
      const filteredRepo = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

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
          {/* Searched Users Box */}
          <div className="project-status-banner">
            <strong>🚧 Project in Progress!</strong>
            <ul>
              <li>
                🔐 <b>Authorization</b> setup coming soon
              </li>
              <li>
                👤 <b>User search, profile view, and follow</b> features on the
                way
              </li>
              <li>
                📰 <b>Personalized feed</b> will be available on the home page
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
          <h2>Your Repositories</h2>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults.map(repo => (
            <div key={repo._id}>
              <h4>{repo.name}</h4>
              <h4>{repo.description}</h4>
            </div>
          ))}
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
