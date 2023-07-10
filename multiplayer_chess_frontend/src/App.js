import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Game from "./outlines/chessGame";
import HomePage from "./outlines/homePage";

import { ChessProvider } from "./context/context";
function App() {
  return (
    <Router>
      <ChessProvider>
        <Route path="/game" component={Game} />
        <Route path="/" exact component={HomePage} />
      </ChessProvider>
    </Router>
  );
}

export default App;
