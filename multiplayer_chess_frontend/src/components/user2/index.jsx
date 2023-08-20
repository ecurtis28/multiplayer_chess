import React, { useEffect, useRef } from "react";
import "./user-styles.css";

const User2 = ({
  name,
  color,
  player,
  outline,
  promotionConfirmationFlag,
  chess,
  fromToData,
  pauseGame,
  setEndPauseGame,
  setFenState,
  setSendPromotionFlag,
  currentTurn,
}) => {
  const white = color === "w";
  const image = white ? "wK" : "bK";
  // top right/left player identifier components
  const playerPromoted = useRef(false);
  let singleInstancePlayerPromotedFlag = useRef(false);

  useEffect(() => {
    if (
      promotionConfirmationFlag === true &&
      singleInstancePlayerPromotedFlag.current === false
    ) {
      if (currentTurn === color) {
        playerPromoted.current = true;
        singleInstancePlayerPromotedFlag.current = true;
      }
    }

    console.log(
      "playerPromoted",
      playerPromoted.current,
      "singleInstancePlayerPromotedFlag",
      singleInstancePlayerPromotedFlag.current,
      "promotionConfirmationFlag",
      promotionConfirmationFlag
    );
    console.log(
      "playerPromoted",
      playerPromoted.current,
      "singleInstancePlayerPromotedFlag",
      singleInstancePlayerPromotedFlag.current,
      "promotionConfirmationFlag",
      promotionConfirmationFlag
    );
    console.log(
      "playerPromoted",
      playerPromoted.current,
      "singleInstancePlayerPromotedFlag",
      singleInstancePlayerPromotedFlag.current,
      "promotionConfirmationFlag",
      promotionConfirmationFlag
    );
  
  }, [promotionConfirmationFlag]);

  const pawnPromotionQueen = useRef(false);
  const pawnPromotionKnight = useRef(false);
  const pawnPromotionRook = useRef(false);
  const pawnPromotionBishop = useRef(false);
  // this checks which piece was selected

  function pawnPromotionBishopActivate() {
    pawnPromotionBishop.current = true;
    pawnPromotionKnight.current = false;
    pawnPromotionQueen.current = false;
    pawnPromotionRook.current = false;
  }
  function pawnPromotionRookActivate() {
    pawnPromotionRook.current = true;
    pawnPromotionKnight.current = false;
    pawnPromotionQueen.current = false;
    pawnPromotionBishop.current = false;
  }
  function pawnPromotionKnightActivate() {
    pawnPromotionKnight.current = true;
    pawnPromotionRook.current = false;
    pawnPromotionBishop.current = false;
    pawnPromotionQueen.current = false;
  }
  function pawnPromotionQueenActivate() {
    pawnPromotionQueen.current = true;
    pawnPromotionRook.current = false;
    pawnPromotionBishop.current = false;
    pawnPromotionKnight.current = false;
  }
  function pawnPromotionOnClick() {
    let promotedChessPiece;

    if (pawnPromotionBishop.current === true) promotedChessPiece = "Bishop";
    if (pawnPromotionKnight.current === true) promotedChessPiece = "Knight";
    if (pawnPromotionQueen.current === true) promotedChessPiece = "Queen";
    if (pawnPromotionRook.current === true) promotedChessPiece = "Rook";
    console.log(promotedChessPiece);
    const { from, to } = fromToData;
    console.log(from, to);
    chess.move({ from, to, promotion: "q" });

    let fenIndex1;
    let fenIndex2Start;
    let fenIndex2End;
    let fen = chess.fen();
    let alteredFen;

    for (let i = 0; i < fen.length; i++) {
      console.log(fen[i]);
      if (fen[i] === "/") {
        fenIndex1 = i;
        break;
      }
    }
    // find index in string where / first appears
    let fenRow1 = chess.fen().slice(0, fenIndex1);
    let fenRow1Compare = chess.fen().slice(0, fenIndex1).split("");
    // take that index and use it in slice to get the first row of the fen string

    let fenRow1CompareArray;
    console.log(fenRow1);
    for (let i = fen.length - 1; i >= 0; i--) {
      console.log(fen[i]);

      if (fen[i] === "/") {
        fenIndex2Start = i + 1;
        console.log(fenIndex2Start);
        break;
      }
    }
    // find index where / appears at end of fenString

    fenIndex2End = chess.fen().indexOf(" ");
    // find where " " appears at end of fenString
    console.log(fenIndex2End);

    let fenRow2 = chess.fen().slice(fenIndex2Start, fenIndex2End);
    // use those two indexes to slice the last row of fenString
    console.log(fenRow2);
    let fenRow2Compare = chess
      .fen()
      .slice(fenIndex2Start, fenIndex2End)
      .split("");
    let fenRow2CompareArray;
    for (let i = 0; i < fenRow2.length; i++) {
      console.log(fenRow2[i]);
      //  loop over fenRow2 to remove any potential numbers and replace it with placeholders

      if (isFinite(fenRow2[i])) {
        const stringToNumber = Number(fenRow2[i]);
        console.log(stringToNumber);
        let char = "";
        for (let x = 0; x < stringToNumber; x++) {
          char = char + "s";
        }

        console.log(typeof fenRow2Compare, fenRow2Compare);
        fenRow2Compare.splice(i, 1, char);
        console.log(typeof fenRow2Compare, fenRow2Compare);
        fenRow2Compare.join("");
      }
      // remove the number and create a place holder for those empty spaces (like s or something)
      // then when the fen string has same number of characters as the positions in a row of a chess board (8)
      // we can iterate over the fen string and if it lines up with the to position above that is the position where we will replace the auto promoted queen with the selected piece
      // once the piece is replaced (if they choose rook it would be "r" instead of "q") we will then reconvert it back to it's original fen value by removing the placeholder and putting back the number it originally had
      // then we will update the fenState which will reload the board
      // however this time it will have the chess piece we selected instead of autopromoted queen
    }
    for (let i = 0; i < fenRow1.length; i++) {
      console.log(fenRow1[i]);
      //  loop over fenRow1 to remove any potential numbers and replace it with placeholders

      if (isFinite(fenRow1[i])) {
        const stringToNumber = Number(fenRow1[i]);
        console.log(stringToNumber);
        let char = "";
        for (let x = 0; x < stringToNumber; x++) {
          char = char + "s";
        }
        console.log(typeof fenRow1Compare, fenRow1Compare);
        fenRow1Compare.splice(i, 1, char);
        console.log(typeof fenRow1Compare, fenRow1Compare);
      }
      // same as above except for first row
    }

    let fenPositionRow1 = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"];
    let fenPositionRow2 = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"];
    fenPositionRow1.forEach((item, index) => {
      console.log(item, index);
      console.log(fenRow1.charAt(index));
      console.log(to);
      let alteredIndex = index;
      for (let i = 0; i < fenRow1Compare.length; i++) {
        console.log(fenRow1Compare[i]);
        if (fenRow1Compare[i].includes("s")) {
          alteredIndex = index - fenRow1Compare[i].length + 1;

          break;
        }
      }
      console.log(alteredIndex);
      if (item === to) {
        console.log("success", to, item, index);
        console.log(fenRow1Compare);
        console.log(fenRow1Compare[index]);
        let promotedChessPieceFen;
        switch (promotedChessPiece) {
          case "Knight":
            promotedChessPieceFen = "N";
            break;

          case "Queen":
            promotedChessPieceFen = "Q";
            break;
          case "Bishop":
            promotedChessPieceFen = "B";
            break;
          case "Rook":
            promotedChessPieceFen = "R";
            break;
        }
        console.log(promotedChessPieceFen);
        console.log("before", fenRow1Compare);
        fenRow1Compare.splice(alteredIndex, 1, promotedChessPieceFen);

        console.log("after", fenRow1Compare);
        fenRow1CompareArray = fenRow1Compare;

        fenRow1Compare.forEach((char, charIndex) => {
          console.log(char, charIndex, char.length);
          if (char.includes("s")) {
            let counter = 0;
            for (let i = 0; i < char.length; i++) {
              counter = counter + 1;
            }
            console.log(counter);
            fenRow1CompareArray.splice(charIndex, 1, counter);
          }
        });
        console.log(fenRow1CompareArray);
        fenRow1Compare = fenRow1CompareArray.join("");
        console.log(fenRow1Compare);
      }
    });
    console.log(fenRow1Compare);

    fenPositionRow2.forEach((item, index) => {
      console.log(item, index);
      console.log(fenRow2.charAt(index));
      console.log(to);
      let alteredIndex = index;
      for (let i = 0; i < fenRow2Compare.length; i++) {
        console.log(fenRow2Compare[i]);
        if (fenRow2Compare[i].includes("s")) {
          alteredIndex = index - fenRow2Compare[i].length + 1;

          break;
        }
      }

      console.log(alteredIndex);
      if (item === to) {
        console.log("success", to, item, index);
        console.log(fenRow2Compare);
        console.log(fenRow2Compare[index]);
        let promotedChessPieceFen;
        switch (promotedChessPiece) {
          case "Knight":
            promotedChessPieceFen = "n";
            break;

          case "Queen":
            promotedChessPieceFen = "q";
            break;
          case "Bishop":
            promotedChessPieceFen = "b";
            break;
          case "Rook":
            promotedChessPieceFen = "r";
            break;
        }
        console.log(promotedChessPieceFen);
        console.log("before", fenRow2Compare);
        fenRow2Compare.splice(alteredIndex, 1, promotedChessPieceFen);
        // bug occurs because fenRow2Compare is not always the same size as fenPositionRow2
        // so I have to ensure that it accounts for the changes in fenRow2Compare and have it still work
        console.log("after", fenRow2Compare);
        fenRow2CompareArray = fenRow2Compare;

        fenRow2Compare.forEach((char, charIndex) => {
          console.log(char, charIndex, char.length);
          console.log(fenRow2CompareArray);
          if (char.includes("s")) {
            let counter = 0;
            for (let i = 0; i < char.length; i++) {
              counter = counter + 1;
            }
            console.log(charIndex, counter);
            console.log(fenRow2CompareArray);
            fenRow2CompareArray.splice(charIndex, 1, counter);
            console.log(fenRow2CompareArray);
          }
        });
        console.log(fenRow2CompareArray);
        fenRow2Compare = fenRow2CompareArray.join("");
        console.log(fenRow2Compare);
      }
    });
    console.log(fenRow2Compare);

    if (typeof fenRow2Compare === "string") {
      alteredFen =
        fen.slice(0, fenIndex2Start) + fenRow2Compare + fen.slice(fenIndex2End);
    }
    if (typeof fenRow1Compare === "string") {
      alteredFen = fenRow1Compare + fen.slice(fenIndex1);
    }
    console.log(fen);
    console.log(alteredFen);
    chess.load(alteredFen);
    setFenState(alteredFen);

    setSendPromotionFlag(true);

    // when the pawn promotion happens (converts it to queen and displays sidebar) pause the game until pawn promotion is complete (send a message to opponent and pause it for them as well)
    // have to create a system that compares fen  from and to data and after it updates fen setFenState() and updates it that way instead of using chess.move()
    // due to the way chess.move() works it will be better to utilize fen
    // then promotes the pawn and offers pawn promotion from sidebar
    // the system will work like this it will compare the first row and last row of the chess board it will then compare those two rows with coordinate chess positions a8, b8, etc.
    // it will then remove the numbers (which are empty spaces) from the fen
    console.log("promotion confirmation flag", promotionConfirmationFlag);
    console.log(from, to);

    console.log(chess.fen());
    pauseGame.current = false;
    playerPromoted.current = false;
    singleInstancePlayerPromotedFlag.current = false;
    setEndPauseGame(true);
    console.log(pauseGame.current);
  }

  return (
    <div
      className={`${outline === true ? "outline" : ""} player ${
        player ? "you" : "opponent"
      }`}
    >
      {/* If player exists it indicates you are top left player and not the opponent thus triggers subsequent css styles */}
      <p>{name}</p>
      <img
        src={require(`../../assets/pieces/${image}.svg`)}
        alt="King"
        className="king"
      />
      <div
        className={`${
          playerPromoted.current === true ? "" : "hide"
        } pawn-promotion-container`}
      >
        <p className="pawn-promotion-title">Pawn Promotion</p>
        <div
          className="pawn-promotion-piece"
          onClick={() => {
            pawnPromotionQueenActivate();
            pawnPromotionOnClick();
          }}
        >
          <p className="pawn-promotion-piece-title">Queen</p>
          <img
            className="pawn-promotion-img"
            alt="Queen Chess Piece"
            src={
              color
                ? require(`../../assets/pieces/${color}Q.svg`)
                : require(`../../assets/pieces/wQ.svg`)
            }
          ></img>
        </div>
        <div
          className="pawn-promotion-piece"
          onClick={() => {
            pawnPromotionRookActivate();
            pawnPromotionOnClick();
          }}
        >
          <p className="pawn-promotion-piece-title">Rook</p>
          <img
            className="pawn-promotion-img"
            alt="Rook Chess Piece"
            src={
              color
                ? require(`../../assets/pieces/${color}R.svg`)
                : require(`../../assets/pieces/wR.svg`)
            }
          ></img>
        </div>
        <div
          className="pawn-promotion-piece"
          onClick={() => {
            pawnPromotionKnightActivate();
            pawnPromotionOnClick();
          }}
        >
          <p className="pawn-promotion-piece-title">Knight</p>
          <img
            className="pawn-promotion-img"
            alt="Knight Chess Piece"
            src={
              color
                ? require(`../../assets/pieces/${color}N.svg`)
                : require(`../../assets/pieces/wN.svg`)
            }
          ></img>
        </div>
        <div
          className="pawn-promotion-piece"
          onClick={() => {
            pawnPromotionBishopActivate();
            pawnPromotionOnClick();
          }}
        >
          <p className="pawn-promotion-piece-title">Bishop</p>
          <img
            className="pawn-promotion-img"
            alt="Bishop Chess Piece"
            src={
              color
                ? require(`../../assets/pieces/${color}B.svg`)
                : require(`../../assets/pieces/wB.svg`)
            }
          ></img>
        </div>
      </div>
      {/* pawn promotion box that triggers when you make it to opponents end row */}
    </div>
  );
};

export default User2;
