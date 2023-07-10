import React, { useContext } from "react";

import "./cell-styles.css";
import { isLightSquare } from "../../functions";
import Piece from "../chessPiece";
import { Context } from "../../context/context";
const Cell = (props) => {
  const { cell, index, moveChessPiece, setFromPob, playerColor } = props;

  // cell component which is iterated over the board array in the Board component to create a Cell component for each cell in the board array
  // it will have the pob and piece properties
  // the index prop is the index of the cell in the board array
  // the index will deterimine whether the cell is dark or light

  const lightSquare = isLightSquare(cell.pob, index);
  // if isLightSquare returns true it will add the light class that will style the cell a lighter color
  // if it returns false the color of the cell will become darker
  // this component will then return a div with a piece component to represent the rendered html for each cell in the board array

  const { potentialMoves, inCheck, currentTurn } = useContext(Context);
  // utilizes useContext to pass relevant variables/state (incheck highlighting, chess move rendering)
  // from Context (ChessProvider) parent component/context.js

  const isPotentialMove = potentialMoves.includes(cell.pob);
  // checks potentialMoves array state passed from context.js for possible moves
  // if the chess cell position is in the potentialMoves array it will return true

  const color = cell.piece.toUpperCase() === cell.piece ? "w" : "b";
  // because in the chess.piece uppercase pieces represent white and lowercase represent black
  // if it is uppercase it will return 'w' meaning white if it is lowercase it will return 'b' meaning black

  const currentPlayerInCheck = () => {
    const king = cell.piece.toUpperCase() === "K";
    return currentTurn === color && king && inCheck;
  };
  // first line checks if the current piece in this cell is a king
  // it then returns a shortcircuited and logic that only returns true if all subsequent variables evaluate to true
  // currentTurn === color checks if the passed cell has a piece that matches the current turn's color
  // if currentTurn === color is true it will then evaluate if the king variable is true (exists) which will see if the cell's piece is a king piece
  // if that is true it will then evaluate inCheck which will tell us if the current player is in check
  // by default of chess when a player get's checked it will become their turn

  //--------------------------------------------------------------------------------------------//
  // adds the moveChessPiece function from the game component inside chessGame folder to an event handler
  // moveChessPiece is passed the cells position
  // moveChessPiece is attached to onDrop event so that it will only trigger when an element is dropped after dragging
  // this will only update the position of the board after the piece is dropped and not before
  // onDragOver is passed e.preventDefault arrow function to make our ChessCell components draggable
  const handleDrop = () => {
    moveChessPiece(cell.pob);
  };
  // we set the setFromPob function as a prop in the Piece component

  return (
    <div
      className={`cell ${lightSquare ? "light" : "dark"}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        className={`overlay ${isPotentialMove && "potential-move"} ${
          currentPlayerInCheck() && "in-check"
        }`}
      >
        <Piece
          pob={cell.pob}
          name={cell.piece}
          setFromPob={setFromPob}
          playerColor={playerColor}
        />
      </div>
    </div>
  );
};
// the cell.pob will render the position on board of the cell
// if isPotentialMove returns true it shortcircuits and adds the potential-move class to the cell

// if all the short circuit and logic returned from currentPlayerInCheck is true it will evaluate the value
// after && which will add the "in-check" class to the king's cell. This will highlight the cell red.
export default Cell;
