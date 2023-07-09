import React from "react";

import "./board.styles.css";
import Cell from "../chessCell";

const Board = (props) => {
  const { cells } = props;

  // destructure the cells array from props

  return (
    <div className="board">
      {cells.map((cell, index) => (
        <Cell cell={cell} index={index} key={cell.pob} {...props} />
      ))}
    </div>
  );
};
// looping through the cells array which is the board array from create-chess-board.js
// then Cell is created as a new react component for each item in that array
// each iteration of the cell class represented by the cell parameter in the cells.map function is then
// sent to chessCell
// pass the cell and index as props

// {..props} in Cell component attributes is simply a way of passing the props from Board to ChessCell
export default Board;
