import React, { useEffect, useState } from "react";
import axios from "axios";
import HeatMapProfile from "../Heatmap";
import "./CSS/overview.css";
import { PencilIcon } from "@primer/octicons-react";

const Overview = ({ user, canEdit, apiUrl }) => {
  // const [user, setuser] = useState({ username: "username" });
  const [enableEdit, setEnableEdit] = useState(false);
  const [userAbout1, setUserAbout1] = useState();
  const [userAbout2, setUserAbout2] = useState();
  const [userAbout3, setUserAbout3] = useState();
  const [userSkills, setUserSkills] = useState();
  const [userCaption, setUserCaption] = useState();
  const [loading, setLoading] = useState(false);

  // Set Data
  useEffect(() => {
    const setData = async () => {
      if (user._id) {
        try {
          setUserAbout1(user.about1);
          setUserAbout2(user.about2);
          setUserAbout3(user.about3);
          setUserSkills(user.skills);
          setUserCaption(user.caption);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    setData();
  }, [user._id]);

  // ✏️ Toggle edit mode
  const handleEditReadme = () => {
    setEnableEdit(prev => !prev);
  };

  const handleReadMeUpdation = async e => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.put(`${apiUrl}/updateUserProfile/${user._id}`, {
        about1: userAbout1,
        about2: userAbout2,
        about3: userAbout3,
        skills: userSkills,
        caption: userCaption,
      });
      window.location.href = `/profile/${user.username}`;
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
              {user.username}/README.MD
            </p>
            {canEdit ? (
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
            ) : (
              <></>
            )}
          </div>

          <h2
            style={{
              borderBottom: "0.5px solid #3d444db3",
              paddingBottom: "5px",
            }}>
            Hi There, I'm {user.username}👋
          </h2>
          {!enableEdit && (
            <div className="edit-section">
              <p>{user.about1}</p>
              <p>{user.about2}</p>
              <p
                style={{
                  borderBottom: "0.5px solid #3d444db3",
                  paddingBottom: "5px",
                }}>
                {user.about3}
              </p>
              <h4>Skills</h4>
              <p
                style={{
                  borderBottom: "0.5px solid #3d444db3",
                  paddingBottom: "5px",
                }}>
                {user.skills}
              </p>
              <p>{user.caption}</p>
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
