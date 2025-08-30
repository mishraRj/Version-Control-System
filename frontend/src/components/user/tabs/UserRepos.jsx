import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/overview.css";

const UserRepos = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

    fetchRepositories();
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
      <main className="middle">
        <h2>Your Repositories</h2>
        <div id="search" style={{ borderBottom: "0.5px solid #3d444db3" }}>
          <input
            type="text"
            value={searchQuery}
            placeholder="Fina a repository..."
            onChange={e => setSearchQuery(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
        </div>
        {searchResults.map(repo => {
          return (
            <div
              key={repo._id}
              style={{ borderBottom: "0.5px solid #3d444db3" }}>
              <h4 className="text-primary">{repo.name}</h4>
              <p className="text-secondary fs-6 fw-medium">
                {repo.description}
              </p>
            </div>
          );
        })}
      </main>
    </>
  );
};

export default UserRepos;
