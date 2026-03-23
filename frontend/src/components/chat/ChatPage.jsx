import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import Footer from "../Footer";
import io from "socket.io-client";
import "./chat.css";
import "../dashboard/Dashboard.css";

const ChatPage = () => {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const messagesEndRef = useRef(null);
  const activeChatUserRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  const getChatUserId = user => String(user?.userId || user?._id || "");
  const isUserOnline = user => onlineUserIds.includes(getChatUserId(user));

  const mergeChatUsers = (followedUsers = [], previousChats = []) => {
    const mergedMap = new Map();

    previousChats.forEach(chatUser => {
      const normalizedId = getChatUserId(chatUser);
      if (!normalizedId) return;

      mergedMap.set(normalizedId, {
        ...chatUser,
        _id: normalizedId,
        userId: normalizedId,
        isFollowedUser: false,
      });
    });

    followedUsers.forEach(followedUser => {
      const key = getChatUserId(followedUser);
      if (!key) return;

      if (mergedMap.has(key)) {
        const existingUser = mergedMap.get(key);
        mergedMap.set(key, {
          ...followedUser,
          ...existingUser,
          _id: key,
          userId: key,
          isFollowedUser: true,
        });
        return;
      }

      mergedMap.set(key, {
        ...followedUser,
        _id: key,
        userId: key,
        lastMessage: "",
        lastMessageTime: null,
        unreadCount: 0,
        isFollowedUser: true,
      });
    });

    return Array.from(mergedMap.values()).sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : 0;
      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : 0;

      if (timeA !== timeB) return timeB - timeA;
      return a.username.localeCompare(b.username);
    });
  };

  const fetchFollowedUsersFallback = async () => {
    const [profileRes, allUsersRes] = await Promise.all([
      axios.get(`${apiUrl}/getUserProfile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${apiUrl}/allUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const followedUserIds = new Set(
      (profileRes.data.followedUsers || []).map(id => id.toString()),
    );

    return (allUsersRes.data || [])
      .filter(user => followedUserIds.has(user._id?.toString()))
      .map(user => ({
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
      }));
  };

  const fetchPreviousChatsFallback = async () => {
    try {
      const res = await axios.get(`${apiUrl}/chat/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.conversations || [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    activeChatUserRef.current = activeChatUser;
  }, [activeChatUser]);

  useEffect(() => {
    if (!activeChatUser) return;
    fetchChatHistory(activeChatUser);
  }, [activeChatUser]);

  const fetchChatList = async () => {
    setLoading(true);
    try {
      const [followedUsersRes, previousChatsRes, chatListRes] =
        await Promise.allSettled([
          axios.get(`${apiUrl}/followedUsers/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/previousChats/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/chat/list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const followedUsers =
        followedUsersRes.status === "fulfilled"
          ? followedUsersRes.value.data.users || []
          : await fetchFollowedUsersFallback();

      const previousChatsFromRoute =
        previousChatsRes.status === "fulfilled"
          ? previousChatsRes.value.data.users || []
          : await fetchPreviousChatsFallback();

      const previousChatsFromChatList =
        chatListRes.status === "fulfilled"
          ? chatListRes.value.data.conversations || []
          : [];

      const previousChats = mergeChatUsers(
        [],
        [...previousChatsFromRoute, ...previousChatsFromChatList],
      );

      const mergedChatList = mergeChatUsers(followedUsers, previousChats);

      setChatList(mergedChatList);
      setUnreadCount(
        mergedChatList.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0),
      );
    } catch (error) {
      console.error("Failed to fetch chat list:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async user => {
    const otherUserId = getChatUserId(user);
    if (!otherUserId) return;

    try {
      const res = await axios.get(`${apiUrl}/chat/history/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatMessages(res.data.messages || []);

      await axios.put(`${apiUrl}/chat/read/${otherUserId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChatList(prev =>
        prev.map(chat =>
          getChatUserId(chat) === otherUserId
            ? { ...chat, unreadCount: 0 }
            : chat,
        ),
      );
      setUnreadCount(prev => Math.max(0, prev - (user.unreadCount || 0)));
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setChatMessages([]);
    }
  };

  const handleChatSelect = user => {
    if (!user) return;
    setActiveChatUser(user);
    setMessage("");
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    const socket = io(apiUrl, { auth: { token } });

    socket.on("connect", () => {
      socket.emit("joinRoom", userId);
    });

    socket.on("presence:list", onlineUsers => {
      setOnlineUserIds((onlineUsers || []).map(String));
    });

    socket.on("presence:update", ({ userId: updatedUserId, isOnline }) => {
      const normalizedUserId = String(updatedUserId || "");
      if (!normalizedUserId) return;

      setOnlineUserIds(currentOnlineUsers => {
        if (isOnline) {
          return currentOnlineUsers.includes(normalizedUserId)
            ? currentOnlineUsers
            : [...currentOnlineUsers, normalizedUserId];
        }

        return currentOnlineUsers.filter(
          currentUserId => currentUserId !== normalizedUserId,
        );
      });
    });

    socket.on("newMessage", incomingMessage => {
      const activeId = getChatUserId(activeChatUserRef.current);
      const otherId = incomingMessage.sender?._id || incomingMessage.sender;
      const sourceUserId =
        otherId === userId ? incomingMessage.receiver?._id : otherId;
      const isActiveChat =
        activeId && sourceUserId?.toString() === activeId.toString();

      if (isActiveChat) {
        setChatMessages(currentMessages => [
          ...currentMessages,
          incomingMessage,
        ]);
      }

      fetchChatList();
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, token, userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!message.trim() || !activeChatUser) return;

    const activeChatUserId = getChatUserId(activeChatUser);
    if (!activeChatUserId) return;

    const outgoing = {
      sender: { _id: userId },
      receiver: { _id: activeChatUserId },
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post(
        `${apiUrl}/chat/send`,
        {
          receiverId: activeChatUserId,
          message: message.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setChatMessages(prev => [...prev, outgoing]);
      setMessage("");
      fetchChatList();
    } catch (error) {
      console.error("Could not send message:", error);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChatUser) return;

    const activeChatUserId = getChatUserId(activeChatUser);
    if (!activeChatUserId) return;

    try {
      await axios.delete(`${apiUrl}/chat/delete/${activeChatUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatMessages([]);
      setActiveChatUser(null);
      fetchChatList();
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const renderChatPanel = panelClassName => (
    <div className={panelClassName}>
      <div className="chat-panel-header">
        <button
          type="button"
          className="chat-user-profile chat-page-profile-link"
          onClick={() => navigate(`/profile/${activeChatUser.username}`)}>
          <img
            src={activeChatUser.avatar || "/default-avatar.png"}
            alt={activeChatUser.username}
          />
          <div>
            <h3>{activeChatUser.username}</h3>
            <span className="chat-user-status">
              <span
                className={`chat-user-status-dot ${
                  isUserOnline(activeChatUser)
                    ? "chat-user-status-dot-online"
                    : "chat-user-status-dot-offline"
                }`}
              />
              {isUserOnline(activeChatUser) ? "Online" : "Offline"}
            </span>
          </div>
        </button>
        <div className="chat-header-actions">
          <button className="chat-delete-btn" onClick={handleDeleteChat}>
            Delete Chat
          </button>
          <button
            className="chat-close-btn"
            onClick={() => setActiveChatUser(null)}>
            ×
          </button>
        </div>
      </div>

      <div
        className={`chat-panel-body ${
          chatMessages.length > 0 ? "chat-ready" : ""
        }`}>
        {chatMessages.length === 0 ? (
          <div className="chat-empty">
            <p>
              <strong>Say Hi to {activeChatUser.username}</strong>
            </p>
            <p className="chat-body-hint">
              Start a conversation. Messages will appear here.
            </p>
          </div>
        ) : (
          <div className="chat-messages">
            {chatMessages.map((msg, idx) => {
              const isMine =
                msg.sender?._id === userId || msg.sender === userId;

              return (
                <div
                  key={idx}
                  className={`chat-message ${
                    isMine ? "chat-message-own" : "chat-message-other"
                  }`}>
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
        )}
      </div>

      <div className="chat-panel-footer">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder={`Type your message to ${activeChatUser.username}...`}
        />
        <button onClick={handleSend} disabled={!message.trim()}>
          Send
        </button>
      </div>
    </div>
  );

  return (
    <>
      <NavBar />
      <section className="chat-page">
        {(!isMobile || !activeChatUser) && (
          <aside className="chat-page-sidebar">
          <h3 className="chat-page-sidebar-title">Chats</h3>
          <div className="chat-page-list">
            {loading ? (
              "Loading..."
            ) : (
              <>
                {chatList.map(chat => (
                  <div
                    key={chat.userId}
                    className={`chat-page-list-item ${
                      getChatUserId(activeChatUser) === getChatUserId(chat)
                        ? "chat-page-list-item-active"
                        : ""
                    }`}
                    onClick={() => handleChatSelect(chat)}>
                    <div className="chat-page-list-user">
                      <img
                        src={chat.avatar || "/default-avatar.png"}
                        className="chat-page-list-avatar"
                        alt="avatar"
                      />
                      <div className="chat-page-list-meta">
                        <div className="chat-page-list-name-row">
                          <div className="chat-page-list-name">
                            {chat.username}
                          </div>
                          {!activeChatUser && isUserOnline(chat) && (
                            <span className="chat-page-list-online">
                              online
                            </span>
                          )}
                        </div>
                        <div className="chat-page-list-preview">
                          {chat.lastMessage ||
                            (chat.isFollowedUser
                              ? "Start a conversation"
                              : "No messages yet")}
                        </div>
                      </div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="chat-page-unread">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                ))}
                {chatList.length === 0 && (
                  <div className="chat-page-empty-state">
                    No followed users or chats yet.
                  </div>
                )}
              </>
            )}
          </div>
          </aside>
        )}

        {(!isMobile || activeChatUser) && (
          <main className="chat-page-main">
            {!activeChatUser ? (
              <div className="chat-page-placeholder">
                <h1>
                  G!thub, by{" "}
                  <a
                    href="https://rjtv-universe.onrender.com/"
                    target="_blank"
                    rel="noopener noreferrer">
                    RJTV Universe 👽
                  </a>
                </h1>
                <p>Click a chat on the left to open the chat panel</p>
              </div>
            ) : (
              renderChatPanel("chat-page-desktop-panel")
            )}
          </main>
        )}
      </section>
      <Footer />
    </>
  );
};

export default ChatPage;
