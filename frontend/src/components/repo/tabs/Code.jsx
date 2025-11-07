import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CopyIcon } from "@primer/octicons-react";
import "./CSS/code.css";

const Code = () => {
  const { repoName } = useParams();
  const [repo, setRepo] = useState();
  const [commits, setCommits] = useState([]);
  // Fetch Repo
  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/repo/name/${repoName}`
        );
        const data = await response.json();
        setRepo(data[0]);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };

    fetchRepository();
  }, [repoName]);

  // fetch commits
  useEffect(() => {
    const fetchRepoFiles = async () => {
      try {
        if (!repo || !repo._id) return;
        const response = await fetch(
          `http://localhost:3002/repo/getFiles/${repo._id}`
        );
        const data = await response.json();
        console.log(data);
        setCommits(data);
      } catch (err) {
        console.log("Error while fetching repository files", err);
      }
    };
    fetchRepoFiles();
  }, [repo]);

  return (
    <div className="code-container">
      <div className="row no-gutters">
        {/* Left Column (Files section) */}
        <div className="col-md-8 files-column">
          {commits.length > 0 ? (
            <div>
              {commits.map(commit => (
                <div key={commit._id}>
                  <p>Commit: {commit._id}</p>
                  {commit.files.map((file, idx) => (
                    <p key={idx}>{file.fileName}</p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="noFiles">
              <div className="empty-files">
                <img
                  src="/nofiles.png"
                  alt="No files"
                  className="empty-image"
                />
                <h5 className="empty-text">
                  This repository doesn't contain any files yet 🚀
                </h5>
              </div>

              <div className="instructions">
                <p className="instruction-intro">
                  To add files to this repository, follow these steps in the{" "}
                  <code>backend</code> folder:
                </p>
                <ol className="instruction-list">
                  <li>
                    Navigate to the backend folder: <code>cd backend</code>
                  </li>
                  <li>
                    Initialize the project: <code>node index.js init</code>
                  </li>
                  <li>
                    Add a file: <code>node index.js add &lt;filename&gt;</code>
                  </li>
                  <li>
                    Commit your changes:{" "}
                    <code>
                      node index.js commit &lt;commit message&gt; &lt;repo
                      ID&gt;
                    </code>
                  </li>
                  <li>
                    Push your changes: <code>node index.js push</code>
                  </li>
                </ol>
                <p className="instructions-note">
                  (You can find the repository ID on this page in the repository
                  description section.)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Repo Details / About section) */}
        <div className="col-md-4 about-column">
          {repo ? (
            <>
              <h4 className="about-title">Repo ID: </h4>
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <p className="about-text" style={{ color: "gold" }}>
                  {repo._id}
                </p>
                <CopyIcon
                  size={20}
                  className="copyIcon"
                  onClick={() => {
                    navigator.clipboard.writeText(repo._id);
                    // OPTIONAL: show toast/alert
                    alert("Copied to clipboard!");
                  }}
                />
              </span>

              <h5 className="about-title">About</h5>
              <p className="about-text">{repo.description}</p>

              <p className="text-secondary">
                <strong className="text-secondary">Visibility:</strong>{" "}
                {repo.visibility}
              </p>
              <p className="bottomLine text-secondary">
                <strong className="text-secondary">Owner:</strong>{" "}
                {repo.owner?.username}
              </p>

              <hr />
              <p className="text-secondary">
                <strong className="text-secondary">Activity:</strong> Demo
                Activity Info
              </p>
              <p className="text-secondary">
                <strong className="text-secondary">Stars:</strong> 0
              </p>
              <p className="text-secondary">
                <strong className="text-secondary">Watching:</strong> 1
              </p>
              <p className="bottomLine text-secondary">
                <strong className="text-secondary">Forks:</strong> 0
              </p>

              <hr />
              <p className="text-secondary">
                <strong className="text-secondary">Releases:</strong> No
                releases published
              </p>
              <p className="text-secondary">
                <strong className="text-secondary">Packages:</strong> No
                packages published
              </p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Code;
