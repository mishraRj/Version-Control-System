import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./CSS/code.css";

const Code = () => {
  const { repoName } = useParams();
  const [repo, setRepo] = useState();
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

  return (
    <div className="code-container">
      <div className="row no-gutters">
        {/* Left Column (Files section) */}
        <div className="col-md-8 files-column">
          <div className="empty-files">
            <img src="/nofiles.png" alt="No files" className="empty-image" />
            <h5 className="empty-text">
              This repository doesn't contain any files yet 🚀
            </h5>
          </div>
        </div>
        {/* Right Column (Repo Details / About section) */}
        <div className="col-md-4 about-column">
          {repo ? (
            <>
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
