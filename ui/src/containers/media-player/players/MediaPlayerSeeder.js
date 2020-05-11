import React, { useRef, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Peer from "simple-peer";

import socket from 'services/socket';
import { SEED_VIDEO, SEND_SIGNAL, RECEIVE_SIGNAL } from 'services/socket';
import { useRoomContext } from 'contexts/room-context';

const useStyles = makeStyles(theme => ({
  stretch: { height: '100%', width: '100%', }
}));

const MediaPlayerSeeder = () => {
  const classes = useStyles();
  const videoRef = useRef();
  const { currentUserId, users } = useRoomContext();
  const peersRef = useRef({});

  useEffect(
    () => {
      const newPeers = (users || []).filter(({ id }) =>
        id !== currentUserId && !peersRef.current[id]
      );

      newPeers.forEach(({ id, role }) => {
        if (role === "viewer") { peersRef.current[id] = createPeer(id); }
      });
    },
    [users]
  );

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
      socket.on(RECEIVE_SIGNAL, ({ from, to, signal }) => {
        if (to !== currentUserId) { return; }
        peersRef.current[from].signal(signal);
      });
    },
    []
  );

  return (
    <div>
      <p>{currentUserId}</p>
      <video ref={videoRef} autoPlay muted controls className={classes.stretch}>
        <source src="/video/chrome.mp4" />
      </video>
    </div>
  );
}

export default MediaPlayerSeeder;
