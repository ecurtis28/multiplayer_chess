const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const { addPlayer, game, removePlayer } = require("./game");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
console.log("testtesttest");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `http://multiplayer-chess-site.onrender.com`,
    // location of frontend (need to somehow specify port to render so that this code works)
    methods: ["GET", "POST"],
  },
});

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
    }, 1800);
  });
  // resets all reloadstates we defined in chessGame
  socket.on("move", ({ from, to, gameID }) => {
    // listens for move events from client
    socket.broadcast.to(gameID).emit("opponentMove", { from, to });

    // emits the opponentMove event and from and to variable to the opponent
  });

  socket.on("disconnect", () => {
    const player = removePlayer(socket.id);
    // use removePlayer() function in game.js to remove the player that disconnected from game/players array in games object
    // return the removed player and assign it to the player variable

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

server.listen(port, () => console.log("Server running on localhost: " + port));
// creates backend server listening on port 3001