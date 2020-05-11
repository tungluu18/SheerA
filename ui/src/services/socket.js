import socketIOClient from 'socket.io-client'

const socket = socketIOClient(process.env.REACT_APP_TRACKER_SERVER_ADDRESS);

const REQUEST_VIDEO = "request-video";
const SEED_VIDEO    = "seed-video";

const MAKE_CALL = "make-call";
const CALL_MADE = "call-made";

const ANSWER_MADE = "answer-made";
const MAKE_ANSWER = "make-answer";

const ADD_ICE_CANDIDATE = "add-ice-candidate";
const SEND_ICE_CANDIDATE = "send-ice-candidate";

const UPDATE_USERS = "update-users";
const REMOVE_USER = "remove-user";

const SEND_SIGNAL = "send-signal";
const RECEIVE_SIGNAL = "receive-signal";

export {
  REQUEST_VIDEO, SEED_VIDEO,
  MAKE_CALL, CALL_MADE,
  MAKE_ANSWER, ANSWER_MADE,
  UPDATE_USERS, REMOVE_USER,
  ADD_ICE_CANDIDATE, SEND_ICE_CANDIDATE,
  SEND_SIGNAL, RECEIVE_SIGNAL,
}

export default socket;
