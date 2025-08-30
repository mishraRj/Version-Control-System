import React, { useEffect, useState } from "react";
import axios from "axios";
import { StarIcon, StarFillIcon } from "@primer/octicons-react";
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

  const [starredRepos, setStarredRepos] = useState([]);

  // ⭐ Fetch starred repos once on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchStarred = async () => {
      try {
        const res = await fetch(`http://localhost:3002/repo/starred/${userId}`);
        const data = await res.json();
        setStarredRepos((data.starRepos || []).map(id => id.toString()));
      } catch (err) {
        console.error("Error fetching starred repos:", err);
      }
    };

    fetchStarred();
  }, []);

  useEffect(() => {
    console.log("⭐ updated starredRepos state:", starredRepos);
  }, [starredRepos]);

  // ⭐ Toggle star
  const toggleStar = async repoId => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const isStarred = starredRepos.includes(repoId.toString());

    try {
      const res = await fetch(`http://localhost:3002/repo/${repoId}/star`, {
        method: isStarred ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errorText = await res.text(); // fallback if not JSON
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setStarredRepos((data.starRepos || []).map(id => id.toString()));
    } catch (err) {
      console.error("Error toggling star:", err);
    }
  };

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
        {searchResults.map(repo => (
          <div
            key={repo._id}
            style={{
              borderBottom: "0.5px solid #3d444db3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5rem 0",
            }}>
            <div>
              <h4 className="text-primary">{repo.name}</h4>
              <p className="text-secondary fs-6 fw-medium">
                {repo.description}
              </p>
            </div>

            <div
              onClick={() => toggleStar(repo._id)}
              style={{
                cursor: "pointer",
                color: starredRepos.includes(repo._id.toString())
                  ? "gold"
                  : "white",
                marginLeft: "1rem",
              }}>
              {starredRepos.includes(repo._id.toString()) ? (
                <StarFillIcon size={20} />
              ) : (
                <StarIcon size={20} />
              )}
            </div>
          </div>
        ))}
      </main>
    </>
  );
};

export default UserRepos;
