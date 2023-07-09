import React from "react";
import "./home-layout-styles.css";
const HomeLayout = ({ HomeImage, HomeContent }) => {
  return (
    <div className="container">
      <div className="app-title">Multiplayer Chess</div>
      <div className="flex">
        <HomeImage />
        <div className="content">
          <HomeContent />
        </div>
      </div>
    </div>
  );
};
export default HomeLayout;
// layout for home page
