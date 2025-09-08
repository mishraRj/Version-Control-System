import React from "react";
import { LockIcon, XIcon, StarIcon, EyeIcon } from "@primer/octicons-react";
import "./CSS/deleteRepoModal.css";

const DeleteRepoModal = ({ username, repoName, onClose, onDelete }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="firstBlock">
          {/* Header */}
          <h2 className="modal-title">
            Delete{" "}
            <span className="highlight">
              {username}/{repoName}
            </span>
          </h2>
          {/* Close button */}
          <button className="close-btn" onClick={onClose}>
            <XIcon size={20} />
          </button>
        </div>

        <div className="secondBlock">
          {/* Repo Info */}
          <div className="repo-info">
            <LockIcon size={32} />
            <p className="repo-name">
              {" "}
              {username}/{repoName}
            </p>
            <div className="repo-stats">
              <span>
                <StarIcon size={16} /> 0 stars{" "}
              </span>
              <span>
                {" "}
                <EyeIcon size={16} /> 0 watchers
              </span>
            </div>
          </div>
        </div>

        <div className="thirdBlock">
          {/* Delete Button */}
          <button className="delete-btn" onClick={onDelete}>
            I want to delete this repository
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRepoModal;
