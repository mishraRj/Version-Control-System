import { UnderlineNav } from "@primer/react";
import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CodeIcon, IssueOpenedIcon, GearIcon } from "@primer/octicons-react";
import Code from "./tabs/Code";
import Issues from "./tabs/Issues";
import RepoSettings from "./tabs/RepoSettings";
import axios from "axios";

const ShowRepo = () => {
  const { repoId } = useParams();
  const [activeTab, setActiveTab] = useState("code");
  const [userDetails, setUserDetails] = useState({ username: "username" });

  // Fetch User Details
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:3002/getUserProfile/${userId}`
          );
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
      <UnderlineNav aria-label="Repository Tabs">
        <UnderlineNav.Item
          aria-current={activeTab === "code" ? "page" : undefined}
          icon={CodeIcon}
          onClick={() => setActiveTab("code")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "code" ? "white" : "whitesmoke",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}>
          Code
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "issues" ? "page" : undefined}
          icon={IssueOpenedIcon}
          onClick={() => setActiveTab("issues")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "issues" ? "white" : "whitesmoke",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}>
          Issues
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "settings" ? "page" : undefined}
          icon={GearIcon}
          onClick={() => setActiveTab("settings")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "settings" ? "white" : "whitesmoke",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}>
          Settings
        </UnderlineNav.Item>
      </UnderlineNav>
      <div className="right-section" style={{ width: "100%" }}>
        {activeTab === "code" && <Code repoId={repoId._id} />}
        {activeTab === "issues" && <Issues />}
        {activeTab === "settings" && <RepoSettings repoId={repoId._id} />}
      </div>
    </>
  );
};

export default ShowRepo;
