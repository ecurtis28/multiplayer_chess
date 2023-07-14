// This games object will hold all of the chess games
// The format of this data structure will be something like this
// const games = {
// 5133274: [player1, player2],
// 4781580: [player1, player2],
// };
// Each game will only have two players connected, multiple games can happen simultaneously
// The keys will refer to the game id

const games = {};

class Player {
  constructor(name, color, playerID, gameID, currentDate) {
    this.name = name;
    this.color = color;
    this.playerID = playerID;
    this.gameID = gameID;
    this.currentDate = currentDate;
  }
}
// The player class will be used to create distinct player objects

const addPlayer = (data) => {
  const { gameID, name, playerID } = data;
  let color;
  // destructure argument object passed from server/index.js to game.js

  if (!games[gameID]) {
    // Check if the specfic game id passed from client exists (game is active)
    // If it is not it will run this code
    color = Math.random() <= 0.5 ? "w" : "b";

    const currentDate = new Date();

    console.log(currentDate);
    console.log(`Player Joined: ${currentDate}`);
    // Randomly select white or black color by generating random number between 0-1
    const player = new Player(name, color, playerID, gameID, currentDate);

    // Creation of new player instance through player class
    games[gameID] = [player];
    
    console.log('game',games[gameID]);
    // Game is created
    // gameID and Player instance is added to the games object
    // console.log(games);
    // console.log(player.name);

    return {
      message: "Joined successfully",
      opponent: null,
      player,
    };
    // return a success message, with player instance
    // and an opponent of null since this is the first player to join the game
    // since return exits the function all code below will not be executed
    // until the function is called again
  }

  // If the code below is running it is because there is already a player waiting in the game

  const opponent = games[gameID][0];
  // adds first player in game as your opponent variable

  if (opponent === undefined) {
    return { error2: "Opponent not available" };
  }
  // prevents undefined opponent from triggering error
  color = opponent.color === "w" ? "b" : "w";

  const currentDate = new Date();

  console.log(currentDate);
  console.log(`Player Joined: ${currentDate}`);
  // if opponents color is white this players color will be black, else vice versa.
  const player = new Player(name, color, playerID, gameID, currentDate);
  // creates new player instance with player class

  games[gameID].push(player);
    console.log(games[gameID])
  // adds player instance to existing game in games object (referred to by gameID)
  // console.log(games);
  // console.log(player.name);
  // console.log(games[gameID]);

  let dateArray = [];
  let removePlayerFlag = false;
  let removePlayerIdentifier;
  for (let k = 0; k < games[gameID].length; k++) {
    let item = games[gameID][k];

    dateArray.push(item.currentDate);
    // console.log("item", item);
    // console.log(item.currentDate);
  }
  orderedDates = dateArray.sort(function (a, b) {
    return a - b;
  });
  // console.log(dateArray);
  // console.log(orderedDates);

  orderedDates.splice(2);
  // console.log(orderedDates);
  games[gameID].forEach(function (playerElement, index) {
    if (orderedDates.includes(playerElement.currentDate)) {
      // console.log("player confirmed", orderedDates, playerElement);
    }

    if (!orderedDates.includes(playerElement.currentDate)) {
      console.log("player rejected", orderedDates, playerElement);
      console.log("before deletion", games[gameID]);
      games[gameID].splice(index, 1);
      console.log("after deletion", games[gameID]);
      console.log(playerElement.name);
      removePlayerFlag = true;
    

      removePlayerIdentifier = playerElement.playerID;
    }
    // console.log(removePlayerFlag);
  });
  // console.log(games[gameID])
  if ((removePlayerFlag === true && removePlayerIdentifier === player.playerID)){
    return { error: "This game is full" };
    // checks for oldest players and removes all other players except the oldest (first and second players to join the game)
  }
  

  if (opponent === undefined) {
    console.log(`Player ${player.playerID} not available`);
  }
  // Alerts server that a specific user cannot properly match with another user at the moment
  return {
    message: "Added successfully",
    opponent,
    player,
  };
  // returns success message, opponent and player instance, and opponent
  // (which is the first player instance we defined above in the first function call)
  // exits function
};

// If the code below is running it is
// because there are already two players in the game
// and the game has ended by someone quitting connection
// between their client and the server (exiting/refreshing tab)

const removePlayer = (playerID) => {
  // playerID sent by client is the player that quit
  console.log(games)
 
  for (const game in games) {
    // loops through all games
    let players = games[game];
    // for each game in games it assigns the game (players array) to a variable
    const index = players.findIndex((pl) => {
      console.log("pl.playerID", pl.playerID);
      console.log("playerID", playerID);
      console.log(pl.playerID === playerID);
      return pl.playerID === playerID;
    });
    // the players array is searched for the player with a specific playerID (which is the socket.id of the client)
    //  it returns an index of that player if no player of that player id is found it returns -1

    console.log(index);

    // console.log(players);

    // console.log(games);
    // if (index === -1) {
    if (games[game].length === 0) {
      console.log(players);
      console.log('delete game')
      delete games[game];
    }
    // }
    if (index !== -1) {
      // if player of that id is found

      const disconnectedPlayer = players.splice(index, 1)[0];

      console.log("Player Left", playerID);
      console.log(disconnectedPlayer);
      // console.log(games[game], games[game]);
      console.log("players after removal", players);
      return disconnectedPlayer;
      // deletes the player object from game and returns it
    }
  }
};
function game(id) {
  return games[id];
  // function to access our games object by id
}
module.exports = {
  addPlayer,
  game,
  removePlayer,
};
// export functions
