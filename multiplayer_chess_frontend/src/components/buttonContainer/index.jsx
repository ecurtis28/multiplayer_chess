import React from "react";
import "./button-container-styles.css";
import ConcedeButton from "../concedeButton";
import HomeButton from "../homeButton";

const ButtonContainer = ({ chess, setEndGameFlag, concedeDisabled }) => {
  // When concede button is pressed it alters the fenstate into a position that checkmates currentPlayer which triggers end game screen

  return (
    <div className={"flex-container"}>
      <HomeButton>Play Another Game</HomeButton>
      <ConcedeButton
        concedeDisabled={concedeDisabled}
        setEndGameFlag={setEndGameFlag}
        chess={chess}
      >
        Concede
      </ConcedeButton>
    </div>
  );
};

export default ButtonContainer;
// button underneath chessboard to direct towards homepage
