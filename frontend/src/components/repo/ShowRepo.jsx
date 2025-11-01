import { UnderlineNav } from "@primer/react";
import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CodeIcon, IssueOpenedIcon, GearIcon } from "@primer/octicons-react";
import Code from "./tabs/Code";
import NavBar from "../NavBar";
import Issues from "./tabs/Issues";
import RepoSettings from "./tabs/RepoSettings";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const ShowRepo = () => {
  const { repoName } = useParams();
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "code";
  const [issuesTabResetKey, setIssuesTabResetKey] = useState(0);

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl); // url change hote hi tab update
  }, [tabFromUrl]);

  const handleTabChange = tab => {
    if (tab === "issues") setIssuesTabResetKey(k => k + 1);
    setActiveTab(tab);
    setSearchParams({ tab }); // URL me update karega
  };

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
      <NavBar />
      <UnderlineNav aria-label="Repository Tabs">
        <UnderlineNav.Item
          aria-current={activeTab === "code" ? "page" : undefined}
          icon={CodeIcon}
          onClick={() => handleTabChange("code")}
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
          onClick={() => handleTabChange("issues")}
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
          onClick={() => handleTabChange("settings")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "settings" ? "white" : "whitesmoke",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}>
          Settings
        </UnderlineNav.Item>
      </UnderlineNav>
      <div className="right-section" style={{ width: "100%" }}>
        {activeTab === "code" && <Code repoId={repoName} />}
        {activeTab === "issues" && (
          <Issues
            userAvatar={userDetails.avatar}
            resetSectionSignal={issuesTabResetKey}
          />
        )}
        {activeTab === "settings" && <RepoSettings repoId={repoName} />}
      </div>
    </>
  );
};

export default ShowRepo;
