import React, { useContext, useEffect } from "react";
import "./concede-button-styles.css";

import { Context } from "../../context/context";

import { setStatus } from "../../context/action.js";
// import {
//   setMessage,
//   setOpponent,
//   setOpponentMoves,
//   setPlayer,
//   setPlayerColor,
//   setReloadState,
//   setReceivedReloadState,
//   setOpponentLeftState,
// } from "../../context/action.js";

const ConcedeButton = ({ children, setEndGameFlag, concedeDisabled }) => {
  // When concede button is pressed it alters the fenstate into a position that checkmates currentPlayer which triggers end game screen
  const { dispatch, status } = useContext(Context);
  console.log(concedeDisabled);
  // console.log(status)
  // const [endGame, status] = endGameState(chess)
  useEffect(() => {}, [status]);
  function concedeOnClick() {
    if (concedeDisabled.current === false) {
      // console.log(fen);
      // let status = 'test'
      dispatch(setStatus("concede"));

      setEndGameFlag(true);
    }
  }
  return (
    <button onClick={concedeOnClick} className="concede-button">
      {children}
    </button>
  );
};

export default ConcedeButton;
// concedes the game
