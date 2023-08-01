import React, { useContext, useRef } from "react";
import { Context } from "../../context/context";
import "./game-end-styles.css";

//End of Game Page HTML Page Content

const GameEnd = () => {
  const { status, currentTurn, playerColor, playerName, opponentName } =
    useContext(Context);

  const opponentColor = playerColor === "w" ? "b" : "w";
  console.log(opponentColor);
  let winnerName;

  const statusPlaceholder = useRef("");
  statusPlaceholder.current = status;
  let winner;
  if (status === "checkmate") {
    if (currentTurn === "b") {
      winner = "white";
    } else {
      winner = "black";
    }
  }
  console.log(status);
  if (status === "concede") {
    console.log(playerColor);
    winner = playerColor === "b" ? "white" : "black";

    console.log(winner);
  }
  if (status === "opponentConcede") {
    console.log(playerColor);
    winner = playerColor === "b" ? "black" : "white";

    console.log(winner);
    statusPlaceholder.current = "concede";
  }
  // concede logic
  if (winner.charAt(0) === playerColor) {
    winnerName = playerName;
  }
  if (winner.charAt(0) === opponentColor) {
    winnerName = opponentName;
  }
  // winner name render logic

  // Depending on status which is the game end condition, it will assign a winner and/or give the end game status
  const GameEndPage = () => {
    return (
      <React.Fragment>
        <div className="game-end-flex-container">
          <div className="description-container">
            <div className="description">
              <h1>Game End</h1>
              <p className="end">
                The game ended in a <mark>{statusPlaceholder.current}</mark>
              </p>
              {winner && (
                <p className="winner">
                  <span>{`${winnerName} (${winner})`}</span> won
                </p>
              )}
            </div>
            <img
              src={require("../../assets/chess-sketch.jpg")}
              alt="A sketch of chess pieces"
              className={
                status === "checkmate" ? "position-chess-img" : "chess-img"
              }
            />
            <a href="/">
              <button
                className={
                  status === "checkmate" ? "position-play-again" : "play-again"
                }
              >
                Play Again
              </button>
            </a>
          </div>
        </div>
      </React.Fragment>
    );
  };

  return <GameEndPage />;
};

export default GameEnd;
