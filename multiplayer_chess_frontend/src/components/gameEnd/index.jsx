import React, { useContext } from "react";
import { Context } from "../../context/context";
import "./game-end-styles.css";
//End of Game Page HTML Page Content

const GameEnd = () => {
  const { status, currentTurn } = useContext(Context);
  console.log(Context);
  let winner;
  if (status === "checkmate") {
    if (currentTurn === "b") {
      winner = "white";
    } else {
      winner = "black";
    }
  }
  // Depending on status which is the game end condition, it will assign a winner and/or give the end game status
  const GameEndPage = () => {
    return (
      <React.Fragment>
        <div className="game-end-flex-container">
          <div className="description-container">
            <div className="description">
              <h1>Game End</h1>
              <p className="end">
                The game ended in a <mark>{status}</mark>
              </p>
              {winner && (
                <p className="winner">
                  <span>{winner}</span> won
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
