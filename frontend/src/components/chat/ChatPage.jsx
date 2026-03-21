import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import Footer from "../Footer";
import io from "socket.io-client";
import "../dashboard/Dashboard.css";

const ChatPage = () => {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchChatList = async () => {
    try {
      const res = await axios.get(`${apiUrl}/chat/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatList(res.data.conversations || []);
      setUnreadCount(
        res.data.conversations.reduce(
          (acc, chat) => acc + (chat.unreadCount || 0),
          0,
        ),
      );
    } catch (error) {
      console.error("Failed to fetch chat list:", error);
    }
  };

  const fetchChatHistory = async user => {
    if (!user) return;
    try {
      const res = await axios.get(`${apiUrl}/chat/history/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatMessages(res.data.messages || []);

      // mark as read
      await axios.put(`${apiUrl}/chat/read/${user.userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChatList(prev =>
        prev.map(chat =>
          chat.userId === user.userId ? { ...chat, unreadCount: 0 } : chat,
        ),
      );
      setUnreadCount(prev => prev - (user.unreadCount || 0));

      setActiveChatUser(user);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    const s = io(apiUrl, { auth: { token } });
    setSocket(s);

    s.on("connect", () => {
      s.emit("joinRoom", userId);
    });

    s.on("newMessage", message => {
      const activeId = activeChatUser?.userId;
      const otherId = message.sender?._id || message.sender;
      const src = otherId === userId ? message.receiver?._id : otherId;

      // update list unread
      setChatList(prev =>
        prev.map(c => {
          if (c.userId.toString() === src?.toString()) {
            const isActive = c.userId.toString() === activeId?.toString();
            if (isActive) {
              setChatMessages(chatMessages => [...chatMessages, message]);
              return { ...c, unreadCount: 0 };
            }
            return { ...c, unreadCount: (c.unreadCount || 0) + 1 };
          }
          return c;
        }),
      );

      setUnreadCount(prev => {
        if (activeId && src.toString() === activeId.toString()) {
          return prev;
        }
        return prev + 1;
      });
    });

    return () => {
      s.disconnect();
    };
  }, [apiUrl, token, userId, activeChatUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!message.trim() || !activeChatUser) return;

    const outgoing = {
      sender: { _id: userId },
      receiver: { _id: activeChatUser.userId },
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post(
        `${apiUrl}/chat/send`,
        {
          receiverId: activeChatUser.userId,
          message: message.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setChatMessages(prev => [...prev, outgoing]);
      setMessage("");
    } catch (error) {
      console.error("Could not send message:", error);
    }
  };

  return (
    <>
      <NavBar />
      <section id="dashboard" style={{ padding: "0" }}>
        <aside
          className="repo-suggestions"
          style={{
            width: "30%",
            minWidth: "300px",
            maxWidth: "350px",
            height: "calc(100vh - 70px)",
            overflowY: "auto",
          }}>
          <h3 className="repo-suggestions-title">Chats</h3>
          <div className="repo-suggestions-list" style={{ paddingTop: "0" }}>
            {chatList.map(chat => (
              <div
                key={chat.userId}
                className="suggestion-row"
                style={{
                  justifyContent: "space-between",
                  background:
                    activeChatUser?.userId === chat.userId
                      ? "#21262d"
                      : "transparent",
                }}
                onClick={() => fetchChatHistory(chat)}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                  <img
                    src={chat.avatar || "/default-avatar.png"}
                    className="repo-suggestion-avatar"
                    alt="avatar"
                  />
                  <div>
                    <div style={{ color: "#58a6ff", fontWeight: 600 }}>
                      {chat.username}
                    </div>
                    <div
                      style={{
                        color: "#8b949e",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "180px",
                      }}>
                      {chat.lastMessage || "No messages yet"}
                    </div>
                  </div>
                </div>
                {chat.unreadCount > 0 && (
                  <span
                    style={{
                      background: "rgba(56, 139, 253, .3)",
                      color: "#dbe9ff",
                      borderRadius: "999px",
                      padding: "3px 9px",
                      fontSize: "0.75rem",
                    }}>
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            ))}
            {chatList.length === 0 && (
              <div style={{ color: "#8b949e" }}>No chats yet.</div>
            )}
          </div>
        </aside>

        <main
          className="middle"
          style={{
            width: "70%",
            height: "calc(100vh - 70px)",
            padding: "0",
            display: "flex",
            flexDirection: "column",
          }}>
          {!activeChatUser ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                color: "#8b949e",
              }}>
              <h1>G!thub, by RJTV Universe</h1>
              <p>Click a chat on the left to start messaging</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}>
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #30363d",
                  background: "#0d1117",
                }}>
                <h3 style={{ margin: 0 }}>{activeChatUser.username}</h3>
                <small style={{ color: "#8b949e" }}>Chat window</small>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                }}>
                {chatMessages.map((msg, idx) => {
                  const isMine =
                    msg.sender?._id === userId || msg.sender === userId;
                  return (
                    <div
                      key={idx}
                      className={`chat-message ${isMine ? "chat-message-own" : "chat-message-other"}`}>
                      <div className="chat-message-content">
                        <p>{msg.message}</p>
                        <span className="chat-message-time">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div
                style={{
                  borderTop: "1px solid #30363d",
                  padding: "12px",
                  display: "flex",
                  gap: "8px",
                }}>
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder={`Type your message to ${activeChatUser.username}...`}
                  style={{
                    flex: 1,
                    background: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "10px",
                    padding: "10px",
                    color: "#c9d1d9",
                  }}
                />
                <button
                  onClick={handleSend}
                  style={{
                    background: "#388bfd",
                    border: "1px solid #2868d4",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "10px 18px",
                    cursor: "pointer",
                  }}>
                  Send
                </button>
              </div>
            </div>
          )}
        </main>
      </section>
      <Footer />
    </>
  );
};

export default ChatPage;
