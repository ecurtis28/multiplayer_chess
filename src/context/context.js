import React, { createContext, useReducer } from "react";
import reducer from "./reducer";
//context file for chess move highlight functionality
const initState = {
  potentialMoves: [],
  currentTurn: "w",
  inCheck: false,
  endGame: false,
  status: "",
  playerName: "",
  playerColor: "",
  opponentName: "",
  reloadState: false,
  receivedReloadState: false,
  opponentLeftState: false,
  chessGameID: "",
  message: "",
  opponentMoves: [],
};
// object with potentialMoves which will represent the highlighted possible moves for each chess piece
// initial state object will also include the current player's turn which starts out default white on this chess engine
// and inCheck will be false because you can't be in check on first turn

export const Context = createContext(initState);
// createContext will act as a method to pass state through the component hierarchy without depending on props and "prop drilling"
// : the redundant passing of the data we need from each parent component to child component down a long chain
// with this createContext method we can directly pass data/state to the specific component we need
export const ChessProvider = (props) => {
  const { children } = props;
  // props.children allows us to use the ChessProvider component as a wrapper component which is necessary
  // so we can wrap the <Game/> root component giving all of it's descendant components access to Context with the useContext hook
  // this is because without wrapper components and the children prop it is not normally possible to directly nest react components in other react components
  // this wrapper component will allow us to pass our dispatch function (state update function) and state to the needed descendant component with the react context functionality
  const [state, dispatch] = useReducer(reducer, initState);
  // initial state of potential moves which is empty due to the fact that the chess piece hasn't been selected(picked up) yet
  // useReducer will act as an alternative state management functionality due to the more complex state structure

  return (
    <Context.Provider value={{ ...state, dispatch }}>
      {children}
    </Context.Provider>
  );
};
// children represents the content that is nested inside the ChessProvider component in this case this is the <Game/> component
