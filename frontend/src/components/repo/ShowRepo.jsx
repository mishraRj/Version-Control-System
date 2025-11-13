import { UnderlineNav } from "@primer/react";
import { React, useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  CodeIcon,
  IssueOpenedIcon,
  GearIcon,
  HomeIcon,
} from "@primer/octicons-react";
import Code from "./tabs/Code";
import NavBar from "../NavBar";
import Issues from "./tabs/Issues";
import RepoSettings from "./tabs/RepoSettings";
import axios from "axios";

const ShowRepo = () => {
  const { username, repoName } = useParams();
  const navigate = useNavigate();
  const [loggedInUserDetails, setLoggedInUserDetails] = useState({
    username: "username",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "code";
  const [issuesTabResetKey, setIssuesTabResetKey] = useState(0);
  const [codeTabResetKey, setCodeTabResetKey] = useState(0);

  const [visitedUser, setVisitedUser] = useState(null); // user being viewed

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl); // url change hote hi tab update
  }, [tabFromUrl]);

  const handleTabChange = tab => {
    if (tab === "issues") setIssuesTabResetKey(k => k + 1);
    if (tab === "code") setCodeTabResetKey(k => k + 1);
    setActiveTab(tab);
    setSearchParams({ tab }); // URL me update karega
  };

  // Fetch logged in User Details
  useEffect(() => {
    const fetchLoggedInUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:3002/getUserProfile/${userId}`
          );
          setLoggedInUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchLoggedInUserDetails();
  }, []);

  // Fetch visited user details by username param
  useEffect(() => {
    if (!username) return;
    const fetchVisitedUser = async () => {
      try {
        const resp = await axios.get(
          `http://localhost:3002/searchUser/${username}`
        );
        console.log("visitedUser resp", resp.data);
        const user = (resp.data.users && resp.data.users[0]) || null;
        setVisitedUser(user);
      } catch (error) {
        setVisitedUser(null);
      }
    };
    fetchVisitedUser();
  }, [username]);

  const canEdit =
    loggedInUserDetails &&
    visitedUser &&
    loggedInUserDetails._id === visitedUser._id;

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

        {canEdit ? (
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
        ) : (
          <UnderlineNav.Item
            aria-current={activeTab === "home" ? "page" : undefined}
            icon={HomeIcon} // Use an appropriate icon!
            onClick={() => {
              setActiveTab("home");
              navigate("/");
            }}
            sx={{
              backgroundColor: "transparent",
              color: activeTab === "home" ? "white" : "whitesmoke",
              "&:hover": { textDecoration: "underline", color: "white" },
            }}>
            Home
          </UnderlineNav.Item>
        )}
      </UnderlineNav>
      <div className="right-section" style={{ width: "100%" }}>
        {activeTab === "code" && (
          <Code
            repoId={repoName}
            userAvatar={visitedUser?.avatar}
            resetSectionSignal={codeTabResetKey}
            canEdit={canEdit}
          />
        )}
        {activeTab === "issues" && (
          <Issues
            userAvatar={visitedUser?.avatar}
            user={loggedInUserDetails}
            resetSectionSignal={issuesTabResetKey}
            canEdit={canEdit}
          />
        )}
        {activeTab === "settings" && <RepoSettings repoId={repoName} />}
      </div>
    </>
  );
};

export default ShowRepo;
