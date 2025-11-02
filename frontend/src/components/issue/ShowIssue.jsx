import React, { useState } from "react";
import axios from "axios";
import DeleteIssueModal from "./tabs/DeleteIssueModal";

const ShowIssue = ({
  issue,
  userAvatar,
  fetchIssues,
  onDeleteIssue,
  repository,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localIssue, setLocalIssue] = useState(issue);
  const [loading, setLoading] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(localIssue.title);
  const [editDesc, setEditDesc] = useState(localIssue.description);

  // Toggle status handler
  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const newStatus = localIssue.status === "open" ? "closed" : "open";
      const response = await axios.put(
        `http://localhost:3002/issue/update/${localIssue._id}`,
        {
          title: localIssue.title,
          description: localIssue.description,
          status: newStatus,
        }
      );
      setLocalIssue(
        response.data.issue || { ...localIssue, status: newStatus }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:3002/issue/update/${localIssue._id}`,
        {
          title: editTitle,
          description: editDesc,
          status: localIssue.status,
        }
      );
      setLocalIssue(
        response.data.issue || {
          ...localIssue,
          title: editTitle,
          description: editDesc,
        }
      );
      setEnableEdit(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditTitle(localIssue.title);
    setEditDesc(localIssue.description);
    setEnableEdit(false);
  };

  const handleDelete = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3002/issue/delete/${issue._id}`);
      setShowDeleteModal(false);
      if (onDeleteIssue) onDeleteIssue(); // switch to issue list and reload list
    } catch (err) {
      console.error(err);
      alert("Issue Deletion Failed!");
      setLoading(false);
    }
  };

  return (
    <div className="show-issue-container">
      {/* Header Row */}
      <div className="issue-header-row">
        {enableEdit ? (
          <>
            <input
              className="edit-issue-title-input"
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              disabled={loading}
            />
            <div className="edit-actions">
              <button
                className="cancel"
                onClick={handleEditCancel}
                disabled={loading}>
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <div className="issue-header-parent">
            {/* First Line: Title, Id */}
            <div className="issue-header-top">
              <h1 className="show-issue-title" style={{ marginBottom: 0 }}>
                {localIssue.title}
                <span className="issue-number">
                  #{localIssue._id?.slice(-3)}
                </span>
              </h1>

              {/* Second Line: Status, Repo Badge */}
              <div
                className="issue-header-badges"
                style={{
                  margin: "14px 0 0 2px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}>
                <span className={`issue-status-badge ${localIssue.status}`}>
                  {localIssue.status === "open" ? "Open" : "Closed"}
                </span>
                <span className="repoIssueName-badge">
                  {repository.name}
                  <span
                    className={`repo-visibility-badge ${repository.visibility}`}>
                    {repository.visibility === "private" ? "Private" : "Public"}
                  </span>
                </span>
              </div>
            </div>
            {/* Actions */}
            <div className="issue-action-btns">
              <button
                className="issue-edit-btn"
                onClick={() => setEnableEdit(true)}>
                Edit
              </button>
              <button
                className="issue-delete-btn"
                onClick={() => setShowDeleteModal(true)}>
                Delete
              </button>
              {showDeleteModal && (
                <DeleteIssueModal
                  onClose={() => setShowDeleteModal(false)}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Issue Description */}
      <div className="show-issue-main">
        <div className="issue-author-row">
          <img
            src={userAvatar}
            alt="User Avatar"
            className="issue-author-avatar"
          />
          <span className="issue-author-name">
            {localIssue.authorName || "mishraRj"}
          </span>
          <span className="issue-author-role">Owner</span>
        </div>
        <div className="issue-description">
          {enableEdit ? (
            <textarea
              className="edit-issue-desc-textarea"
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              rows={6}
              disabled={loading}
            />
          ) : (
            <p>{localIssue.description}</p>
          )}
        </div>
      </div>

      {/* Comment/Status Section */}
      <div className="add-comment-section">
        <h3>Add a comment</h3>
        <textarea
          className="add-comment-textarea"
          placeholder="Use Markdown to format your comment"
          rows={4}
        />
        <div className="add-comment-footer">
          <button
            className={`close-issue-btn ${localIssue.status}`}
            onClick={handleToggleStatus}
            disabled={loading}>
            {loading
              ? localIssue.status === "open"
                ? "Closing..."
                : "Reopening..."
              : localIssue.status === "open"
              ? "Close issue"
              : "Reopen issue"}
          </button>
          <button className="comment-issue-btn">Comment</button>
        </div>
      </div>
    </div>
  );
};

export default ShowIssue;
