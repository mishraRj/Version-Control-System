import React from "react";
import { FileIcon } from "@primer/octicons-react";
import "./CSS/code.css"; // Add CSS given below

const ShowCode = ({ fileData }) => {
  if (!fileData) return null;
  const { commit, file } = fileData;

  return (
    <div className="col-md-8 files-column">
      <div className="showcode-wrap">
        {/* —— Topbar with FileName and Commit Message —— */}
        <div className="showcode-bar">
          <span>
            <FileIcon size={22} className="showcode-fileicon" />
            <span className="showcode-filename">{file.fileName}</span>
          </span>
          <span className="showcode-msg">{commit.message}</span>
        </div>

        {/* Meta Info */}
        <div className="showcode-meta">
          Committed on {new Date(commit.date).toLocaleDateString()}
        </div>

        {/* File Content */}
        <div className="instructions">
          <code className="showcode-content">{atob(file.content)}</code>
        </div>
      </div>
    </div>
  );
};

export default ShowCode;
