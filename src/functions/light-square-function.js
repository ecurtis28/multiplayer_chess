export const isLightSquare = (positionOnBoard, index) => {
  //positionOnBoard is the pob property inside the cell instance passed from the board array E.g. a8 b8 c8 ...
  const row = positionOnBoard[1];

  const isEven = (x) => x % 2 === 0;
  // checks if number is even
  // the chessboard is labeled with columns represented by letters from a-h
  // and rows represented by numbers 1-8 as shown here https://en.wikipedia.org/wiki/File:Chess_diagram_from_Howard_Staunton%27s_%22The_Chess-Player%27s_Handbook%22_(1947).png
  // due to this pattern of the chessBoard  https://cdn.shopify.com/s/files/1/1297/3303/products/standard-walnut-chess-board-21184254145_1024x1024.jpg?v=1575932118

  // if a chess row is an even number, if you were to count the all chess cells on that row from 1-8
  // all chess cells with an even number in that row are a darker color
  // and all chess cells with an odd number in that row are a lighter color
  // if statement below mimics this pattern

  if (isEven(row) && !isEven(index + 1)) {
    return true;
  }

  // if a chess row is an odd number, if you were to count the all chess cells on that row from 1-8
  // all chess cells with an even number in that row are a light color
  // and all chess cells with an odd number in that row are a darker color
  // if statement below mimics this pattern
  if (!isEven(row) && isEven(index + 1)) {
    return true;
  }

  return false;
};
