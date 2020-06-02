import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Peer from "simple-peer";

import socket from 'services/socket';
import { SEND_SIGNAL, RECEIVE_SIGNAL } from 'services/socket';
import { useRoomContext } from 'contexts/room-context';
import { useChannelContext } from 'contexts/channel-context';

const useStyles = makeStyles(theme => ({
  stretch: { height: '100%', width: '100%', }
}));

const MediaPlayerSeeder = () => {
  const classes = useStyles();
  const videoRef = useRef();
  const peersRef = useRef({});
  const { users } = useRoomContext();
  const { currentUserId } = useChannelContext();

  const createPeer = (remoteId) => {
    const stream = videoRef.current.captureStream();
    const newPeer = new Peer({ trickle: false, initiator: true, stream });

    newPeer.on("signal", signal => {
      socket.emit(SEND_SIGNAL, { from: currentUserId, to: remoteId, signal });
    });

    return newPeer;
  }

  useEffect(
    () => {
      const newPeers = (users || []).filter(({ id }) =>
        id !== currentUserId && !peersRef.current[id]
      );

      newPeers.forEach(({ id, role }) => {
        if (role === "viewer") { peersRef.current[id] = createPeer(id); }
      });
    },
    [users, currentUserId]
  );

  useEffect(
    () => {
      socket.on(RECEIVE_SIGNAL, ({ from, to, signal }) => {
        if (to !== currentUserId) { return; }
        peersRef.current[from].signal(signal);
      });
    },
    [currentUserId]
  );

  return (
    <div>
      <p>Seeder: {currentUserId}</p>
      <video ref={videoRef} autoPlay muted controls className={classes.stretch}>
        <source src="/video/chrome.mp4" />
      </video>
    </div>
  );
}

export default MediaPlayerSeeder;
