import React, { useRef, useContext } from "react";
import { Context } from "../../context/context";
import { type } from "../../context/action";
import "./piece-styles.css";

const Piece = (props) => {
  const { name, pob, setFromPob, playerColor } = props;
  const chessColor = name === name.toUpperCase() ? "w" : "b";

  // will check if piece is uppercase or lowercase which will determine if it is a black chess piece or a white chess piece
  // then assign the black or white label to chessColor variable

  const imageName = chessColor + name.toUpperCase();

  // combine chessColor and chess piece name into one variable so it can reference the specific image name format in assets/chess_pieces
  // wP (white Pawn), bB(black Bishop), wN (white Knight)

  const element = useRef();

  let image;

  try {
    // Used a try and catch block due to some of the cells in the board array having an empty piece name
    // which will generate an error when they try to load the asset through require()
    image = require(`../../assets/pieces/${imageName}.svg`);
  } catch (error) {
    // this error will be caught and then a fallback empty.png image will be loaded
    image = require("../../assets/pieces/empty.png");
  }

  const { dispatch } = useContext(Context);

  const handleDragStart = () => {
    setFromPob(pob);
    setTimeout(() => {
      element.current.style.display = "none";
    }, 0);

    // setFromPob function is passed down to the chessPiece react element and nested inside an eventHandler
    // when chess piece starts being dragged it will send the chess piece's current position to the setFromPob function
    // this function will then update the fromPob ref
    // then when the makeChessMove function triggers from dropping the dragged piece it will utilize this newly updated ref
  };
  const handleDragEnd = () => {
    element.current.style.display = "block";
    dispatch({ type: type.CLEAR_POTENTIAL_MOVES });
    // this is a fix for when a chess piece is dropped outside of the chessboard
    // or in a position on the chessboard where it doesn't register
    // when this occurs it will clear the highlighting
  };
  const handleClick = () => console.log({ name, pob });
  return (
    <div
      className={`piece ${playerColor === chessColor ? "active" : "inactive"}`}
      style={{
        background: `url(${image}) center center/cover`,
      }}
      draggable={true}
      ref={element}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    />
  );
};

export default Piece;
