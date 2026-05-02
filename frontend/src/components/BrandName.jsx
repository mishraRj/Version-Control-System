import React from "react";
import "./brandName.css";

const BrandName = ({ className = "" }) => {
  return (
    <span className={`brand-title ${className}`.trim()}>
      Code<span className="brand-title-vault">Vault</span>
    </span>
  );
};

export default BrandName;
