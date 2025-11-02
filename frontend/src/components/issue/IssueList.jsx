import React, { useEffect, useState } from "react";

const IssueList = ({ issues, onClickCreate, onClickIssue }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    let filtered = issues;
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        issue => issue.status === statusFilter.toLowerCase()
      );
    }
    if (searchQuery !== "") {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setSearchResults(filtered);
  }, [searchQuery, issues, statusFilter]);

  return (
    <div className="showIssuesBox">
      <div className="issues-header">
        <input
          type="text"
          placeholder="Find an issue..."
          className="search-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          className="dropdown"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Open</option>
          <option>Closed</option>
        </select>
        <button className="new-issue-btn" onClick={onClickCreate}>
          New Issue
        </button>
      </div>

      <div className="code-container">
        <div className="row no-gutters">
          <div className="showIssues-column">
            {searchResults.length > 0 ? (
              searchResults.map(issue => (
                <div
                  className="issue-card"
                  key={issue._id}
                  onClick={() => onClickIssue(issue)}>
                  <h5 className="issue-title">
                    {issue.title}
                    <span className={`issue-status ${issue.status}`}>
                      {issue.status}
                    </span>
                  </h5>
                  <p className="issue-desc">{issue.description}</p>
                </div>
              ))
            ) : (
              <div className="issues-column">
                <div className="empty-files">
                  <img
                    src="/nofiles.png"
                    alt="No files"
                    className="empty-image"
                  />
                  <h5 className="empty-text">No issues in this repo</h5>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueList;
