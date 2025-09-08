import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../CreateRepo.css";
import DeleteRepoModal from "./DeleteRepoModal";
import ChangeVisibilityModal from "./ChangeVisibilityModal";

const RepoSettings = () => {
  const { repoId } = useParams();
  const [repo, setRepo] = useState({});
  // Fetching Repo Details
  const [repoName, setRepoName] = useState("");
  const [repoDescription, setRepoDescription] = useState("");
  const [loading, setLoading] = useState(false);
  // Fetch Repo
  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(`http://localhost:3002/repo/${repoId}`);
        const data = await response.json();
        console.log("Repo data:", data);

        setRepo(data);
        setRepoName(data.name || "");
        setRepoDescription(data.description || "");
      } catch (err) {
        console.log("Error while fetching repository", err);
      }
    };

    fetchRepository();
  }, [repoId]);

  // Show Floating Warning
  const [showModal, setShowModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);

  //Fetch User Details
  const [userDetails, setUserDetails] = useState({ username: "username" });
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:3002/getUserProfile/${userId}`
          );
          console.log(response);
          setUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, []);

  const handleRepoUpdation = async e => {
    e.preventDefault();

    try {
      setLoading(true);
      console.log({
        name: repoName,
        description: repoDescription,
      });
      const res = await axios.put(
        `http://localhost:3002/repo/update/${repoId}`,
        {
          name: repoName,
          description: repoDescription,
        }
      );
      window.location.href = "/profile";
    } catch (err) {
      console.error(err);
      alert("Repo updation Failed!");
      setLoading(false);
    }
  };

  const handleRepoDeletion = async e => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.delete(
        `http://localhost:3002/repo/delete/${repoId}`
      );
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Repo Deletion Failed!");
      setLoading(false);
    }
  };
  const handleRepoVisibility = async e => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.patch(
        `http://localhost:3002/repo/toggle/${repoId}`
      );
      window.location.href = "/profile";
    } catch (err) {
      console.error(err);
      alert("Repo Visibility Toggle Failed!");
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
                value={repoName}
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
              value={repoDescription}
              onChange={e => setRepoDescription(e.target.value)}
            />
            <p className="text-secondary fs-6 text fw-lighter">
              {repoDescription.length}/350 characters
            </p>
          </div>
        </div>

        <div className="configuration-section mt-5">
          <h4>Danger Zone</h4>
          <div className="configuration-content">
            {/* Visibility */}
            <div className="update-config-item">
              <div className="main-content">
                <label className="visibility-toggle">Change visibility</label>
                <button
                  className="visibility-toggle toggle-btn"
                  disabled={loading}
                  onClick={e => {
                    e.preventDefault();
                    setShowToggleModal(true);
                  }}>
                  {loading
                    ? "Loading..."
                    : `change to ${
                        repo.visibility === "public" ? "private" : "public"
                      }`}
                </button>
              </div>
              <div className="sub-para">
                <p className="text-secondary">
                  This repository is currently{" "}
                  {repo.visibility === "public" ? "public" : "private"}
                </p>
              </div>
            </div>

            {/* Delete Repo */}
            <div className="update-config-item">
              <div className="main-content">
                <label className="visibility-toggle">
                  Delete this repository
                </label>
                <button
                  type="button"
                  className="visibility-toggle toggle-btn"
                  disabled={loading}
                  onClick={e => {
                    e.preventDefault();
                    setShowModal(true);
                  }}>
                  {loading ? "Loading..." : "Delete repository"}
                </button>
              </div>
              <div className="sub-para">
                <p className="text-secondary">
                  Once you delete a repository, there is no going back. Please
                  be certain.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button
            className="btn btn-success mt-3"
            disabled={loading}
            onClick={handleRepoUpdation}>
            {loading ? "Loading..." : "Save Changes"}
          </button>
        </div>
      </form>
      {/* Delete Repo Modal*/}
      {showModal && (
        <DeleteRepoModal
          username={userDetails.username}
          repoName={repoName}
          onClose={() => setShowModal(false)}
          onDelete={handleRepoDeletion}
        />
      )}
      {/* Delete Repo Modal*/}
      {showToggleModal && (
        <ChangeVisibilityModal
          username={userDetails.username}
          repoName={repoName}
          visibility={repo.visibility}
          onClose={() => setShowToggleModal(false)}
          toggleVisibility={handleRepoVisibility}
        />
      )}
    </div>
  );
};

export default RepoSettings;
