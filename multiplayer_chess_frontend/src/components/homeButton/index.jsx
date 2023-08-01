import React from "react";
import "./home-button-styles.css";

const HomeButton = ({ children }) => {
  return (
    <a className="home-button-link" href="/">
      <button  className="home-button">
        {children}
      </button>
    </a>
  );
};

export default HomeButton;
// button underneath chessboard to direct towards homepage