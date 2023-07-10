export class Cell {
  constructor(pob, piece) {
    this.pob = pob; // position on board
    this.piece = piece; // chess piece
  }
}

//  returns an array from 1 to n (if it is an integer) else it returns an empty array []
const range = (n) => {
  return Array.from({ length: n }, (_, i) => i + 1);
};

export const createChessBoard = (fenString) => {
  const FEN = fenString.split(" ")[0];
  //rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
  const chessPiecesString = FEN.split("/").join("");
  //rnbqkbnrpppppppp8888PPPPPPPPRNBQKBNR

  let chessPieces = Array.from(chessPiecesString);

  //Save individual pieces for each of the 64 cells
  chessPieces.forEach((item, index) => {
    if (Number.isInteger(Number(item))) {
      //tests if item is a number or an empty string
      chessPieces.splice(index, 1, range(item).fill(""));
      //fill returns an array that changes all items in an array from a starting point to a static value
      // in this case the starting point is the default 0 beginning of array and the static value is an empty string
      //["r", "n", "b", "q", "k", "b", "n", "r", "p", "p", "p", "p", "p", "p", "p", "p", ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], "P", "P", "P", "P", "P", "P", "P", "P", "R", "N", "B", "Q", "K", "B", "N", "R"]
    }
  });
  chessPieces = chessPieces.flat();
  // flattens nested arrays one depth level
  //["r", "n", "b", "q", "k", "b", "n", "r", "p", "p", "p", "p", "p", "p", "p", "p", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "P", "P", "P", "P", "P", "P", "P", "P", "R", "N", "B", "Q", "K", "B", "N", "R"]
  const rows = range(8)
    .map((n) => n.toString())
    .reverse(); //["8", "7", "6", "5", "4", "3", "2", "1"]
  // returns array from 1-8 with the integers represented as strings and the array reversed
  // this represents the rows

  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  // this represents the columns

  const chessCells = [];
  for (let a = 0; a < rows.length; a++) {
    const row = rows[a]; // pulls out each row from rows array
    for (let v = 0; v < columns.length; v++) {
      const col = columns[v]; // pulls out each column from column array
      chessCells.push(col + row);
      // because this for loop is nested within the rows for loop
      // each column (a-h) will be iterated over every row number and then combined
      // E.g. a8, b8, c8, d8, e8, f8, g8, h8
      //      a7, b7, c7, d7, e7, f7, g7, h7...
      // resembling a chess board https://en.wikipedia.org/wiki/File:Chess_diagram_from_Howard_Staunton%27s_%22The_Chess-Player%27s_Handbook%22_(1947).png
      // then these positions are pushed to chessCells array
    }
  }

  const board = [];
  for (let i = 0; i < chessCells.length; i++) {
    //iterates over chessCells length which is 64
    const cell = chessCells[i];
    const piece = chessPieces[i];
    // chessCells and chessPieces both have a length of 64
    // chessPieces starts with "r", "n", "b" which represents top black chess pieces and ends with "B" "N" "R" which represents bottom white chess pieces
    // with the empty strings representing the empty spaces between both black and whites starting points
    // the chessPieces line up with the chessCells which are the positions on the chessBoard
    // chessCells
    // E.g. a8, b8, c8, d8, e8, f8, g8, h8
    //      a7, b7, c7, d7, e7, f7, g7, h7...
    
    // chessPieces
    // E.g. r,  n,  b,  q,  k,  b,  n,  r
    //      p,  p,  p,  p,  p,  p,  p,  p...
    board.push(new Cell(cell, piece));
    // the chessPieces and chessCells are then combined into an object by the previously defined Cell Class
    // and then are pushed into the board array
  }

  return board;
};
