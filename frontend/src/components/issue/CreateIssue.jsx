import { React, useEffect, useState } from "react";

const CreateIssue = ({
  userAvatar,
  handleBackToList,
  repository,
  fetchIssues,
  user,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const issue = { title, description, repository };
      const response = await fetch(
        `http://localhost:3002/issue/create/${user._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(issue),
        }
      );
      handleBackToList();
      fetchIssues();
    } catch (err) {
      console.error(err);
      alert("Issue Creation Failed!");
    }
    // handle success/error
  };

  return (
    <div className="createIssueForm">
      <div className="formHeader">
        <img src={userAvatar} alt="User Avatar" className="avatar" />
        <span className="formTitle">Create new issue</span>
      </div>
      <form onSubmit={handleSubmit}>
        <label className="label" htmlFor="title">
          Add a title <span className="required">*</span>
        </label>
        <input
          id="title"
          className="input"
          type="text"
          placeholder="Title"
          value={title}
          required
          onChange={e => setTitle(e.target.value)}
        />

        <label className="label" htmlFor="desc">
          Add a description
        </label>
        <div className="descTabs">
          <span className="tab active">Write</span>
        </div>
        <textarea
          id="desc"
          className="textarea"
          rows={10}
          placeholder="Type your description here..."
          value={description}
          required
          onChange={e => setDescription(e.target.value)}
        />
        <div className="descActions">
          <span>Paste, drop, or click to add files</span>
        </div>
        <div className="formFooter">
          <button
            type="button"
            className="cancelBtn"
            onClick={handleBackToList}>
            Cancel
          </button>
          <button type="submit" className="createBtn">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIssue;
