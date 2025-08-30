import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = (req, res) => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

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
        console.log("Fetched repos:", data);
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
          <h2>Your Repositories</h2>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults.map(repo => {
            return (
              <div key={repo._id}>
                <h4>{repo.name}</h4>
                <h4>{repo.description}</h4>
              </div>
            );
          })}
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
