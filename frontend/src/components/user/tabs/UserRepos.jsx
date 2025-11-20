import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { StarIcon, StarFillIcon, RepoIcon } from "@primer/octicons-react";
import "./CSS/overview.css";

const UserRepos = ({ user, isOwner, apiUrl }) => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiUrl}/repo/user/${user._id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRepositories(data.repositories);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };

    fetchRepositories();
  }, [user._id]);

  // 🔎 filter whenever searchQuery / repositories / filterType change
  useEffect(() => {
    let filteredRepo = repositories;

    // Search filter
    if (searchQuery !== "") {
      filteredRepo = filteredRepo.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filteredRepo = filteredRepo.filter(
        repo => repo.visibility === filterType
      );
    }

    setSearchResults(filteredRepo);
  }, [searchQuery, repositories, filterType]);

  const [starredRepos, setStarredRepos] = useState([]);

  // ⭐ Fetch starred repos once on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const token = localStorage.getItem("token");

    const fetchStarred = async () => {
      try {
        const res = await fetch(`${apiUrl}/repo/starred/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setStarredRepos((data.starRepos || []).map(id => id.toString()));
      } catch (err) {
        console.error("Error fetching starred repos:", err);
      }
    };

    fetchStarred();
  }, []);

  // ⭐ Toggle star
  const toggleStar = async repoId => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const isStarred = starredRepos.includes(repoId.toString());
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${apiUrl}/repo/${repoId}/star`, {
        method: isStarred ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
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
        <div
          id="search"
          style={{
            borderBottom: "0.5px solid #3d444db3",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0",
          }}>
          {/* Search Bar */}
          <input
            type="text"
            value={searchQuery}
            placeholder="Find a repository..."
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              padding: "6px 10px",
              border: "1px solid #3d444db3",
              borderRadius: "6px",
              color: "#c9d1d9",
            }}
          />

          {/* Type Dropdown */}
          <select
            style={{
              backgroundColor: "transparent",
              border: "1px solid #3d444db3",
              borderRadius: "6px",
              padding: "6px 10px",
              color: "#c9d1d9",
            }}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}>
            <option className="options" value="all">
              Type: All
            </option>
            <option className="options" value="public">
              Public
            </option>
            <option className="options" value="private">
              Private
            </option>
          </select>

          {/* New Repo Button */}
          {isOwner ? (
            <Link to={"/create"}>
              <button
                style={{
                  backgroundColor: "#2ea043",
                  border: "1px solid rgba(240, 246, 252, 0.1)",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  color: "white",
                  fontWeight: "500",
                  cursor: "pointer",
                }}>
                <RepoIcon /> New
              </button>
            </Link>
          ) : (
            <></>
          )}
        </div>
        {searchResults
          .filter(repo => {
            if (isOwner) {
              // Owner: show all repos
              return true;
            } else {
              // Not owner: only show public repos
              return repo.visibility !== "private";
            }
          })
          .map(repo => (
            <div
              key={repo._id}
              style={{
                borderBottom: "0.5px solid #3d444db3",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
              }}>
              <Link to={`/${user.username}/${repo.name}`}>
                <div className="repoName">
                  <h4 className="text-primary">{repo.name}</h4>
                  <p className="text-secondary fs-6 fw-medium">
                    {repo.description}
                  </p>
                </div>
              </Link>
              {isOwner ? (
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
              ) : (
                <div></div>
              )}
            </div>
          ))}
      </main>
    </>
  );
};

export default UserRepos;
