import React, { useEffect, useState } from "react";
import { StarIcon, StarFillIcon } from "@primer/octicons-react";

const StarRepos = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchStarredRepos = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/repo/starred/${userId}`
        );
        const data = await response.json();
        setRepositories(data.repositories);
      } catch (err) {
        console.error("Error while fetching starred repos", err);
      }
    };

    fetchStarredRepos();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
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

  useEffect(() => {}, [starredRepos]);

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
      // ⭐ if unstarred, remove from local repositories list (immediate re-render)
      if (isStarred) {
        setRepositories(prev => prev.filter(r => r._id !== repoId));
        setSearchResults(prev => prev.filter(r => r._id !== repoId));
      }
    } catch (err) {
      console.error("Error toggling star:", err);
    }
  };

  return (
    <>
      <main className="middle">
        <h2>Starred Repositories</h2>

        {searchResults.length === 0 ? (
          <h1>No starred repos yet</h1>
        ) : (
          <>
            <div id="search" style={{ borderBottom: "0.5px solid #3d444db3" }}>
              <input
                type="text"
                value={searchQuery}
                placeholder="Find a repository..."
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
          </>
        )}
      </main>
    </>
  );
};

export default StarRepos;
