import React, { useEffect } from "react";

const AuthToast = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return undefined;

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="auth-toast" role="alert" aria-live="assertive">
      <div className="auth-toast-icon" aria-hidden="true">
        X
      </div>
      <div className="auth-toast-content">
        <strong>Something went wrong</strong>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default AuthToast;
