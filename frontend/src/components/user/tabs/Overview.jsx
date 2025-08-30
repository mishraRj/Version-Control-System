import React, { useEffect, useState } from "react";
import axios from "axios";
import HeatMapProfile from "../Heatmap";
import "./CSS/overview.css";

const Overview = () => {
  // Fetch User
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
  return (
    <>
      <div className="overview-container">
        <div className="local-ReadMe">
          <p
            className="text-secondary fw-semibold"
            style={{ fontSize: "0.8rem" }}>
            {userDetails.username}/README.MD
          </p>

          <h2
            style={{
              borderBottom: "0.5px solid #3d444db3",
              paddingBottom: "5px",
            }}>
            Hi There, I'm {userDetails.username}👋
          </h2>
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
        <div className="heat-map-section">
          <HeatMapProfile />
        </div>
      </div>
    </>
  );
};

export default Overview;
