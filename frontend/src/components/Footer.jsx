import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="compact-footer">
      <div className="compact-footer-row">
        <span className="compact-footer-copy">
          © 2025 Version Control System by Rajat Mishra
        </span>
        <span className="compact-footer-social">
          <a
            href="https://github.com/mishraRj"
            target="_blank"
            aria-label="GitHub"
            rel="noopener noreferrer">
            <i className="fab fa-github"></i>
          </a>
          <a
            href="https://www.linkedin.com/in/mishrarj/"
            target="_blank"
            aria-label="LinkedIn"
            rel="noopener noreferrer">
            <i className="fab fa-linkedin"></i>
          </a>
          <a
            href="https://www.instagram.com/rajatmishra2003/"
            target="_blank"
            aria-label="Instagram"
            rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://t.me/the_king_of_pirates123"
            target="_blank"
            aria-label="Telegram"
            rel="noopener noreferrer">
            <i className="fab fa-telegram-plane"></i>
          </a>
        </span>
      </div>
      <div className="compact-footer-note">
        Built with MERN &nbsp;|&nbsp; Open-source GitHub clone for devs.
      </div>
    </footer>
  );
};

export default Footer;
