const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const { addPlayer, game, removePlayer } = require("./game");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());

console.log(port);
const server = http.createServer(app);
const io = new Server(server, {
  // http://localhost:3000
  // `https://multiplayer-chess-site.onrender.com`
  cors: {
    origins: `https://multiplayer-chess-site.onrender.com`,

    // location of frontend (need to somehow specify port to render so that this code works)
    // I might be able just pass the render site link
    // I also forgot to add socket.io connect link to frontend in chessGame which is probably why I received an error
    methods: ["GET", "POST"],
  },
  pingInterval: 2000,
  pingTimeout: 10000,
});

let globalPlayer = null;
let initialLoad1 = false;
let initialLoad2 = false;
let previouslyLeftPlayer1;
let previouslyLeftPlayer2;
io.on("connection", (socket) => {
  console.log("Player", socket.id, "Connected");

  let clientGameID = null;

  socket.on("join", ({ name, gameID }, callback) => {
    // listens for join event emitted by client
    // name and gameID passed by client and destructured here into variables

    // callback passed with it's parameters
    clientGameID = gameID;

    const { error, error2, player, opponent } = addPlayer({
      name,
      playerID: socket.id,
      gameID,
    });
    if (player) {
      globalPlayer = player;
      if (initialLoad1 === false) {
        previouslyLeftPlayer1 = player.name;
        initialLoad1 = true;
      }
      if (initialLoad2 === false) {
        if (player.name !== previouslyLeftPlayer1) {
          previouslyLeftPlayer2 = player.name;
          initialLoad2 = true;
        }
      }
    }
    // name gameID and the newly created playerID (which references socket.id) arguments are passed to addPlayer function in game.js
    // returns the the player object which has the following format and properties:
    // '20': [
    //   Player {
    //     name: 'Frank',
    //     color: 'b',
    //     playerID: 't8CS-oDUPrOv8mwkAAAF',
    //     gameID: '20'
    //   },

    // as well as the the opponent object which has similar properties and format
    // and the error object which has a message property
    socket.join(gameID);
    if (error) {
      return callback({ error });
      // if error 1 exists (by default it is undefined placeholder variable))
      // it will call the callback function and notify the player of the error message
      // the function is returned which will prevent further code from executing
    }
    if (error2) {
      return callback({ error2 });
      // if error 2 exists (by default it is undefined placeholder variable))
      // it will call the callback function and notify the player of the error message
      // the function is returned which will prevent further code from executing
    }

    // joins the user to the room/game at specified gameID passed
    callback({ color: player.color });
    // calls callback function with color received from addPlayer()

    socket.emit("welcome", {
      message: `Hello ${player.name}, Welcome to the game`,
      opponent,
    });

    //send welcome message to the player connected, and also send the opponent player's data

    socket.broadcast.to(player.gameID).emit("opponentJoin", {
      message: `${player.name} has joined the game. `,
      opponent: player,
    });
    // Tell player2 that player1 has joined the game.

    if (game(gameID).length >= 2) {
      // if game is full

      const white = game(gameID).find((player) => player.color === "w");
      // search games for game with specified gameID to find the player with the color white
      io.to(gameID).emit("message", {
        // emit message event to both players stating white should go first
        message: `Let's start the game. White (${white.name}) goes first`,
      });
    }
  });

  socket.on("sendReloadState", ({ backendReloadState }) => {
    socket.broadcast.to(clientGameID).emit("receiveReloadState", {
      receivedFromOpponentReloadState: backendReloadState,
    });
  });
  // receives reloadState and sends it to opponent
  socket.on("resetStates", () => {
    setTimeout(() => {
      socket.emit("resetStatesReceive");
    }, 3000);
  });
  // resets all reloadstates we defined in chessGame

  socket.on("sendDisableFlag", () => {
    //  io.in(socketId).emit(/* ... */);
    setTimeout(() => {
      if (globalPlayer.name === previouslyLeftPlayer1) {
        console.log(clientGameID);
        io.to(globalPlayer.playerID).emit("receiveDisableFlag");
      }
      if (globalPlayer.name === previouslyLeftPlayer2) {
        console.log(clientGameID);
        io.to(globalPlayer.playerID).emit("receiveDisableFlag");
      }
    }, 98);
  });
  //  rec

  socket.on("sendCastle", ({ sentChessFen }) => {
    socket.broadcast
      .to(clientGameID)
      .emit("receiveCastle", { receiveChessFen: sentChessFen });
  });

  socket.on("move", ({ from, to, gameID, promotionFlag, pauseGame }) => {
    // listens for move events from client

    socket.broadcast.to(gameID).emit("opponentMove", {
      from,
      to,
      receivedPromotionFlag: promotionFlag,
      receivedPauseGame: pauseGame,
    });

    // emits the opponentMove event and from and to variable to the opponent
  });

  socket.on("sendPromotionFlag", ({ fenState }) => {
    console.log(fenState);
    socket.broadcast
      .to(clientGameID)
      .emit("receivePromotionFlag", { receivedFenState: fenState });
  });
  socket.on("endPauseGame", () => {
    console.log("endPauseGame");
    socket.broadcast.to(clientGameID).emit("receiveEndPauseGame");
  });
  // sends endPauseGame trigger from player to server to other player

  socket.on("sendConcede", () => {
    socket.broadcast.to(clientGameID).emit("receiveConcede");
  });
  // sends concede trigger from player to server to other player
  socket.on("disconnect", () => {
    const player = removePlayer(socket.id);
    // use removePlayer() function in game.js to remove the player that disconnected from game/players array in games object
    // return the removed player and assign it to the player variable
    timeInterval = 0;
    console.log("disconnect");
    if (player) {
      // if player exists
      io.to(player.gameID).emit("message", {
        message: `${player.name} has left the game`,
      });
      // emit message event to game/room with that gameID
      socket.broadcast.to(player.gameID).emit("opponentLeft");
      // emit opponentLeft event to game/room with that gameID

      console.log(`${player.name} has left the game ${player.gameID}`);
    }
  });
});

server.listen(3001, () => console.log("Server running on localhost: " + 3001));
// creates backend server listening on port 3001

// If using create-react-app
// To run production version locally after building with npm run build
// use this command after it is built
// npx serve -s build
