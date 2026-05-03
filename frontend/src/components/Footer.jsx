import React from "react";
import BrandName from "./BrandName";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="compact-footer">
      <div className="compact-footer-row">
        <span className="compact-footer-copy">
          © 2026 <BrandName /> by Team RJ. All rights reserved.
        </span>
        <span className="compact-footer-social">
          <a
            href="https://github.com/mishraRj"
            target="_blank"
            aria-label="CodeVault"
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
        Built with MERN &nbsp;|&nbsp; Open-source <BrandName /> for devs.
      </div>
    </footer>
  );
};

export default Footer;
