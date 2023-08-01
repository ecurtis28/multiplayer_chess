import { Snackbar } from "@mui/material";

import React, { useContext } from "react";

import { Context } from "../../context/context";
import { type } from "../../context/action";

// Utilizing mui-snackbar library to create a message system to notify players of certain actions and states in the game
const MessageWindow = () => {
  const { message, dispatch } = useContext(Context);
  let timeOut = 2500;

  if (
    message ===
    "Your opponent is choosing which piece to switch with their pawn. Please wait until they have selected."
  ) {
    timeOut = 10000;

  }
  const handleClose = () => {
    dispatch({ type: type.CLEAR_MESSAGE });
  };
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={!!message}
      autoHideDuration={timeOut}
      onClose={handleClose}
      ContentProps={{
        "aria-describedby": "message-id",
      }}
      message={message}
    />
  );
};
export default MessageWindow;
