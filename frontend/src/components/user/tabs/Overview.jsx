import React, { useEffect, useState } from "react";
import axios from "axios";
import HeatMapProfile from "../Heatmap";
import "./CSS/overview.css";
import { PencilIcon } from "@primer/octicons-react";

const Overview = () => {
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const [enableEdit, setEnableEdit] = useState(false);
  const [userAbout1, setUserAbout1] = useState();
  const [userAbout2, setUserAbout2] = useState();
  const [userAbout3, setUserAbout3] = useState();
  const [userSkills, setUserSkills] = useState();
  const [userCaption, setUserCaption] = useState();
  const [loading, setLoading] = useState(false);

  // Fetch User
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:3002/getUserProfile/${userId}`
          );
          setUserDetails(response.data);
          setUserAbout1(response.data.about1);
          setUserAbout2(response.data.about2);
          setUserAbout3(response.data.about3);
          setUserSkills(response.data.skills);
          setUserCaption(response.data.caption);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, []);

  // ✏️ Toggle edit mode
  const handleEditReadme = () => {
    setEnableEdit(prev => !prev);
  };

  const handleReadMeUpdation = async e => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.put(
        `http://localhost:3002/updateUserProfile/${userDetails._id}`,
        {
          about1: userAbout1,
          about2: userAbout2,
          about3: userAbout3,
          skills: userSkills,
          caption: userCaption,
        }
      );
      window.location.href = "/profile";
    } catch (err) {
      console.error(err);
      alert("Repo updation Failed!");
      setLoading(false);
    }
  };
  return (
    <>
      <div className="overview-container">
        <div className="local-ReadMe">
          <div className="topLayer">
            <p
              className="text-secondary fw-semibold"
              style={{ fontSize: "0.8rem" }}>
              {userDetails.username}/README.MD
            </p>
            <span
              className="pencil d-flex align-items-center gap-1 position-relative"
              style={{
                width: "30px",
                cursor: "pointer",
                padding: "4px 6px",
                fontSize: "0.75rem",
              }}
              onClick={handleEditReadme}>
              <PencilIcon size={16} />
            </span>
          </div>

          <h2
            style={{
              borderBottom: "0.5px solid #3d444db3",
              paddingBottom: "5px",
            }}>
            Hi There, I'm {userDetails.username}👋
          </h2>
          {!enableEdit && (
            <div className="edit-section">
              <p>{userDetails.about1}</p>
              <p>{userDetails.about2}</p>
              <p
                style={{
                  borderBottom: "0.5px solid #3d444db3",
                  paddingBottom: "5px",
                }}>
                {userDetails.about3}
              </p>
              <h4>Skills</h4>
              <p
                style={{
                  borderBottom: "0.5px solid #3d444db3",
                  paddingBottom: "5px",
                }}>
                {userDetails.skills}
              </p>
              <p>{userDetails.caption}</p>
            </div>
          )}

          {enableEdit && (
            <form action="">
              <div className="edit-section2">
                <h4>About</h4>
                <label htmlFor="about1">Line1: </label>
                <input
                  type="text"
                  value={userAbout1}
                  id="about1"
                  max={70}
                  onChange={e => setUserAbout1(e.target.value)}
                />{" "}
                <br />
                <label htmlFor="about2">Line2: </label>
                <input
                  type="text"
                  value={userAbout2}
                  id="about2"
                  max={70}
                  onChange={e => setUserAbout2(e.target.value)}
                />{" "}
                <br />
                <label htmlFor="about3">Line3: </label>
                <input
                  type="text"
                  value={userAbout3}
                  id="about3"
                  max={70}
                  onChange={e => setUserAbout3(e.target.value)}
                  style={{
                    marginBottom: "15px",
                  }}
                />{" "}
                <br />
                <h4
                  style={{
                    borderTop: "0.5px solid #3d444db3",
                    paddingTop: "5px",
                  }}>
                  Skills:
                </h4>
                <input
                  type="text"
                  value={userSkills}
                  onChange={e => setUserSkills(e.target.value)}
                />
                <p
                  style={{
                    borderBottom: "0.5px solid #3d444db3",
                    paddingBottom: "5px",
                  }}></p>
                <h4>Caption:</h4>
                <input
                  type="text"
                  value={userCaption}
                  max={50}
                  onChange={e => setUserCaption(e.target.value)}
                />
                <p
                  style={{
                    borderBottom: "0.5px solid #3d444db3",
                    paddingBottom: "5px",
                  }}></p>
                <div className="saving-btns d-flex justify-content-center align-items-center gap-3 mt-2">
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={loading}
                    onClick={handleReadMeUpdation}>
                    {loading ? "Loading..." : "Save"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleEditReadme}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
        <div className="heat-map-section">
          <HeatMapProfile />
        </div>
      </div>
    </>
  );
};

export default Overview;
