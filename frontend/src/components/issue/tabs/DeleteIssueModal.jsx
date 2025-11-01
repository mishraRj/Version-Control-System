import React from "react";
import "../CSS/DeleteIssueModal.css"; // Copy the CSS below to this file

const DeleteIssueModal = ({ onClose, onDelete }) => {
  return (
    <div className="modal-overlay">
      <div className="delete-issue-modal">
        {/* Modal Header with Close */}
        <div className="delete-issue-header">
          <span className="delete-issue-title">Delete issue?</span>
          <button className="close-btn" onClick={onClose} title="Close">
            ×
          </button>
        </div>
        {/* Warning/message */}
        <div className="delete-issue-body">
          <ul>
            <li>This cannot be undone</li>
            <li>Only administrators can delete issues</li>
            <li>
              Deletion will remove the issue from search and previous references
              will point to a placeholder
            </li>
          </ul>
        </div>
        {/* Action row */}
        <div className="delete-issue-actions">
          <button className="delete-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-confirm-btn" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteIssueModal;
