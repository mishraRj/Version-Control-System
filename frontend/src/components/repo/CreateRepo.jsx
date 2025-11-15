import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CreateRepo.css";
import NavBar from "../NavBar";
import Footer from "../Footer";

const CreateRepo = () => {
  // Fetching Current User
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `${apiUrl}/getUserProfile/${userId}`
          );
          setUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, []);

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
      const res = await axios.post(`${apiUrl}/repo/create`, {
        name: repoName,
        description: repoDescription,
        owner: userDetails._id,
        visibility: repoVisibility,
      });
      window.location.href = `/profile/${userDetails.username}`;
    } catch (err) {
      console.error(err);
      alert("Repo Creation Failed!");
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="repo-creator">
        <form action="">
          <div className="headings">
            <h3>Create a new repository</h3>
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
              {/* <div className="owner-box">
                <label htmlFor="ownerName">Owner*</label>
                <div className="dropdown" id="ownerName">
                  <button
                    className="btn btn-secondary dropdown-toggle owner-btn"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">
                    username
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#">
                        current owner
                      </a>
                    </li>
                  </ul>
                </div>
              </div> */}
              <div className="repoName-box">
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
            <h4>Configuration</h4>
            <div className="configuration-content">
              {/* Visibility */}
              <div className="config-item">
                <div className="main-content">
                  <label className="config-label">Choose visibility *</label>
                  <select
                    className="config-select"
                    value={repoVisibility}
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

              {/* README */}
              <div className="config-item">
                <div className="main-content">
                  <label className="config-label">Add README</label>
                  <div className="toggle-switch">
                    <input type="checkbox" id="readme-toggle" />
                    <label htmlFor="readme-toggle"></label>
                  </div>
                </div>
                <div className="sub-para">
                  <p className="text-secondary">
                    READMEs can be used as longer descriptions.{" "}
                    <a
                      href="https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes"
                      target="_blank">
                      About READMEs
                    </a>
                  </p>
                </div>
              </div>

              {/* .gitignore */}
              {/* <div className="config-item">
              <div className="main-content">
                <label className="config-label">Add .gitignore</label>
                <select className="config-select">
                  <option value="none">No .gitignore</option>
                  <option value="node">Node</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <div className="subpara">
                <p className="text-secondary">
                  .gitignore tells git which files not to track.{" "}
                  <a
                    href="https://docs.github.com/en/get-started/git-basics/ignoring-files"
                    target="_blanket">
                    About ignoring files
                  </a>
                </p>
              </div>
            </div> */}

              {/* License */}
              {/* <div className="config-item">
              <div className="main-content">
                <label className="config-label">Add license</label>
                <select className="config-select">
                  <option value="none">No license</option>
                  <option value="mit">MIT License</option>
                  <option value="apache">Apache 2.0</option>
                  <option value="gpl">GNU GPL v3</option>
                </select>
              </div>
              <div className="sub-para">
                <p className="text-secondary">
                  Licenses explain how others can use your code.{" "}
                  <a
                    href="https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"
                    target="_blank">
                    About licenses
                  </a>
                </p>
              </div>
            </div> */}
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button
              className="btn btn-success mt-3"
              disabled={loading}
              onClick={handleRepoCreation}>
              {loading ? "Loading..." : "Create repository"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default CreateRepo;
