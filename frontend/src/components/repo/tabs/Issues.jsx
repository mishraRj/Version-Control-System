import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./CSS/issues.css";

const Issues = () => {
  const { repoId } = useParams();
  const [repo, setRepo] = useState();
  // Fetch Repo
  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(`http://localhost:3002/repo/${repoId}`);
        const data = await response.json();
        setRepo(data);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };

    fetchRepository();
  }, [repoId]);

  return (
    <>
      {/* Search bar and buttons */}
      <div className="issues-header">
        <input
          type="text"
          placeholder="Find an issue..."
          className="search-input"
        />

        <select className="dropdown">
          <option>All</option>
          <option>Open</option>
          <option>Closed</option>
        </select>

        <button className="new-issue-btn">New Issue</button>
      </div>

      <div className="code-container">
        <div className="row no-gutters">
          {/* Left Column (Files section) */}
          <div className="issues-column">
            <div className="empty-files">
              <img src="/nofiles.png" alt="No files" className="empty-image" />
              <h5 className="empty-text">No issues in this repo</h5>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Issues;
