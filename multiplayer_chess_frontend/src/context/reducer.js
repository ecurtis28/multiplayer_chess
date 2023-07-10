import { type } from "./action";

const getPosition = (chessMoves) => {
  console.log(chessMoves);
  return chessMoves.map((chessMove) => {
    if (chessMove.endsWith("+")) {
      chessMove = chessMove.slice(0, -1);
    }
    // removes chessMove strings that end with '+' which seems to happen when you enter the enemy starting positions

    const n = chessMove.length;

    return chessMove.substring(n - 2);
    // returns string starting at position n chessMove string length - 2
    // n represents the string length, so in the case of a pawn diagonally taking another pawn, the chess.js engine represents this move
    // as "cxd5" so the n = 4; 4-2 = 2; This will capture the string from position 2 onwards as that is how substring() works with on argument
    // this will return "d5" which is the chess position we need
  });
};
// we need chess.moves() functionality to give us a list of potential legal moves
// due to chess.moves() returning differently formatted strings based on the different chess pieces
// Pawn = [a3, a4]  Knight = [Na3, Nc3]  Rook =  ['Ra7', 'Ra6']
// we need a way of parsing these differing formats and retrieving the needed potential chess move data for each chess piece

const reducer = (state, action) => {
  // receives state as first parameter, and action object as second

  console.log(action);
  switch (action.type) {
    //action.type references the action object and the type sent from dispatch function
    case type.SET_POTENTIAL_MOVES:
      // type references the object defined in action.js

      return {
        ...state,
        potentialMoves: getPosition(action.moves),
      };
    // if the dispatch action object's type matches type.SET_POTENTIAL_MOVES
    // it will include the previous state, plus the chess.moves() passed from dispatch function
    // and parsed by the getPosition function above
    // this new object will be returned as the new state defined in context.js

    case type.CLEAR_POTENTIAL_MOVES:
      return {
        ...state,
        potentialMoves: [],
      };
    // if the dispatch action object's type matches type.CLEAR_POTENTIAL_MOVES
    // it will include the previous state, and then clear the potentialMoves array
    // this new object will be returned as the new state defined in context.js

    case type.CHECK_TURN:
      return {
        ...state,
        currentTurn: action.currentPlayer,
        inCheck: action.inCheck,
      };
    // if the dispatch action object's type matches type.CHECK_TURN
    // it will include the previous state, plus update the current player's turn
    // and whether the current player is in check then update the state

    case type.END_GAME:
      return {
        ...state,
        endGame: true,
        status: action.status,
        currentTurn: action.currentPlayer,
      };
    case type.SET_PLAYER:
      return { ...state, playerName: action.name };
    case type.SET_PLAYER_COLOR:
      return { ...state, playerColor: action.color };
    case type.SET_OPPONENT:
      return {
        ...state,
        opponentName: action.name,
        opponentColor: action.color,
      };
    case type.SET_MESSAGE:
      return { ...state, message: action.message };
    case type.CLEAR_MESSAGE:
      return { ...state, message: "" };
    case type.SET_OPPONENT_MOVES:
      return { ...state, opponentMoves: action.moves };
    case type.CLEAR_OPPONENT_MOVES:
      return { ...state, opponentMoves: [] };
    case type.SET_RELOAD_STATE:
      return { ...state, reloadState: action.reloadState };
    case type.RECEIVE_RELOAD_STATE:
      return { ...state, receivedReloadState: action.receivedReloadState };
    case type.SET_OPPONENT_LEFT_STATE:
      return { ...state, opponentLeftState: action.opponentLeftState };
    case type.SET_CHESS_GAME_ID:
      return { ...state, chessGameID: action.chessGameID };
    default:
      return state;
  }
};

export default reducer;
