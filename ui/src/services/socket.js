import socketIOClient from 'socket.io-client'

const socket = socketIOClient(`${process.env.REACT_APP_TRACKER_SERVER_ADDRESS}/channels`);

export const REQUEST_VIDEO = "request-video";
export const SEED_VIDEO    = "seed-video";

export const MAKE_CALL = "make-call";
export const CALL_MADE = "call-made";

export const ANSWER_MADE = "answer-made";
export const MAKE_ANSWER = "make-answer";

export const ADD_ICE_CANDIDATE = "add-ice-candidate";
export const SEND_ICE_CANDIDATE = "send-ice-candidate";

export const UPDATE_USERS = "update-users";
export const REMOVE_USER = "remove-user";

export const SEND_SIGNAL = "send-signal";
export const RECEIVE_SIGNAL = "receive-signal";

export const CREATE_CHANNEL      = "create-channel";
export const CREATE_CHANNEL_RESP = "create-channel-resp";

export const JOIN_CHANNEL      = "join-channel";
export const JOIN_CHANNEL_RESP = "join-channel-resp";

export const CHANNEL_ROUTE_UPDATE = "channel-route-update";

export const SEND_MESSAGE    = "send-message";
export const RECEIVE_MESSAGE = "receive-message";

export const FIND_CHANNEL       = "find-channel";
export const FIND_CHANNEL_RESP  = "find-channel-resp";

export default socket;
