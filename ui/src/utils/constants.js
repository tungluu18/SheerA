const DISPLAY_MESSAGES = {
  "channel-does-not-exist": "Channel does not exist",
  "channel-name-is-in-use": "Channel's name is in use",
}

export const DisplayMessage = message =>
  DISPLAY_MESSAGES[message] ? DISPLAY_MESSAGES[message] : message;
