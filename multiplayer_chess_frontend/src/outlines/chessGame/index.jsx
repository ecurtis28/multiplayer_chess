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
import HomeButton from "../../components/homeButton";

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
} from "../../context/action.js";

const socket = io.connect("https://multiplayer-chess-site-backend.onrender.com", {
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 10,
});

// 1 Function to Add
// Make it so you can't move opponents pieces

// Change the css to make it look unique
const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
// the fen variable above represents the position of the chess pieces on the chess board
// test checkmate
// const FEN = "rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3";
// test stalemate
// const FEN = "4k3/4P3/4K3/8/8/8/8/8 b - - 0 78";

const Game = () => {
  let gameIDBoxReference = useRef();
  let gameIDBoxWidth = useRef();
  useEffect(() => {
    if (!endGame) {
      gameIDBoxWidth.current = gameIDBoxReference.current.offsetWidth;
    }
  }, [gameIDBoxReference.current]);
  const [fenState, setFenState] = useState(FEN); // represents the state of the fen variable above

  // temporary variable for checking reloadInterval
  const { current: chess } = useRef(new Chess(fenState)); //initializes a new Chess class inside the Chess.js module which will utilize the fenState as it's fen variable
  // this will feed the fen variable into the built in methods of Chess.js,(Chess.move(), Chess.fen())
  const [chessBoard, setChessBoard] = useState(createChessBoard(fenState));
  //processes the fen and then formats it into a chess board arrangement

  const {
    dispatch,
    endGame,
    playerName: player,
    playerColor,
    opponentName,
    reloadState,
    receivedReloadState,
    opponentLeftState,
  } = useContext(Context);

  useEffect(() => {
    setChessBoard(createChessBoard(fenState));
    //useEffect runs on initial rendering and later additional renderings
    // updates board state whenever both the component rerenders and the fenState dependency changes
  }, [fenState]);

  const fromPob = useRef();
  // creates a ref object to store the position on board that will persist through rerenders

  const location = useLocation();
  const history = useHistory();
  const playerName = useRef();
  const chessGameIDRef = useRef("");

  const moveChessPiece = (pob) => {
    const from = fromPob.current;
    // ref starting position defined in chessPiece when you first start dragging chess piece
    const to = pob;
    // end point defined in chessCell which triggers it's position when the chess piece element is dropped on it
    // then sending that position data up the hierarchy through  moveChessPiece for it to be utilized here
    chess.move({ from, to });
    // makes the chess move with the built in .move() function and the new Chess class we defined above which was assigned to the chess variable
    console.log(to);
    dispatch({ type: type.CLEAR_POTENTIAL_MOVES });
    // dispatch type.CLEAR_POTENTIAL_MOVES to reducer function
    // type references the object from action.js
    // this clears the highlighting after the move is made
    setFenState(chess.fen());
    // alters the fenState we set above which will trigger a rerender due to both built in state altering rerender
    // system native to react and also due to useEffect hook above
    // the fen data used to update the fenState comes from the built in chess.fen() in chess.js that we altered with chess.move()
    console.log(chessGameIDRef);
    socket.emit("move", { gameID: chessGameIDRef.current, from, to });

    // emits move event to be listened for corresponding socket.id on back end
    // and passes the gameID, from, and to variables in an object
  };

  const setFromPob = (pob) => {
    fromPob.current = pob;
    console.log(chess.moves({ square: pob }));

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
          console.log(error2);
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

    socket.on("opponentMove", ({ from, to }) => {
      //listens for opponentMove event from backend
      console.log("opponent", from, to);
      chess.move({ from, to });
      setFenState(chess.fen());
      //moves the opponents chesspiece and updates chessboard

      dispatch(setMessage("Your Turn"));
      dispatch(setOpponentMoves([from, to]));
    });

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
  }, [chess, history, dispatch]);
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
  }, [dispatch, opponentLeftState]);

  useEffect(() => {
    if (reloadState === true) {
      socket.emit("sendReloadState", { backendReloadState: reloadState });

      // it is some how setting both setReceivedReloadState , opponentLeftState, and reloadState true when
      setTimeout(() => {
        window.location.reload(false);
      }, 1000);

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
  }, [dispatch, receivedReloadState]);
  useEffect(() => {
    socket.on("resetStatesReceive", () => {
      dispatch(setReceivedReloadState(false));
      dispatch(setOpponentLeftState(false));
      dispatch(setReloadState(false));
    });
  }, [dispatch, receivedReloadState, opponentLeftState, reloadState]);
  if (endGame) {
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
        homepage and ask them to type in the current game id and a username.
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
      <User name={player} color={playerColor} player />
      <User name={opponentName} color={playerColor === "w" ? "b" : "w"} />
      <Board
        cells={chessBoard}
        moveChessPiece={moveChessPiece}
        setFromPob={setFromPob}
        playerColor={playerColor}
      />
      <HomeButton>Play Another Game</HomeButton>
      <MessageWindow />
    </div>
  );
};

// make an input to enter the game ID above the game ID display in the home page

export default Game;
