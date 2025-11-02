import { React, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../issue/CSS/issues.css";
import CreateIssue from "../../issue/CreateIssue";
import IssueList from "../../issue/IssueList";
import ShowIssue from "../../issue/ShowIssue";

const Issues = ({ userAvatar, resetSectionSignal }) => {
  const { repoName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [repo, setRepo] = useState({});
  const [issues, setIssues] = useState([]); // Array, not single object
  const [activeSection, setActiveSection] = useState("list"); // "list" | "create" | "single"
  const [selectedIssue, setSelectedIssue] = useState(null); // used for single view

  // const [loading, setLoading] = useState(false);
  // Fetch Repo
  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/repo/name/${repoName}`
        );
        const data = await response.json();
        const repoData = Array.isArray(data) ? data[0] : data;
        setRepo(repoData);
      } catch (err) {
        console.log("Error while fetching repository", err);
      }
    };

    fetchRepository();
  }, [repoName]);

  // Fetch Issues Logic
  const fetchIssues = async () => {
    // Stop if repo id is not set
    if (!repo._id) {
      setIssues([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3002/issue/all/${repo._id}`
      );
      const data = await response.json();
      setIssues(data); // as array
    } catch (err) {
      console.log("Error while fetching Issue", err);
      setIssues([]); // fallback to empty array on error
    }
  };

  // Fetch Issues
  useEffect(() => {
    if (repo._id) fetchIssues();
  }, [repo._id]); // Also run effect when repo changes

  //Resetting Issue Tab Sections
  useEffect(() => {
    setActiveSection("list");
    fetchIssues();
  }, [resetSectionSignal]);
  return (
    <>
      {/* // 1. Default: ShowIssuesBox */}
      {activeSection === "list" && (
        <IssueList
          issues={issues}
          onClickCreate={() => setActiveSection("create")}
          onClickIssue={issue => {
            setSelectedIssue(issue);
            setActiveSection("single");
            // Set hash in URL:
            const last3 = issue._id?.slice(-3);
            navigate(location.pathname + location.search + "#" + last3, {
              replace: true,
            });
          }}
        />
      )}
      {/* // 2. CreateIssue */}
      {activeSection === "create" && (
        <CreateIssue
          userAvatar={userAvatar}
          handleBackToList={() => setActiveSection("list")}
          repository={repo._id}
          fetchIssues={fetchIssues}
        />
      )}
      {/* // 3. ShowSingleIssue */}
      {activeSection === "single" && selectedIssue && (
        <ShowIssue
          issue={selectedIssue}
          handleBackToList={() => setActiveSection("list")}
          userAvatar={userAvatar}
          repository={repo}
          fetchIssues={fetchIssues} // NEW
          onDeleteIssue={() => {
            // NEW
            setActiveSection("list");
            fetchIssues(); // reload to remove deleted issue
          }}
        />
      )}
    </>
  );
};

export default Issues;
