//  React versions I was using for reference
//  "react": "^16.13.1",
// "react-dom": "^16.13.1",

import React, { useState, useRef, useEffect, useContext } from "react";
import { Context } from "../../context/context";
import { type } from "../../context/action";
import { Chess } from "chess.js"; // remove {} if using old chess.js version
import { createChessBoard } from "../../functions";
import { endGameState } from "../../functions/end-game.js";
import Board from "../../components/chessBoard";
import GameEnd from "../../components/gameEnd";
import io from "socket.io-client";
import { useLocation, useHistory } from "react-router-dom";
import querystring from "query-string";
import User1 from "../../components/user1/index";
import User2 from "../../components/user2/index";
import MessageWindow from "../../components/mui-snackbar";
import ButtonContainer from "../../components/buttonContainer";
import "./chess-game-styles.css";

import {
  setMessage,
  setOpponent,
  setOpponentMoves,
  setPlayer,
  setPlayerColor,
  setReloadState,
  setReceivedReloadState,
  setOpponentLeftState,
  setStatus,
} from "../../context/action.js";
// "http://localhost:3001"
//   "https://multiplayer-chess-site-backend.onrender.com"
const socket = io.connect(
  "https://multiplayer-chess-site-backend.onrender.com",
  {
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionAttempts: 100,
  }
);

// Known Bugs ! at top right of description = bug fixed/feature added
// Whenever you put down piece it suddenly triggers a message "Your Move" for opponent even if you didn't move the piece but simply picked it up !

// For some reason it randomly leaves the game for a player after a period of time I need to figure out why this is happening and fix it  (it might be a setting with socket.io/cors) ?

// There is an occasion when you leave somehow a player with your name still resides in that game taking up a space even though no one is there ?

// For some reason on different resolutions the css at the bottom of home page has a large gap of empty space !

// When you pick up a piece it takes the color of the background cell in a block. I need to fix this so only the chess piece itself is visible. Cancel
// pretty sure only way to fix this is to convert the svg to a png and remove the background of all pieces and cut around the border of the piece
// The transparency of an image won't work

// When the Pawn reaches the end of the board on opponent side it can't take the piece sitting on the last row or move on that square !

// Whenever you get to the game end screen and one player refreshes or presses enter on search bar it will trigger a white screen and error in console !
// due to the fact that player rejoined the game but you are still stuck in gameEndScreen fix this so whenever an opponent refreshes at gameEnd screen
// all connections with that player cease (delete game and make it not possible to join when that component is rendered (most likely through a flag state))

// Whenever I rapidly refresh and error2 triggers (opponent is not available) it prevents the player from being able to reconnect when refreshing !
// to fix this I should find a way to reload the page when error2 is triggered

// Whenever I reload from white side and it reloads opponent if I move a piece it before opponent reloads it will not show on screen desyncing the game !

// Whenever I try and castle while under attack if I attempt more than once it will fill the newArray with more than 2 strings which is a bug !
// I think this is due to the fact that chess.load is used multiple times which triggers rerenders and thus the dependencies (cell.cpob, cell.piece) in useEffect from chessCell

// I need to change the way I am setting up my castling check/execution logic
// I know the solution I must try I must instead of using splice, I will use a for loop to find start and end index of top row and bottom row, I will then take that row, and use a for loop !
// to replace all numbers with the same amount of "s for space" placeholders. I will then shift the king to the direction where I am castling,If the is king is inCheck it will trigger a flag
// I will then repeat this again, for the next position until it reaches the position it would be in it's final castling position, if it passes through check (the flag is triggered)
// It will return  the piece to it's original position, other wise it will castle. For each king position change the fenRow will be calculated and rendered through the logic above
// This is essentially what I did in user, and it is useful because it can be dynamic, and the FEN system is inherently dynamic with how empty spaces are represented (numbers)

// Found a bug with the addition of the function check castling mechanism, if it attempts to try and move to a position with king and that position has enemy pieces covering all escapes ?
// it will instantly checkmate. To prevent this from happening, I need to create a flag that turns on when checking if king piece is going through check, and turns off after it is finished looking for castling checks
// when this flag is triggered it will prevent the opponent from being able to checkmate you

// Sometimes when  pawn promotion occurs it somehow removes the one of the digits used in the fen (empty space) and makes it too short of a fen and so it crashes the program !
// !!Solution Found!! The reason it was shortening the fen was because on the placeholder ("s") splice functionality it was using counter variable for the delete count instead of 1
// The reason why this doesn't work is because when fenRow1CompareArray/fenRow2CompareArray have more than two space placeholders in the row in which pawn promotion occurs
// The counter which is a number based on the amount of s placeholders at that certain character will then increase the delete count in splice to the amount of placeholders.
// This will then shorten the last fen row which will make the final fen incompatiable with the chess.js library

// New bug, when I concede and the concede screen appears for both players. If one of the players presses play again button, it will return that player to homescreen, but the other player's screen will go white. !
// Issue found, when a player leaves at gameEnd screen the winner/winnerName variable in gameEnd becomes undefined, which causes the name to go undefined
// It seems to happen only with the player who lost

// When you concede alone it there is a possibility it will duplicate the player and take up space as an opponent !

// When it is reloaded if you concede before opponent reloads it will send one player to end game screen but the other opponent will be directed to game !

// There is a bug that allows you to castle while your king is in check, which is not a legal chessmove. I have to not allow castling while your king is in check. !

// When I use pawn promotion, it shows pawn promotion menu on both sides/colors. This is not how it should work. It should only show the pawn promotion menu, of your own color.

//  Previous chess.js version "chess.js": "^0.10.3",

// Features to add
// Make an outline around player that is a different color when it is your turn !
// Make it so it saves the previous positions from the game you had previously Cancel
// Remove Highlighting and add it only for a beginner mode which is triggered by a button in the game (it can be turned on or off mid game) Cancel
// Add a concede button (which sends it to end game page with opponent winning to both your opponent and yourself) !
// Make it so that at the end game page the players name is added along with the color of the piece !
// When I put my pawn at the opponents beginning row I should be able to get any piece I want  (pawn promotion) (check how the legal chess rule works), but it doesn't work. I need to add this as a feature. !
// I should be able to castle but my chess game currently doesn't allow it (check how castling works in a legal chess game). Add this functionality.
// Add a tab icon and name (besides react app and react icon) !

// test bug
// const FEN = "r3kbnr/pp2pppp/nq1pb3/2p5/N2P4/1P6/P1P1PPPP/RNBQK2R w KQkq - 2 6";
// const FEN = "rnbqk2r/pp2pppp/nq1pb3/2p5/N2P4/1P6/P1P1PPPP/R3KBNR w KQkq - 2 6";
// const FEN = "r3k2r/pp2pppp/nq1pb3/2p5/N2P4/1P6/P1P1PPPP/R3K2R w KQkq - 2 6";

const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
// the fen variable above represents the position of the chess pieces on the chess board
// test checkmate
// const FEN = "rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3";
// test stalemate
// const FEN = "4k3/4P3/4K3/8/8/8/8/8 b - - 0 78";
// white wins fen state
// const FEN = "KR1q3Q/8/6k1/8/8/8/8/8 b - - 0 2"
// black wins fen state
const Game = () => {
  let gameIDBoxReference = useRef();
  let gameIDBoxWidth = useRef();
  let outlineOne = useRef(false);
  let outlineTwo = useRef(false);

  const {
    dispatch,
    endGame,
    playerName: player,
    playerColor,
    opponentName,
    reloadState,
    receivedReloadState,
    opponentLeftState,
    potentialMoves,
    currentTurn,
    status,
    inCheck,
  } = useContext(Context);

  useEffect(() => {
    console.log(endGameFlag);
    if (!endGameFlag) {
      if (gameIDBoxReference.current) {
        gameIDBoxWidth.current = gameIDBoxReference.current.offsetWidth;
      }
    }
  }, [gameIDBoxReference.current]);
  const [fenState, setFenState] = useState(FEN); // represents the state of the fen variable above

  // temporary variable for checking reloadInterval
  const { current: chess } = useRef(new Chess(fenState)); //initializes a new Chess class inside the Chess.js module which will utilize the fenState as it's fen variable
  // this will feed the fen variable into the built in methods of Chess.js,(Chess.move(), Chess.fen())
  const [chessBoard, setChessBoard] = useState(createChessBoard(fenState));
  //processes the fen and then formats it into a chess board arrangement

  const [endGameFlag, setEndGameFlag] = useState(false);
  // this end game flag is to ensure that when GameEnd component is rendered this join server functionality stops connecting

  const [promotionFlag, setPromotionFlag] = useState(false);
  // promotion flag state as described below

  const [promotionConfirmationFlag, setPromotionConfirmationFlag] =
    useState(false);

  const [sendPromotionFlag, setSendPromotionFlag] = useState(false);
  const [sendCastlingFen, setSendCastlingFen] = useState();

  const castlingLegal = useRef(true);
  const disableCheckmate = useRef(false);
  const movedCastlingPieces = useRef({
    king: false,
    longRook: false,
    shortRook: false,
  });
  // due to castling chess rules, if the rook or king that is targeted for castling has moved from it's starting position it is illegal to castle with that selected piece
  // this is the first rule implemented for the castling mechanic

  const initialValues = {
    from: null,
    to: null,
  };
  const [fromToData, setFromToData] = useState(initialValues);
  const [endPauseGame, setEndPauseGame] = useState(false);
  const [firstPlayerInactive, setFirstPlayerInactive] = useState(false);
  useEffect(() => {
    console.log("checking fen state", fenState);
    setChessBoard(createChessBoard(fenState));
    //useEffect runs on initial rendering and later additional renderings
    // updates board state whenever both the component rerenders and the fenState dependency changes
  }, [fenState]);

  const fromPob = useRef();
  // creates a ref object to store the position on board that will persist through rerenders

  const selectedPiece = useRef();

  const location = useLocation();
  const history = useHistory();
  const playerName = useRef();
  const chessGameIDRef = useRef("");
  const pauseGame = useRef(false);
  const disableFlag = useRef(false);
  const concedeDisabled = useRef(true);
  const parallelCastlingPositions = useRef([]);

  const [targetedCastlingPosition, setTargetedCastlingPosition] =
    useState(null);

  const moveChessPiece = (pob, pieceInTargetCell) => {
    console.log("pauseGame", pauseGame);
    console.log(playerColor);
    console.log(chess);
    console.log("disableFlag", disableFlag);

    console.log("inCheck", inCheck);
    if (inCheck) {
      castlingLegal.current = false;
    }
    if (inCheck === false) {
      castlingLegal.current = true;
    }

    if (
      movedCastlingPieces.current.king === true ||
      (movedCastlingPieces.current.longRook === true &&
        movedCastlingPieces.current.shortRook === true)
    ) {
      castlingLegal.current = false;
    }

    console.log(castlingLegal.current);
    if (disableFlag.current === false) {
      if (pauseGame.current === false) {
        const from = fromPob.current;
        // ref starting position defined in chessPiece when you first start dragging chess piece
        const to = pob;
        // end point defined in chessCell which triggers it's position when the chess piece element is dropped on it
        // then sending that position data up the hierarchy through  moveChessPiece for it to be utilized here

        if (promotionFlag === false) {
          console.log("promotion flag", promotionFlag);
          console.log(from);
          console.log(selectedPiece.current);

          chess.move({ from, to });
          console.log(chess.fen());
          setPromotionConfirmationFlag(false);
        } else if (promotionFlag === true) {
          setFromToData({ from: from, to: to });
          for (const legalMove of potentialMoves) {
            console.log(legalMove);
            if (to === legalMove) {
              setPromotionConfirmationFlag(true);

              pauseGame.current = true;
              console.log("match", legalMove, to);
              console.log(pauseGame, promotionConfirmationFlag);

              break;
            }
          }
          chess.move({ from, to, promotion: "q" });
          console.log(chess.fen(), from, to);
        }
        // makes the chess move with the built in .move() function and the new Chess class we defined above which was assigned to the chess variable
        // the
        console.log(from, to);
        console.log(potentialMoves);

        dispatch({ type: type.CLEAR_POTENTIAL_MOVES });
        // dispatch type.CLEAR_POTENTIAL_MOVES to reducer function
        // type references the object from action.js
        // this clears the highlighting after the move is made
        setFenState(chess.fen());
        // alters the fenState we set above which will trigger a rerender due to both built in state altering rerender
        // system native to react and also due to useEffect hook above
        // the fen data used to update the fenState comes from the built in chess.fen() in chess.js that we altered with chess.move()

        if (
          selectedPiece.current === "wK" &&
          to === "a1" &&
          pieceInTargetCell === "R"
        ) {
          console.log("success white", pieceInTargetCell);
          setTargetedCastlingPosition(to);
          setTimeout(() => {
            setTargetedCastlingPosition(null);
          }, 300);

          setTimeout(() => {
            console.log(parallelCastlingPositions.current);
            let newArray = parallelCastlingPositions.current.slice();
            console.log(newArray.length);
            let parallelCastlingPositionsFlag = false;
            let counter = 0;
            parallelCastlingPositions.current.forEach((item) => {
              if (item === "") {
                counter++;
              }
              console.log(counter);
              if (counter === newArray.length) {
                console.log("success");
                parallelCastlingPositionsFlag = true;
              }
            });

            if (newArray.length >= 1) {
              parallelCastlingPositions.current = [];
            }

            if (parallelCastlingPositionsFlag === true) {
              // chess.isAttacked doesn't seem to be present in my framework so I will have to make a custom isAttacked solution

              // chess.remove("b1");
              disableCheckmate.current = true;
              let kingUnderAttack = false;
              let chessFen = chess.fen();
              let originChessFen = chessFen;
              console.log(chessFen);
              const kingIndex = chessFen.indexOf("K");
              console.log(kingIndex);
              let chessFenArray = chessFen.split("");

              let fenIndex2Start;
              let fenIndex2End;
              for (let i = chessFenArray.length - 1; i >= 0; i--) {
                console.log(chessFenArray[i]);

                if (chessFenArray[i] === "/") {
                  fenIndex2Start = i + 1;
                  console.log(fenIndex2Start);
                  break;
                }
              }

              fenIndex2End = chess.fen().indexOf(" ");

              let fenRow2 = chess.fen().slice(fenIndex2Start, fenIndex2End);

              let fenRow2Compare = chess
                .fen()
                .slice(fenIndex2Start, fenIndex2End)
                .split("");

              console.log(fenRow2);
              console.log(fenIndex2End);

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
                }
              }
              fenRow2Compare = fenRow2Compare.join("");
              fenRow2Compare = fenRow2Compare.split("");
              fenRow2 = fenRow2Compare.slice();
              console.log(fenRow2Compare);

              let fenRow2CompareArray;
              function alterKingPosition() {
                for (let i = fenRow2.length - 1; i >= 0; i--) {
                  if (
                    fenRow2Compare[i] === "s" &&
                    fenRow2Compare[i + 1] === "K"
                  ) {
                    console.log(fenRow2Compare[i], fenRow2Compare[i + 1]);
                    fenRow2Compare.splice(i, 2, "K", "s");
                    fenRow2CompareArray = fenRow2Compare.slice();
                    console.log(typeof fenRow2Compare, fenRow2Compare);

                    break;
                  }
                }
              }
              function transformPlaceholders() {
                let sCounter = 0;
                console.log(fenRow2, fenRow2Compare, fenRow2CompareArray);
                for (let i = 0; i < fenRow2Compare.length; i++) {
                  console.log(i, fenRow2CompareArray[i]);
                  if (fenRow2CompareArray[i] === "s") {
                    sCounter++;
                    console.log(sCounter);
                    console.log(fenRow2CompareArray, fenRow2CompareArray[i], i);
                  }

                  if (
                    fenRow2CompareArray[i] === "s" &&
                    fenRow2CompareArray[i + 1] !== "s"
                  ) {
                    console.log(sCounter);
                    fenRow2CompareArray.splice(
                      i - sCounter + 1,
                      sCounter,
                      sCounter
                    );
                    i = 0;
                    sCounter = 0;
                    console.log(fenRow2CompareArray);
                  }
                }
              }
              if (castlingLegal.current === true) {
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);
                fenIndex2End = chess.fen().indexOf(" ");
                alterKingPosition();
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);
                transformPlaceholders();
                console.log(chessFen);
                chessFen =
                  chessFen.slice(0, fenIndex2Start) +
                  fenRow2CompareArray.join("") +
                  chessFen.slice(fenIndex2End);
                console.log(chessFen);
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);

                setFenState(chessFen);
                chess.load(chessFen);
                console.log(chess.in_check());
                if (chess.in_check()) kingUnderAttack = true;

                fenIndex2End = chess.fen().indexOf(" ");
                alterKingPosition();
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);
                transformPlaceholders();
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);
                console.log(chessFen);
                chessFen =
                  chessFen.slice(0, fenIndex2Start) +
                  fenRow2CompareArray.join("") +
                  chessFen.slice(fenIndex2End);
                console.log(chessFen);

                setFenState(chessFen);
                chess.load(chessFen);
                console.log(chess.in_check());
                if (chess.in_check()) kingUnderAttack = true;

                disableCheckmate.current = false;
                if (kingUnderAttack) {
                  setFenState(originChessFen);
                  chess.load(originChessFen);
                }
                if (!kingUnderAttack) {
                  // console.log(chessFenArray.indexOf());
                  // chessFenArray.splice(kingIndex - 2, 4, "2", "K", "R", "1");
                  // let startPlaceholderIndex;
                  let endPlaceholderIndex;
                  fenIndex2End = chess.fen().indexOf(" ");
                  chessFenArray = chessFen.split("");
                  chessFenArray.splice(fenIndex2End + 1, 1, "b");
                  chessFen = chessFenArray.join("");
                  for (let i = fenRow2Compare.length - 1; i >= 0; i--) {
                    if (fenRow2Compare[i] === "K") {
                      endPlaceholderIndex = i + 2;
                      console.log(endPlaceholderIndex);
                      break;
                    }
                  }

                  // for (let i = 0; i < fenRow2Compare.length; i++) {
                  //   if (fenRow2Compare[i] === "s") {
                  //     startPlaceholderIndex = i;
                  //     console.log(startPlaceholderIndex);
                  //     break;
                  //   }
                  // }
                  console.log(fenRow2Compare);
                  fenRow2Compare =
                    "ssKR" + fenRow2Compare.slice(endPlaceholderIndex).join("");
                  fenRow2Compare = fenRow2Compare.split("");
                  chessFen =
                    chessFen.slice(0, fenIndex2Start) +
                    fenRow2CompareArray.join("") +
                    chessFen.slice(fenIndex2End);
                  fenRow2CompareArray = fenRow2Compare.slice();
                  transformPlaceholders();

                  chessFen =
                    chessFen.slice(0, fenIndex2Start) +
                    fenRow2CompareArray.join("") +
                    chessFen.slice(fenIndex2End);
                  console.log(chessFen);
                  setFenState(chessFen);
                  chess.load(chessFen);

                  setSendCastlingFen(chessFen);

                  movedCastlingPieces.current.king = true;

                  movedCastlingPieces.current.longRook = true;
                }
              }
            }
          }, 100);
        }
        if (
          selectedPiece.current === "wK" &&
          to === "h1" &&
          pieceInTargetCell === "R"
        ) {
          console.log("success white", pieceInTargetCell);
          setTargetedCastlingPosition(to);
          setTimeout(() => {
            setTargetedCastlingPosition(null);
          }, 300);

          setTimeout(() => {
            console.log(parallelCastlingPositions.current);
            let newArray = parallelCastlingPositions.current.slice();
            console.log(newArray.length);
            let parallelCastlingPositionsFlag = false;
            let counter = 0;
            parallelCastlingPositions.current.forEach((item) => {
              if (item === "") {
                counter++;
              }
              console.log(counter);
              if (counter === newArray.length) {
                console.log("success");
                parallelCastlingPositionsFlag = true;
              }
            });

            if (newArray.length >= 1) {
              parallelCastlingPositions.current = [];
            }

            if (parallelCastlingPositionsFlag === true) {
              // chess.isAttacked doesn't seem to be present in my framework so I will have to make a custom isAttacked solution

              // chess.remove("b1");
              disableCheckmate.current = true;
              let kingUnderAttack = false;
              let chessFen = chess.fen();
              let originChessFen = chessFen;
              console.log(chessFen);
              const kingIndex = chessFen.indexOf("K");
              console.log(kingIndex);
              let chessFenArray = chessFen.split("");

              let fenIndex2Start;
              let fenIndex2End;
              for (let i = chessFenArray.length - 1; i >= 0; i--) {
                console.log(chessFenArray[i]);

                if (chessFenArray[i] === "/") {
                  fenIndex2Start = i + 1;
                  console.log(fenIndex2Start);
                  break;
                }
              }

              fenIndex2End = chess.fen().indexOf(" ");

              let fenRow2 = chess.fen().slice(fenIndex2Start, fenIndex2End);

              let fenRow2Compare = chess
                .fen()
                .slice(fenIndex2Start, fenIndex2End)
                .split("");

              console.log(fenRow2);
              console.log(fenIndex2End);

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
                }
              }
              fenRow2Compare = fenRow2Compare.join("");
              fenRow2Compare = fenRow2Compare.split("");
              fenRow2 = fenRow2Compare.slice();
              console.log(fenRow2Compare);

              let fenRow2CompareArray;
              function alterKingPosition() {
                for (let i = fenRow2.length - 1; i >= 0; i--) {
                  if (
                    fenRow2Compare[i] === "K" &&
                    fenRow2Compare[i + 1] === "s"
                  ) {
                    console.log(fenRow2Compare[i], fenRow2Compare[i + 1]);
                    fenRow2Compare.splice(i, 2, "s", "K");
                    fenRow2CompareArray = fenRow2Compare.slice();
                    console.log(typeof fenRow2Compare, fenRow2Compare);

                    break;
                  }
                }
              }
              function transformPlaceholders() {
                let sCounter = 0;
                console.log(fenRow2, fenRow2Compare, fenRow2CompareArray);
                for (let i = 0; i < fenRow2Compare.length; i++) {
                  console.log(i, fenRow2CompareArray[i]);
                  if (fenRow2CompareArray[i] === "s") {
                    sCounter++;
                    console.log(sCounter);
                    console.log(fenRow2CompareArray, fenRow2CompareArray[i], i);
                  }

                  if (
                    fenRow2CompareArray[i] === "s" &&
                    fenRow2CompareArray[i + 1] !== "s"
                  ) {
                    console.log(sCounter);
                    fenRow2CompareArray.splice(
                      i - sCounter + 1,
                      sCounter,
                      sCounter
                    );
                    i = 0;
                    sCounter = 0;
                    console.log(fenRow2CompareArray);
                  }
                }
              }
              if (castlingLegal.current === true) {
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);
                fenIndex2End = chess.fen().indexOf(" ");
                alterKingPosition();
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);
                transformPlaceholders();
                console.log(chessFen);
                chessFen =
                  chessFen.slice(0, fenIndex2Start) +
                  fenRow2CompareArray.join("") +
                  chessFen.slice(fenIndex2End);
                console.log(chessFen);
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);
                setFenState(chessFen);
                chess.load(chessFen);
                console.log(chess.in_check());
                if (chess.in_check()) kingUnderAttack = true;

                fenIndex2End = chess.fen().indexOf(" ");
                alterKingPosition();
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);
                transformPlaceholders();
                console.log(fenRow2Compare, fenRow2, fenRow2CompareArray);
                console.log(chessFen);
                chessFen =
                  chessFen.slice(0, fenIndex2Start) +
                  fenRow2CompareArray.join("") +
                  chessFen.slice(fenIndex2End);
                console.log(chessFen);
                setFenState(chessFen);
                chess.load(chessFen);
                console.log(chess.in_check());
                if (chess.in_check()) kingUnderAttack = true;
                disableCheckmate.current = false;
                if (kingUnderAttack) {
                  chess.load(originChessFen);
                  setFenState(originChessFen);
                }
                if (!kingUnderAttack) {
                  // console.log(chessFenArray.indexOf());
                  // chessFenArray.splice(kingIndex - 2, 4, "2", "K", "R", "1");
                  // let startPlaceholderIndex;
                  let endPlaceholderIndex;
                  fenIndex2End = chess.fen().indexOf(" ");

                  chessFenArray = chessFen.split("");
                  chessFenArray.splice(fenIndex2End + 1, 1, "b");
                  chessFen = chessFenArray.join("");
                  for (let i = fenRow2.length - 1; i >= 0; i--) {
                    if (fenRow2[i] === "K") {
                      endPlaceholderIndex = i;
                      console.log(endPlaceholderIndex);
                      break;
                    }
                  }

                  // for (let i = 0; i < fenRow2Compare.length; i++) {
                  //   if (fenRow2Compare[i] === "s") {
                  //     startPlaceholderIndex = i;
                  //     console.log(startPlaceholderIndex);
                  //     break;
                  //   }
                  // }
                  console.log(fenRow2);
                  console.log(endPlaceholderIndex);
                  fenRow2Compare =
                    fenRow2Compare.slice(0, endPlaceholderIndex).join("") +
                    "sRKs";
                  console.log(fenRow2Compare);
                  fenRow2Compare = fenRow2Compare.split("");

                  chessFen =
                    chessFen.slice(0, fenIndex2Start) +
                    fenRow2CompareArray.join("") +
                    chessFen.slice(fenIndex2End);
                  fenRow2CompareArray = fenRow2Compare.slice();
                  transformPlaceholders();

                  chessFen =
                    chessFen.slice(0, fenIndex2Start) +
                    fenRow2CompareArray.join("") +
                    chessFen.slice(fenIndex2End);
                  console.log(chessFen);
                  setFenState(chessFen);
                  chess.load(chessFen);

                  setSendCastlingFen(chessFen);

                  movedCastlingPieces.current.king = true;

                  movedCastlingPieces.current.shortRook = true;
                }
              }
            }
          }, 100);
        }

        if (
          selectedPiece.current === "bK" &&
          to === "a8" &&
          pieceInTargetCell === "r"
        ) {
          console.log("success black", pieceInTargetCell);
          setTargetedCastlingPosition(to);
          setTimeout(() => {
            setTargetedCastlingPosition(null);
          }, 300);

          setTimeout(() => {
            console.log(parallelCastlingPositions.current);
            let newArray = parallelCastlingPositions.current.slice();
            console.log(newArray.length);
            let parallelCastlingPositionsFlag = false;
            let counter = 0;
            parallelCastlingPositions.current.forEach((item) => {
              if (item === "") {
                counter++;
              }
              console.log(counter);
              if (counter === newArray.length) {
                console.log("success");
                parallelCastlingPositionsFlag = true;
              }
            });

            if (newArray.length >= 1) {
              parallelCastlingPositions.current = [];
            }

            if (parallelCastlingPositionsFlag === true) {
              // chess.isAttacked doesn't seem to be present in my framework so I will have to make a custom isAttacked solution

              // chess.remove("b1");
              disableCheckmate.current = true;
              let kingUnderAttack = false;
              let chessFen = chess.fen();
              let originChessFen = chessFen;
              console.log(chessFen);
              const kingIndex = chessFen.indexOf("k");
              console.log(kingIndex);
              let chessFenArray = chessFen.split("");

              let fenIndex1Start = 0;
              let fenIndex1End;
              function findRowEnd() {
                chessFenArray = chessFen.split("");

                for (let i = 0; i < chessFenArray.length; i++) {
                  console.log(chessFenArray[i]);

                  if (chessFenArray[i] === "/") {
                    fenIndex1End = i;
                    console.log(fenIndex1End);
                    break;
                  }
                }
              }

              findRowEnd();
              let fenRow1 = chess.fen().slice(fenIndex1Start, fenIndex1End);

              let fenRow1Compare = chess
                .fen()
                .slice(fenIndex1Start, fenIndex1End)
                .split("");

              console.log(fenRow1);
              console.log(fenIndex1End);

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
              }
              fenRow1Compare = fenRow1Compare.join("");
              fenRow1Compare = fenRow1Compare.split("");
              fenRow1 = fenRow1Compare.slice();
              console.log(fenRow1Compare);

              let fenRow1CompareArray;
              function alterKingPosition() {
                for (let i = fenRow1.length - 1; i >= 0; i--) {
                  if (
                    fenRow1Compare[i] === "s" &&
                    fenRow1Compare[i + 1] === "k"
                  ) {
                    console.log(fenRow1Compare[i], fenRow1Compare[i + 1]);
                    fenRow1Compare.splice(i, 2, "k", "s");
                    fenRow1CompareArray = fenRow1Compare.slice();
                    console.log(typeof fenRow1Compare, fenRow1Compare);

                    break;
                  }
                }
              }
              function transformPlaceholders() {
                let sCounter = 0;
                console.log(fenRow1, fenRow1Compare, fenRow1CompareArray);
                for (let i = 0; i < fenRow1Compare.length; i++) {
                  console.log(i, fenRow1CompareArray[i]);
                  if (fenRow1CompareArray[i] === "s") {
                    sCounter++;
                    console.log(sCounter);
                    console.log(fenRow1CompareArray, fenRow1CompareArray[i], i);
                  }

                  if (
                    fenRow1CompareArray[i] === "s" &&
                    fenRow1CompareArray[i + 1] !== "s"
                  ) {
                    console.log(sCounter);
                    fenRow1CompareArray.splice(
                      i - sCounter + 1,
                      sCounter,
                      sCounter
                    );
                    i = 0;
                    sCounter = 0;
                    console.log(fenRow1CompareArray);
                  }
                }
              }
              if (castlingLegal.current === true) {
                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);

                alterKingPosition();
                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);
                transformPlaceholders();
                findRowEnd();
                console.log(chessFen);
                chessFen =
                  fenRow1CompareArray.join("") + chessFen.slice(fenIndex1End);
                console.log(chessFen);
                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);

                setFenState(chessFen);
                chess.load(chessFen);
                console.log(chess.in_check());
                if (chess.in_check()) kingUnderAttack = true;

                alterKingPosition();
                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);
                transformPlaceholders();
                findRowEnd();
                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);
                console.log(chessFen);
                console.log(fenIndex1End);
                chessFen =
                  fenRow1CompareArray.join("") + chessFen.slice(fenIndex1End);
                console.log(chessFen);

                setFenState(chessFen);
                chess.load(chessFen);
                console.log(chess.in_check());
                if (chess.in_check()) kingUnderAttack = true;
                disableCheckmate.current = false;
                if (kingUnderAttack) {
                  chess.load(originChessFen);
                  setFenState(originChessFen);
                }
                if (!kingUnderAttack) {
                  // console.log(chessFenArray.indexOf());
                  // chessFenArray.splice(kingIndex - 2, 4, "2", "K", "R", "1");
                  // let startPlaceholderIndex;
                  let endPlaceholderIndex;

                  const turnIndex = chess.fen().indexOf(" ");
                  chessFenArray = chessFen.split("");
                  chessFenArray.splice(turnIndex + 1, 1, "w");
                  chessFen = chessFenArray.join("");
                  for (let i = fenRow1Compare.length - 1; i >= 0; i--) {
                    if (fenRow1Compare[i] === "k") {
                      endPlaceholderIndex = i + 2;
                      console.log(endPlaceholderIndex);
                      break;
                    }
                  }

                  // for (let i = 0; i < fenRow1Compare.length; i++) {
                  //   if (fenRow1Compare[i] === "s") {
                  //     startPlaceholderIndex = i;
                  //     console.log(startPlaceholderIndex);
                  //     break;
                  //   }
                  // }
                  console.log(fenRow1Compare);
                  fenRow1Compare =
                    "sskr" + fenRow1Compare.slice(endPlaceholderIndex).join("");
                  fenRow1Compare = fenRow1Compare.split("");
                  chessFen =
                    fenRow1CompareArray.join("") + chessFen.slice(fenIndex1End);
                  fenRow1CompareArray = fenRow1Compare.slice();
                  console.log(fenRow1CompareArray);
                  transformPlaceholders();
                  findRowEnd();
                  chessFen =
                    fenRow1CompareArray.join("") + chessFen.slice(fenIndex1End);
                  console.log(chessFen);
                  setFenState(chessFen);
                  chess.load(chessFen);
                  console.log(chessFen);
                  setSendCastlingFen(chessFen);

                  movedCastlingPieces.current.king = true;

                  movedCastlingPieces.current.longRook = true;
                }
              }
            }
          }, 100);
        }
        if (
          selectedPiece.current === "bK" &&
          to === "h8" &&
          pieceInTargetCell === "r"
        ) {
          console.log("success black", pieceInTargetCell);
          setTargetedCastlingPosition(to);
          setTimeout(() => {
            setTargetedCastlingPosition(null);
          }, 300);

          setTimeout(() => {
            console.log(parallelCastlingPositions.current);
            let newArray = parallelCastlingPositions.current.slice();
            console.log(newArray.length);
            let parallelCastlingPositionsFlag = false;
            let counter = 0;
            parallelCastlingPositions.current.forEach((item) => {
              if (item === "") {
                counter++;
              }
              console.log(counter);
              if (counter === newArray.length) {
                console.log("success");
                parallelCastlingPositionsFlag = true;
              }
            });

            if (newArray.length >= 1) {
              parallelCastlingPositions.current = [];
            }

            if (parallelCastlingPositionsFlag === true) {
              // chess.isAttacked doesn't seem to be present in my framework so I will have to make a custom isAttacked solution

              // chess.remove("b1");
              disableCheckmate.current = true;
              let kingUnderAttack = false;
              let chessFen = chess.fen();
              let originChessFen = chessFen;
              console.log(chessFen);
              const kingIndex = chessFen.indexOf("k");
              console.log(kingIndex);
              let chessFenArray = chessFen.split("");

              let fenIndex1Start = 0;
              let fenIndex1End;
              function findRowEnd() {
                chessFenArray = chessFen.split("");
                for (let i = 0; i < chessFenArray.length; i++) {
                  console.log(chessFenArray[i]);

                  if (chessFenArray[i] === "/") {
                    fenIndex1End = i;

                    break;
                  }
                }
              }
              findRowEnd();
              let fenRow1 = chess.fen().slice(fenIndex1Start, fenIndex1End);

              let fenRow1Compare = chess
                .fen()
                .slice(fenIndex1Start, fenIndex1End)
                .split("");

              console.log(fenRow1);
              console.log(fenIndex1End);

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
              }
              fenRow1Compare = fenRow1Compare.join("");
              fenRow1Compare = fenRow1Compare.split("");
              fenRow1 = fenRow1Compare.slice();
              console.log(fenRow1Compare);

              let fenRow1CompareArray;
              function alterKingPosition() {
                for (let i = fenRow1.length - 1; i >= 0; i--) {
                  if (
                    fenRow1Compare[i] === "k" &&
                    fenRow1Compare[i + 1] === "s"
                  ) {
                    console.log(fenRow1Compare[i], fenRow1Compare[i + 1]);
                    fenRow1Compare.splice(i, 2, "s", "k");
                    fenRow1CompareArray = fenRow1Compare.slice();
                    console.log(typeof fenRow1Compare, fenRow1Compare);

                    break;
                  }
                }
              }
              function transformPlaceholders() {
                let sCounter = 0;
                console.log(fenRow1, fenRow1Compare, fenRow1CompareArray);
                for (let i = 0; i < fenRow1Compare.length; i++) {
                  console.log(i, fenRow1CompareArray[i]);
                  if (fenRow1CompareArray[i] === "s") {
                    sCounter++;
                    console.log(sCounter);
                    console.log(fenRow1CompareArray, fenRow1CompareArray[i], i);
                  }

                  if (
                    fenRow1CompareArray[i] === "s" &&
                    fenRow1CompareArray[i + 1] !== "s"
                  ) {
                    console.log(sCounter);
                    fenRow1CompareArray.splice(
                      i - sCounter + 1,
                      sCounter,
                      sCounter
                    );
                    i = 0;
                    sCounter = 0;
                    console.log(fenRow1CompareArray);
                  }
                }
              }
              if (castlingLegal.current === true) {
                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);

                alterKingPosition();
                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);
                transformPlaceholders();
                findRowEnd();
                console.log(chessFen);
                chessFen =
                  fenRow1CompareArray.join("") + chessFen.slice(fenIndex1End);
                console.log(chessFen);
                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);

                setFenState(chessFen);
                chess.load(chessFen);
                console.log(chess.in_check());
                if (chess.in_check()) kingUnderAttack = true;

                alterKingPosition();
                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);
                transformPlaceholders();
                findRowEnd();

                console.log(fenRow1Compare, fenRow1, fenRow1CompareArray);
                console.log(chessFen);
                chessFen =
                  fenRow1CompareArray.join("") + chessFen.slice(fenIndex1End);
                console.log(chessFen);

                setFenState(chessFen);
                chess.load(chessFen);
                console.log(chess.in_check());
                if (chess.in_check()) kingUnderAttack = true;
                disableCheckmate.current = false;
                if (kingUnderAttack) {
                  chess.load(originChessFen);
                  setFenState(originChessFen);
                }
                if (!kingUnderAttack) {
                  // console.log(chessFenArray.indexOf());
                  // chessFenArray.splice(kingIndex - 2, 4, "2", "K", "R", "1");
                  // let startPlaceholderIndex;
                  let endPlaceholderIndex;

                  const turnIndex = chess.fen().indexOf(" ");
                  chessFenArray = chessFen.split("");
                  chessFenArray.splice(turnIndex + 1, 1, "w");
                  chessFen = chessFenArray.join("");
                  for (let i = fenRow1Compare.length - 1; i >= 0; i--) {
                    if (fenRow1Compare[i] === "k") {
                      endPlaceholderIndex = i - 2;
                      console.log(endPlaceholderIndex);
                      break;
                    }
                  }

                  // for (let i = 0; i < fenRow1Compare.length; i++) {
                  //   if (fenRow1Compare[i] === "s") {
                  //     startPlaceholderIndex = i;
                  //     console.log(startPlaceholderIndex);
                  //     break;
                  //   }
                  // }
                  console.log(fenRow1Compare);
                  console.log(fenIndex1End);
                  fenRow1Compare =
                    fenRow1Compare.slice(0, endPlaceholderIndex).join("") +
                    "srks";
                  console.log(fenRow1Compare);
                  fenRow1Compare = fenRow1Compare.split("");
                  console.log(chessFen);

                  fenRow1CompareArray = fenRow1Compare.slice();
                  console.log(chessFen);
                  console.log(fenRow1CompareArray);
                  transformPlaceholders();
                  findRowEnd();
                  console.log(fenRow1CompareArray);
                  chessFen =
                    fenRow1CompareArray.join("") + chessFen.slice(fenIndex1End);
                  console.log(chessFen);
                  setFenState(chessFen);
                  chess.load(chessFen);

                  setSendCastlingFen(chessFen);

                  movedCastlingPieces.current.king = true;

                  movedCastlingPieces.current.shortRook = true;
                }
              }
            }
          }, 100);
        }

        for (let i = 0; i < potentialMoves.length; i++) {
          let move = potentialMoves[i];

          if (to === move) {
            console.log(selectedPiece.current);
            console.log("movedCastlingPieces", movedCastlingPieces.current);
            console.log("castlingLegal", castlingLegal.current);

            if (selectedPiece.current === "wK") {
              movedCastlingPieces.current.king = true;
            }
            if (selectedPiece.current === "bK") {
              movedCastlingPieces.current.king = true;
            }
            console.log(from, selectedPiece.current);
            if (selectedPiece.current === "wR" && from === "a1") {
              movedCastlingPieces.current.longRook = true;
            }
            if (selectedPiece.current === "wR" && from === "h1") {
              movedCastlingPieces.current.shortRook = true;
            }
            if (selectedPiece.current === "bR" && from === "a8") {
              movedCastlingPieces.current.longRook = true;
            }
            if (selectedPiece.current === "bR" && from === "h8") {
              movedCastlingPieces.current.shortRook = true;
            }

            if (
              movedCastlingPieces.current.king === true ||
              (movedCastlingPieces.current.longRook === true &&
                movedCastlingPieces.current.shortRook === true)
            ) {
              castlingLegal.current = false;
            }
            console.log(movedCastlingPieces);
            console.log(movedCastlingPieces);
            console.log(movedCastlingPieces);
            console.log(movedCastlingPieces);
            console.log(movedCastlingPieces);
            console.log(movedCastlingPieces);
            console.log(movedCastlingPieces);
            console.log(movedCastlingPieces);
            console.log(movedCastlingPieces);
            console.log(movedCastlingPieces);
            console.log("inCheck after", inCheck);
            console.log(
              "movedCastlingPieces after",
              movedCastlingPieces.current
            );
            console.log("castlingLegal after", castlingLegal.current);

            // castling rules logic

            // castling rules
            // If you move rook or king from starting positions you can no longer castle (even if moved back)
            // You cannot castle while in check
            // Your king cannot pass through check (if an enemy bishop has direct attack on the square to the empty square to your right and you are trying to castle to the right) you cannot castle while this occurs
            // No pieces can be between the king and rook
            socket.emit("move", {
              gameID: chessGameIDRef.current,
              from,
              to,
              promotionFlag,
              pauseGame: pauseGame.current,
            });
          }

          // this compares potential moves to the chess position sent from chessCell when a chessPiece is dropped
          // this ensures that it will not trigger the "Your Turn" message for the opponent if it is not a legal move (aka you take the piece and drop it on a non-highlighted cell on the board)
          // socket.emit("move", { gameID: chessGameIDRef.current, from, to });

          // emits move event to be listened for corresponding socket.id on back end
          // and passes the gameID, from, and to variables in an object
        }
      }
    }
  };

  const setFromPob = (pob, piece) => {
    selectedPiece.current = piece;
    fromPob.current = pob;
    console.log(chess.moves({ square: pob }));

    console.log(chess.moves({ square: pob }));
    setPromotionFlag(false);
    // safety measure to ensure that promotionFlag is turned off in all squares/positions where pawn promotion is not viable
    for (const move of chess.moves({ square: pob })) {
      if (move.includes("=")) {
        setPromotionFlag(true);

        // checks moves from chess.moves() to see if it has an = sign which indicates that pawn is in the square/position viable for pawn promotion
        // if this is true it will trigger promotionFlag state which will allow the altered chess.move() with the promotion property to be executed instead of normal chess.move()
      }
    }
    dispatch({
      type: type.SET_POTENTIAL_MOVES,
      moves: chess.moves({ square: pob }),
    });

    // dispatch type.SET_POTENTIAL_MOVES and collection of potential legal chess moves to reducer function
    // is triggered when piece is picked up
    // this sends legal chess moves for that specific chess piece to the state
  };
  // these functions are passed down the hierarchy to chessPiece so it can recieve data relative
  // to the child components and then pass that data to this react component

  useEffect(() => {
    const [endGame, status] = endGameState(chess);
    if (endGame === true) {
      setEndGameFlag(true);
    }
    // endGameState takes in chess object checks for end game conditions then returns an end game boolean (true or false) and the type of end condition (checkmate, stalemate, etc)

    if (endGame) {
      dispatch({ type: type.END_GAME, status, currentPlayer: chess.turn() });
      return;
    }
    dispatch({
      type: type.CHECK_TURN,
      currentPlayer: chess.turn(),
      inCheck: chess.in_check(),
    });
  }, [fenState, dispatch, chess]);

  // dispatch function
  //useEffect runs on initial rendering and later additional renderings whenever fenState changes
  // this dispatch function triggers and sends the current turn, who is in check, and the action type to trigger update state logic in reducer function
  // fenState is the only dependent variable that activates the dispatch function when fenState is changed
  // fenState is altered from moveChessPiece function, which will trigger this
  // the other two dependencies are there because it's best practice to include externally declared variables

  useEffect(() => {
    let { id, name } = querystring.parse(location.search);
    console.log(location.path);

    console.log(id, name);
    if (id.length > 20) {
      id = id.slice(0, 20);
    }
    playerName.current = name;

    chessGameIDRef.current = id;
    if (id && name) {
      history.push(`/game?name=${name}&id=${id}`);
    }
  }, [location.search]);

  useEffect(() => {
    if (endGameFlag === false) {
      socket.emit(
        "join",
        {
          name: playerName.current,
          gameID: chessGameIDRef.current,
        },
        ({ error, error2, color }) => {
          if (error) {
            console.log(error);

            history.push("/");
          }
          if (error2) {
            setTimeout(() => {
              window.location.reload(false);
            }, 2000);
          }
          console.log({ color });

          dispatch(setPlayer(playerName.current));
          dispatch(setPlayerColor(color));

          console.log(chess.turn());
        }
      );

      socket.on("welcome", ({ message, opponent }) => {
        //listens for welcome event from backend
        console.log({ message, opponent });

        dispatch(setMessage(message));
        dispatch(setOpponent(opponent));
      });
      socket.on("opponentJoin", ({ message, opponent }) => {
        //listens for opponentJoin event from backend
        console.log({ message, opponent });

        console.log(fenState, typeof fenState);
        dispatch(setMessage(message));

        dispatch(setOpponent(opponent));
        console.log("opponent", opponent);
      });

      socket.on(
        "opponentMove",
        ({ from, to, receivedPromotionFlag, receivedPauseGame }) => {
          //listens for opponentMove event from backend
          console.log("opponent", from, to);
          console.log("received promotion flag", receivedPromotionFlag);
          pauseGame.current = receivedPauseGame;
          console.log(chess.fen());
          if (receivedPromotionFlag === false) {
            chess.move({ from, to });
          } else if (receivedPromotionFlag === true) {
            chess.move({ from, to, promotion: "q" });
            dispatch(
              setMessage(
                "Your opponent is choosing which piece to switch with their pawn. Please wait until they have selected."
              )
            );
          }
          setFenState(chess.fen());
          //moves the opponents chesspiece and updates chessboard

          if (receivedPromotionFlag === false) {
            dispatch(setMessage("Your Turn"));
          }
          dispatch(setOpponentMoves([from, to]));
          console.log(chess.fen());
        }
      );

      socket.on("opponentLeft", () => {
        dispatch(setOpponent(""));
        console.log(receivedReloadState, opponentLeftState);

        if (receivedReloadState === false) {
          dispatch(setOpponentLeftState(true));
        }

        // the reload mechanism will work like this if the opponent leaves it will trigger a flag  (opponentLeft)
        // when a player rejoins the game, it will trigger (if opponentLeft is true) reloadState for the client that never left the game
        // that client will then send it's reloadState (receivedReloadState) to the new player if it is true it will not trigger reloadState
        // that will ensure when the the player that never left automatically reloads
        // it will not set the reloadState to true for the new player
        // this is to avoid triggering an infinite loop
        // then it will reset all states back to their default of false

        // this is to make the game connection system a bit more dynamic and less dependent on the client refreshing if there is a disconnection or the opponent refreshes
      });

      socket.on("message", ({ message }) => {
        // receives message event from backend
        console.log({ message });

        if (message.includes("has left the game")) {
          console.log(true, message);
        } else {
          console.log(false, message);
        }
        dispatch(setMessage(message));
      });
    }
  }, [chess, history, dispatch, endGameFlag]);
  //chess dependency included because chess state is utilized inside of useEffect
  // the reason I do not add receivedReloadState, opponentLeftState, and reloadState to this dependency list
  // is because I do not want the socket.emit("join") event to be emitted to the backend socket server every time one of these states is altered

  useEffect(() => {
    socket.on("opponentJoin", () => {
      if (opponentName !== undefined) {
        setFirstPlayerInactive(false);
      }
    });
    if (opponentLeftState === true) {
      socket.on("opponentJoin", () => {
        //listens for opponentJoin event from backend
        if (receivedReloadState === false) {
          dispatch(setReloadState(true));
        }
      });
    }
  }, [dispatch, receivedReloadState, opponentLeftState]);

  useEffect(() => {
    if (reloadState === true) {
      concedeDisabled.current = true;
      socket.emit("sendReloadState", { backendReloadState: reloadState });
      if (playerColor === "w") {
        console.log("playercolor", playerColor);
        disableFlag.current = true;
      }

      setTimeout(() => {
        window.location.reload(false);
      }, 1500);

      // socket.emit('reinitializeReloadModeBackend')
    }
  }, [dispatch, reloadState]);

  useEffect(() => {
   
    if (opponentName === undefined) {
      setFirstPlayerInactive(true);
    }
  }, [dispatch, opponentName]);
  useEffect(() => {
    socket.on("receiveReloadState", ({ receivedFromOpponentReloadState }) => {
      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );
      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );
      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );

      console.log(receivedFromOpponentReloadState);
      if (receivedFromOpponentReloadState === true) {
        socket.emit("sendDisableFlag");
        dispatch(setReceivedReloadState(true));

        socket.emit("resetStates");
      }
    });
  }, [dispatch, playerColor, receivedReloadState]);
  useEffect(() => {
    socket.on("resetStatesReceive", () => {
      dispatch(setReceivedReloadState(false));
      dispatch(setOpponentLeftState(false));
      dispatch(setReloadState(false));
    });
  }, [dispatch]);
  useEffect(() => {
    socket.on("receiveDisableFlag", () => {
      concedeDisabled.current = true;
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      console.log("test");
      disableFlag.current = true;
      setTimeout(() => {
        disableFlag.current = false;
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
        console.log("disable false");
      }, 2700);
    });
  }, [dispatch]);
  useEffect(() => {
    console.log(player, playerColor);
    if (currentTurn === playerColor) {
      console.log("outline true");
      outlineOne.current = true;
      outlineTwo.current = false;
    } else {
      outlineOne.current = false;
      outlineTwo.current = true;
    }
  }, [player, playerColor, currentTurn]);

  useEffect(() => {
    console.log(status);
    if (status === "concede") {
      socket.emit("sendConcede");
    }
  }, [status]);

  useEffect(() => {
    socket.on("receiveConcede", () => {
      dispatch(setStatus("opponentConcede"));
    });
  }, [dispatch, status]);

  useEffect(() => {
    if (endPauseGame === true) {
      socket.emit("endPauseGame");
      setEndPauseGame(false);
      setPromotionConfirmationFlag(false);
    }
    // if endPauseGame is triggered this will emit endPauseGame event so that opponent will be unpaused
    socket.on("receiveEndPauseGame", () => {
      pauseGame.current = false;
      console.log("receiveEndPauseGame", pauseGame.current);
      dispatch(setMessage("Your Turn"));
    });
  }, [dispatch, endPauseGame]);

  useEffect(() => {
    console.log(sendPromotionFlag);
    if (sendPromotionFlag === true) {
      socket.emit("sendPromotionFlag", { fenState: fenState });
      setSendPromotionFlag(false);
    }

    socket.on("receivePromotionFlag", ({ receivedFenState }) => {
      console.log("receive promotion flag", receivedFenState);
      chess.load(receivedFenState);
      setFenState(receivedFenState);
    });
  }, [sendPromotionFlag]);
  useEffect(() => {
    console.log(sendCastlingFen);
    if (sendCastlingFen !== undefined) {
      socket.emit("sendCastle", { sentChessFen: sendCastlingFen });
    }

    socket.on("receiveCastle", ({ receiveChessFen }) => {
      console.log(receiveChessFen);
      chess.load(receiveChessFen);
      setFenState(receiveChessFen);
      if (outlineOne.current === true) {
        outlineOne.current = false;
        outlineTwo.current = true;
      } else if (outlineTwo.current === true) {
        outlineTwo.current = false;
        outlineOne.current = true;
      }
    });
  }, [dispatch, sendCastlingFen]);

  useEffect(() => {
    console.log(opponentName);
    if (opponentName === undefined && opponentName === "") {
      concedeDisabled.current = true;
    }
    if (opponentName !== undefined && opponentName !== "") {
      concedeDisabled.current = false;
    }
  }, [opponentName]);
  if (status === "opponentConcede" || status === "concede") {
    console.log(endGameFlag);
    return <GameEnd />;
  }

  if (endGame) {
    if (disableCheckmate.current === false) {
      console.log(endGameFlag);
      return <GameEnd />;
      // returns GameEnd page if endGame state is
    }
  }

  return (
    <div className="game">
      <div className="reload-tip">
        If your opponent leaves and rejoins, it will attempt to automatically
        reconnect.
      </div>
      <div className="link-tip">
        If you would like to play the game with a friend. Simply share the
        homepage and ask them to create a username and type in the current game
        id. You can also open another tab to play against yourself.
      </div>
      <div className="castle-tip">
        To castle ensure, that all castle rule conditions are met, and then
        simply drag the king onto a rook you wish to castle with.
      </div>
      <div className="game-id-container">
        <p className="game-id-title">Game ID</p>

        <div
          style={{ width: `${gameIDBoxWidth.current + 50}px` }}
          className="game-id"
        >
          <span ref={gameIDBoxReference}>{chessGameIDRef.current}</span>
        </div>
      </div>
      <User1
        name={player}
        color={playerColor}
        player
        outline={outlineOne.current}
        promotionConfirmationFlag={promotionConfirmationFlag}
        chess={chess}
        fromToData={fromToData}
        pauseGame={pauseGame}
        setEndPauseGame={setEndPauseGame}
        setFenState={setFenState}
        setSendPromotionFlag={setSendPromotionFlag}
        currentTurn={currentTurn}
      />
      <User2
        name={opponentName}
        color={playerColor === "w" ? "b" : "w"}
        outline={outlineTwo.current}
        promotionConfirmationFlag={promotionConfirmationFlag}
        chess={chess}
        fromToData={fromToData}
        pauseGame={pauseGame}
        setEndPauseGame={setEndPauseGame}
        setFenState={setFenState}
        setSendPromotionFlag={setSendPromotionFlag}
        currentTurn={currentTurn}
      />
      <Board
        cells={chessBoard}
        moveChessPiece={moveChessPiece}
        setFromPob={setFromPob}
        playerColor={playerColor}
        parallelCastlingPositions={parallelCastlingPositions}
        targetedCastlingPosition={targetedCastlingPosition}
        firstPlayerInactive={firstPlayerInactive}
      />
      <ButtonContainer
        concedeDisabled={concedeDisabled}
        setEndGameFlag={setEndGameFlag}
        chess={chess}
      />

      <MessageWindow />
    </div>
  );
};

// make an input to enter the game ID above the game ID display in the home page

export default Game;
