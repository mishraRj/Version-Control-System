import React, { useState, useEffect, useRef } from "react";
import "./dashboard/Dashboard.css";
import NavBar from "./NavBar";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer";
import io from "socket.io-client";

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null); // session user
  const [loadingUserIds, setLoadingUserIds] = useState([]);
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const chatUserRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Get search term from URL on mount/update (react-router v6)
  const searchTerm = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    setSearchValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    chatUserRef.current = chatUser;
  }, [chatUser]);

  // Fetch users by searchTerm
  useEffect(() => {
    if (!searchTerm) {
      setSearchedUsers([]);
      return;
    }
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await axios.get(`${apiUrl}/searchUser/${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Calculate isFollowing for each
        const apiUsers = resp.data.users || [];
        const processedUsers = apiUsers.map(user => ({
          ...user,
          isFollowing: loggedInUser?.followedUsers?.includes(user._id),
        }));
        setSearchedUsers(processedUsers);
      } catch (error) {
        setSearchedUsers([]);
      }
    };
    fetchUsers();
  }, [searchTerm, loggedInUser]);

  // Fetch logged-in user by localStorage userId
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId) return;
    axios
      .get(`${apiUrl}/getUserProfile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setLoggedInUser(res.data))
      .catch(() => setLoggedInUser(null));
  }, []);

  // Socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId || socket) return; // Prevent multiple connections

    try {
      const newSocket = io(apiUrl, {
        auth: { token },
        transports: ["websocket", "polling"], // Fallback transports
      });
      setSocket(newSocket);

      newSocket.emit("joinRoom", userId);

      newSocket.on("newMessage", message => {
        const activeUser = chatUserRef.current;
        const otherUserId = activeUser?._id;
        const isActiveChat =
          otherUserId &&
          (message.sender?._id === otherUserId ||
            message.receiver?._id === otherUserId);

        if (isActiveChat) {
          setChatMessages(prev => [...prev, message]);
        }
      });

      newSocket.on("connect", () => {
        console.log("Connected to chat server");
      });

      newSocket.on("connect_error", error => {
        console.error("Socket connection error:", error);
      });

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    } catch (error) {
      console.error("Failed to initialize socket:", error);
    }
  }, [apiUrl, socket]);

  // Fetch chat history when chatUser changes
  useEffect(() => {
    if (!chatUser || !loggedInUser) return;

    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${apiUrl}/chat/history/${chatUser._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setChatMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setChatMessages([]);
      }
    };

    fetchChatHistory();
  }, [chatUser, loggedInUser, apiUrl]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const existingUser =
    loggedInUser && searchedUsers && loggedInUser._id === searchedUsers._id;

  const handleFollowToggle = async (visitedUserId, currentlyFollowing) => {
    if (!loggedInUser?._id || !visitedUserId) return;
    // Add user to loading ids
    setLoadingUserIds(prev => [...prev, visitedUserId]);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/toggleFollow/${visitedUserId}`,
        { loggedInUserId: loggedInUser._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSearchedUsers(prev =>
        prev.map(user =>
          user._id === visitedUserId
            ? { ...user, isFollowing: !currentlyFollowing }
            : user,
        ),
      );
    } catch (err) {
      console.error("Cannot follow/unfollow user: ", err);
    } finally {
      // Remove user from loading ids
      setLoadingUserIds(prev => prev.filter(id => id !== visitedUserId));
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !chatUser || !loggedInUser) return;

    const newMessage = {
      sender: {
        _id: loggedInUser._id,
        username: loggedInUser.username,
        avatar: loggedInUser.avatar,
      },
      receiver: {
        _id: chatUser._id,
        username: chatUser.username,
        avatar: chatUser.avatar,
      },
      message: chatMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/chat/send`,
        {
          receiverId: chatUser._id,
          message: chatMessage.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Add outgoing message instantly
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteChat = async () => {
    if (!chatUser) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/chat/delete/${chatUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatMessages([]);
      alert("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Fetching Suggested Repos
  useEffect(() => {
    if (!loggedInUser?._id) return;
    const fetchSuggestedRepositories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${apiUrl}/repo/user/${loggedInUser._id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setSuggestedRepositories(data.repositories);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };
    fetchSuggestedRepositories();
  }, [loggedInUser]);

  return (
    <>
      <NavBar />
      <section id="dashboard">
        <aside className="repo-suggestions">
          <h3 className="repo-suggestions-title">Suggested Repositories</h3>
          <div className="repo-suggestions-list">
            {suggestedRepositories.map(repo => (
              <div
                className="repo-suggestion-row"
                key={repo._id}
                onClick={() =>
                  navigate(`/${repo.owner.username}/${repo.name}`)
                }>
                <img
                  className="repo-suggestion-avatar"
                  src={repo.owner?.avatar}
                  alt="Repo Owner"
                />
                <div className="repo-suggestion-info">
                  <div className="repo-suggestion-name">{repo.name}</div>
                  <div className="repo-suggestion-status">
                    {repo.visibility}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="middle">
          <div className="search-users-list" style={{ marginBottom: "50px" }}>
            <h2>Search Results for "{searchValue}"</h2>
            {searchedUsers.length === 0 && (
              <div
                style={{
                  opacity: 0.78,
                  fontSize: "1.07rem",
                  marginTop: "22px",
                }}>
                No users found.
              </div>
            )}
            {searchedUsers
              .filter(user => loggedInUser?._id !== user._id)
              .map(user => (
                <div
                  key={user._id}
                  className="searched-user-card"
                  onClick={() => navigate(`/profile/${user.username}`)}>
                  <div className="usercard-row">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      className="usercard-avatar"
                      alt="avatar"
                    />
                    <span className="searched-user-username">
                      {user.username}
                    </span>
                  </div>
                  <p className="searched-user-bio">
                    {user.bio || "No bio yet."}
                  </p>
                  <div className="userBtns">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleFollowToggle(user._id, user.isFollowing);
                      }}
                      className={user.isFollowing ? "following-btn" : ""}
                      disabled={loadingUserIds.includes(user._id)}>
                      {loadingUserIds.includes(user._id)
                        ? "Loading..."
                        : user.isFollowing
                          ? "Following"
                          : "Follow"}
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setChatUser(user);
                        setChatMessage("");
                      }}>
                      Connect +
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </main>

        {chatUser && (
          <div className="chat-right-panel">
            <div className="chat-panel-header">
              <div className="chat-user-profile">
                <img
                  src={chatUser.avatar || "/default-avatar.png"}
                  alt={chatUser.username}
                />
                <div>
                  <h3>{chatUser.username}</h3>
                  <span>Chat window</span>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="chat-delete-btn" onClick={handleDeleteChat}>
                  Delete Chat
                </button>
                <button
                  className="chat-close-btn"
                  onClick={() => setChatUser(null)}>
                  ×
                </button>
              </div>
            </div>
            <div
              className={`chat-panel-body ${chatMessages.length > 0 ? "chat-ready" : ""}`}>
              {chatMessages.length === 0 ? (
                <div className="chat-empty">
                  <p>
                    <strong>Say Hi to {chatUser.username}</strong>
                  </p>
                  <p className="chat-body-hint">
                    Start a conversation. Messages will appear here.
                  </p>
                </div>
              ) : (
                <div className="chat-messages">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`chat-message ${
                        msg.sender._id === loggedInUser?._id
                          ? "chat-message-own"
                          : "chat-message-other"
                      }`}>
                      <div className="chat-message-content">
                        <p>{msg.message}</p>
                        <span className="chat-message-time">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <div className="chat-panel-footer">
              <input
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleSendMessage()}
                placeholder={`Type your message to ${chatUser.username}...`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}>
                Send
              </button>
            </div>
          </div>
        )}

        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li>
              <p>AI Workshop - Jan 10</p>
            </li>
            <li>
              <p>Cloud Expo - Feb 28</p>
            </li>
            <li>
              <p>Startup Pitch Day - Mar 12</p>
            </li>
            <li>
              <p>Cybersecurity Summit - Apr 7</p>
            </li>
            <li>
              <p>Open Source Con - May 19</p>
            </li>
            <li>
              <p>Blockchain Forum - Jul 3</p>
            </li>
            <li>
              <p>UX Design Conference - Aug 21</p>
            </li>
            <li>
              <p>Mobile Dev Camp - Sep 9</p>
            </li>
            <li>
              <p>JavaScript World - Oct 14</p>
            </li>
            <li>
              <p>DevOps Summit - Nov 30</p>
            </li>
          </ul>
        </aside>
      </section>
      <Footer />
    </>
  );
};

export default Search;
