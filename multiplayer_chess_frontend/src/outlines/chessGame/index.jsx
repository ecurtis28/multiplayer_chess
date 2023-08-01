//  React versions I was using for reference
//  "react": "^16.13.1",
// "react-dom": "^16.13.1",

import React, { useState, useRef, useEffect, useContext } from "react";
import { Context } from "../../context/context";
import { type } from "../../context/action";
import Chess from "chess.js";
import { createChessBoard } from "../../functions";
import { endGameState } from "../../functions/end-game.js";
import Board from "../../components/chessBoard";
import GameEnd from "../../components/gameEnd";
import io from "socket.io-client";
import { useLocation, useHistory } from "react-router-dom";
import querystring from "query-string";
import User from "../../components/user/index";
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

const socket = io.connect("localhost:3001", {
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 100,
});

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

// Sometimes when  pawn promotion occurs it somehow removes the one of the digits used in the fen (empty space) and makes it too short of a fen and so it crashes the program !
// !!Solution Found!! The reason it was shortening the fen was because on the placeholder ("s") splice functionality it was using counter variable for the delete count instead of 1
// The reason why this doesn't work is because when fenRow1CompareArray/fenRow2CompareArray have more than two space placeholders in the row in which pawn promotion occurs
// The counter which is a number based on the amount of s placeholders at that certain character will then increase the delete count in splice to the amount of placeholders.
// This will then shorten the last fen row which will make the final fen incompatiable with the chess.js library

// Features to add
// Make an outline around player that is a different color when it is your turn !
// Make it so it saves the previous positions from the game you had previously Cancel
// Remove Highlighting and add it only for a beginner mode which is triggered by a button in the game (it can be turned on or off mid game) Cancel
// Add a concede button (which sends it to end game page with opponent winning to both your opponent and yourself) !
// Make it so that at the end game page the players name is added along with the color of the piece !
// When I put my pawn at the opponents beginning row I should be able to get any piece I want  (pawn promotion) (check how the legal chess rule works), but it doesn't work. I need to add this as a feature.
// I should be able to castle but my chess game currently doesn't allow it (check how castling works in a legal chess game). Add this functionality.
// Add a tab icon and name (besides react app and react icon) !
// test bug
// const FEN = "rbrqkbnr/PPP2p1p/8/P3p3/2b2N2/8/pp2P2p/2qNKBNR w kq - 0 27";

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
      gameIDBoxWidth.current = gameIDBoxReference.current.offsetWidth;
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

  // const movedCastlingPieces = useRef({
  //   h8BlackRook: false,
  //   a8BlackRook: false,
  //   h1WhiteRook: false,
  //   a1WhiteRook: false,
  //   whiteKing: false,
  //   blackKing: false,
  // });
  const castlingLegal = useRef(true);
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
  const parallelCastlingPositions = useRef([]);
  const [targetedCastlingPosition, setTargetedCastlingPosition] =
    useState(null);
  const moveChessPiece = (pob, pieceInTargetCell) => {
    console.log(pauseGame);
    console.log(playerColor);
    console.log(chess);
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
            const parallelCastlingPositionsFlag =
              parallelCastlingPositions.current.every((item, index) => {
                if (index % 2 === 0) {
                  if (item === "") {
                    return item;
                  }
                }
              });

            parallelCastlingPositions.current.forEach((item, index) => {
              if (index % 2 === 1) {
                console.log(item);
                if (playerColor === "w") {
                  // chess.isAttacked(item);
                }
                if (playerColor === "b") {
                }
              }
            });
            console.log(parallelCastlingPositionsFlag);
            if (parallelCastlingPositionsFlag) {
              // execute castling
            }
            if (newArray.length >= 1) {
              parallelCastlingPositions.current = new Array();
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
            parallelCastlingPositions.current.forEach((item, index) => {
              if (index % 2 === 0) {
                if (item === "") {
                  counter++;
                }
                console.log(counter);
                if (counter === newArray.length / 2) {
                  console.log("success");
                  parallelCastlingPositionsFlag = true;
                }
              }
              if (index % 2 === 1) {
                if (parallelCastlingPositionsFlag === true) {
                  console.log(item);
                  if (playerColor === "w") {
                    console.log(chess.is_attacked(item, chess.WHITE));
                  }
                  if (playerColor === "b") {
                    console.log(chess.is_attacked(item, chess.BLACK));
                  }
                }
              }
            });
            console.log(parallelCastlingPositionsFlag);

            if (parallelCastlingPositionsFlag) {
              // execute castling
            }
            if (newArray.length >= 1) {
              parallelCastlingPositions.current = new Array();
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
            const parallelCastlingPositionsFlag =
              parallelCastlingPositions.current.every((item, index) => {
                if (index % 2 === 0) {
                  if (item === "") {
                    return item;
                  }
                }
              });
            parallelCastlingPositions.current.forEach((item, index) => {
              if (index % 2 === 1) {
                console.log(item);
                if (playerColor === "w") {
                  // chess.isAttacked(item);
                }
                if (playerColor === "b") {
                }
              }
            });
            console.log(parallelCastlingPositionsFlag);

            if (parallelCastlingPositionsFlag) {
              // execute castling
            }
            if (newArray.length >= 1) {
              parallelCastlingPositions.current = new Array();
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
            const parallelCastlingPositionsFlag =
              parallelCastlingPositions.current.every((item, index) => {
                if (index % 2 === 0) {
                  if (item === "") {
                    return item;
                  }
                }
              });
            parallelCastlingPositions.current.forEach((item, index) => {
              if (index % 2 === 1) {
                console.log(item);
                if (playerColor === "w") {
                  // chess.isAttacked(item);
                }
                if (playerColor === "b") {
                }
              }
            });
            console.log(parallelCastlingPositionsFlag);
            if (parallelCastlingPositionsFlag) {
              // execute castling
            }
            if (newArray.length >= 1) {
              parallelCastlingPositions.current = new Array();
            }
          }, 100);
        }

        console.log("inCheck", inCheck);
        if (inCheck) {
          castlingLegal.current = false;
        }
        if (inCheck === false) {
          castlingLegal.current = true;
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
    const { id, name } = querystring.parse(location.search);
    console.log(id, name);
    playerName.current = name;
    chessGameIDRef.current = id;
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
      socket.emit("sendReloadState", { backendReloadState: reloadState });
      if (playerColor === "w") {
        console.log("playercolor", playerColor);
        disableFlag.current = true;
      }

      // it is some how setting both setReceivedReloadState , opponentLeftState, and reloadState true when
      setTimeout(() => {
        window.location.reload(false);
      }, 2000);

      // socket.emit('reinitializeReloadModeBackend')
    }
  }, [dispatch, reloadState]);
  useEffect(() => {
    socket.on("receiveReloadState", ({ receivedFromOpponentReloadState }) => {
      console.log(
        "received from opponent reload state",
        receivedFromOpponentReloadState
      );
      if (receivedFromOpponentReloadState === true) {
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

  if (status === "opponentConcede" || status === "concede") {
    console.log(endGameFlag);
    return <GameEnd />;
  }
  if (endGame) {
    console.log(endGameFlag);
    return <GameEnd />;
    // returns GameEnd page if endGame state is
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
        id.
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
      <User
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
      />
      <User
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
      />
      <Board
        cells={chessBoard}
        moveChessPiece={moveChessPiece}
        setFromPob={setFromPob}
        playerColor={playerColor}
        parallelCastlingPositions={parallelCastlingPositions}
        targetedCastlingPosition={targetedCastlingPosition}
      />
      <ButtonContainer setEndGameFlag={setEndGameFlag} chess={chess} />

      <MessageWindow />
    </div>
  );
};

// make an input to enter the game ID above the game ID display in the home page

export default Game;
