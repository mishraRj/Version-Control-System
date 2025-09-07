import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../CreateRepo.css";

const RepoSettings = () => {
  const { repoId } = useParams();
  const [repo, setRepo] = useState({});
  // Fetch Repo
  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(`http://localhost:3002/repo/${repoId}`);
        console.log(response);
        const data = await response.json();
        console.log(data);
        setRepo(data);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };

    fetchRepository();
  }, [repoId]);
  // Fetching Repo Details
  const [repoName, setRepoName] = useState("");
  const [repoDescription, setRepoDescription] = useState("");
  const [repoVisibility, setRepoVisibility] = useState("public");
  const [loading, setLoading] = useState(false);

  const handleRepoCreation = async e => {
    e.preventDefault();

    try {
      setLoading(true);
      console.log({
        name: repoName,
        description: repoDescription,
        owner: userDetails._id, // ID bhejna hai, object nahi
        visibility: repoVisibility,
      });
      const res = await axios.post("http://localhost:3002/repo/create", {
        name: repoName,
        description: repoDescription,
        owner: userDetails._id,
        visibility: repoVisibility,
      });
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Repo Creation Failed!");
      setLoading(false);
    }
  };

  return (
    <div className="repo-creator">
      <form action="">
        <div className="headings">
          <h3>Update repository</h3>
          <p className="text-secondary">
            Repositories contain a project's files and version history. <br />
            <i className="text-secondary">
              Required fields are marked with an asterisk (*).
            </i>
          </p>
        </div>

        <div className="general-section">
          <h4>General</h4>
          <div className="general-content mt-2">
            <div className="repoName-box2">
              <label htmlFor="input-field">Repository name *</label>
              <input
                type="text"
                name="name"
                id="input-field"
                value={repo.name}
                onChange={e => setRepoName(e.target.value)}
                required
              />
            </div>
          </div>
          <p className="text-secondary fs-6 text mt-2 bold">
            Great repository names are short and memorable. How about
            <span className="text-success"> legendry-chainsaw</span> ?
          </p>
          <div className="description-box">
            <label htmlFor="input-field">Description</label>
            <input
              type="text"
              id="input-field"
              maxLength={350}
              value={repo.description}
              onChange={e => setRepoDescription(e.target.value)}
            />
            <p className="text-secondary fs-6 text fw-lighter">
              {repoDescription.length}/350 characters
            </p>
          </div>
        </div>

        <div className="configuration-section mt-5">
          <h4>Configuration</h4>
          <div className="configuration-content">
            {/* Visibility */}
            <div className="config-item">
              <div className="main-content">
                <label className="config-label">Update visibility *</label>
                <select
                  className="config-select"
                  value={repo.visibility}
                  onChange={e => setRepoVisibility(e.target.value)}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="sub-para">
                <p className="text-secondary">
                  Choose who can see and commit to this repository
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button
            className="btn btn-success mt-3"
            disabled={loading}
            onClick={handleRepoCreation}>
            {loading ? "Loading..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RepoSettings;
