export const endGameState = (chessGame) => {
    if (!chessGame.game_over()) {
        return [false, ''];
    }
    if (chessGame.in_checkmate()) {
        return [true, 'checkmate'];
    }

    if (chessGame.in_stalemate()) {
        return [true, 'stalemate'];
    }
    if (chessGame.in_threefold_repetition()) {
        return [true, 'three fold repetition'];
    }
    if (chessGame.in_draw()) {
        return [true, 'draw'];
    }
};
// checks chess.js variable for specific game statuses and then returns those statuses