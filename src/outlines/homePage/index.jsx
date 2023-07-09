import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../context/context";
import HomeLayout from "../../components/homeLayout";
import "./home-page-styles.css";
import Button from "../../components/button";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";
import { setChessGameID } from "../../context/action.js";

const HomeForm = () => {
  const { dispatch, chessGameID } = useContext(Context);
  const [playerName, setPlayerName] = useState("");
  // const [chessGameID, setChessGameID] = useState("");

  const [customGameIDFlag, setCustomGameIDFlag] = useState(false);
  const history = useHistory();
  const location = useLocation();

  const { id: linkID } = queryString.parse(location.search);

  useEffect(() => {
    if (linkID) {
      console.log(location, linkID);
      return dispatch(setChessGameID(linkID));
    }
    // using queryString we determine if a specific part of the link exists (linkID)
    // if that gameID exists in the link we will then setChessGameID state to that ID
    if (customGameIDFlag === false) {
      const id = Math.random().toString().replace("0.", "");
      console.log(location, id);
      console.log(chessGameID);
      dispatch(setChessGameID(id));
    }
    // creates random gameID if the custom gameID is false (the input gameID on homepage)
  }, [dispatch, customGameIDFlag, linkID, location]);
  // not adding chessGameID as a dependency because it will create an infinite loop if it runs the effect if chessGameID alters
  // (the effect code itself alters chessGameID)
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    console.log("chessGameID", chessGameID);
    if (!(playerName && chessGameID)) {
      return;
    }
    // prevents the user from entering the game unless both a playerName and chessGameID is defined
    history.push(`/game?name=${playerName}&id=${chessGameID}`);
  };

  return (
    <div className="home-container">
      <h2>Play Chess with your friends online</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          value={playerName}
          onChange={({ target }) => setPlayerName(target.value)}
          placeholder="Player Name"
          // player name input
        />
        <input
          onChange={({ target }) => {
            dispatch(setChessGameID(target.value));
            setCustomGameIDFlag(true);
            // input for customGameID manipulation by client
          }}
          placeholder="Game ID"
          className="gameID-input"
        ></input>

        <div className="gameID">Game ID: {chessGameID}</div>
        <hr />

        <Button>Create</Button>
      </form>
    </div>
  );
};
const HomePage = () => {
  const HomeImage = () => (
    <img
      src={require("../../assets/home-image2.jpg")}
      alt="home"
      className="bg-img"
    />
  );
  return <HomeLayout HomeContent={HomeForm} HomeImage={HomeImage} />;
};

export default HomePage;
