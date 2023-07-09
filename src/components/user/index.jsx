import React from "react";
import "./user-styles.css";

const User = ({ name, color, player }) => {
  const white = color === "w";
  const image = white ? "wK" : "bK";
  // top right/left player identifier components
  return (
    <div className={`player ${player ? "you" : "opponent"}`}>
      <p>{name}</p>
      <img
        src={require(`../../assets/pieces/${image}.svg`)}
        alt="King"
        className="king"
      />
    </div>
  );
};

export default User;
