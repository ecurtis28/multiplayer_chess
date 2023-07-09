export const type = {
  SET_POTENTIAL_MOVES: "SET_POTENTIAL_MOVES",
  CLEAR_POTENTIAL_MOVES: "CLEAR_POTENTIAL_MOVES",
  CHECK_TURN: "CHECK_TURN",
  END_GAME: "END_GAME",

  SET_PLAYER: "SET_PLAYER",
  SET_OPPONENT: "SET_OPPONENT",
  SET_PLAYER_COLOR: "SET_PLAYER_COLOR",
  SET_MESSAGE: "SET_MESSAGE",
  CLEAR_MESSAGE: "CLEAR_MESSAGE",
  SET_OPPONENT_MOVES: "SET_OPPONENT_MOVES",
  CLEAR_OPPONENT_MOVES: "CLEAR_OPPONENT_MOVES",
  SET_RELOAD_STATE: "SET_RELOAD_STATE",
  RECEIVE_RELOAD_STATE: "RECEIVE_RELOAD_STATE",
  SET_OPPONENT_LEFT_STATE: "SET_OPPONENT_LEFT_STATE",
  SET_CHESS_GAME_ID: "SET_CHESS_GAME_ID",
};

// action object which will be utilized to determine what logic to perform
// in the reducer function

export const setPlayer = (name) => ({
  type: type.SET_PLAYER,
  name,
});

export const setOpponent = (opponent) => ({
  type: type.SET_OPPONENT,
  name: opponent?.name,
  color: opponent?.color,
});

export const setPlayerColor = (color) => ({
  type: type.SET_PLAYER_COLOR,
  color,
});

export const setMessage = (message) => ({
  type: type.SET_MESSAGE,
  message,
});

export const setOpponentMoves = (moves) => ({
  type: type.SET_OPPONENT_MOVES,
  moves,
});

export const clearOpponentMoves = () => ({
  type: type.CLEAR_OPPONENT_MOVES,
});

export const setReloadState = (reloadState) => ({
  type: type.SET_RELOAD_STATE,
  reloadState,
});
export const setReceivedReloadState = (receivedReloadState) => ({
  type: type.RECEIVE_RELOAD_STATE,
  receivedReloadState,
});

export const setOpponentLeftState = (opponentLeftState) => ({
  type: type.SET_OPPONENT_LEFT_STATE,
  opponentLeftState,
});

export const setChessGameID = (chessGameID) => ({
  type: type.SET_CHESS_GAME_ID,
  chessGameID,
});
