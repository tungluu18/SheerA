import React, { useRef, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Peer from "simple-peer";

import socket from 'services/socket';
import { SEND_SIGNAL, RECEIVE_SIGNAL } from 'services/socket';
import { useChannelContext } from 'contexts/channel-context';

const useStyles = makeStyles(theme => ({
  stretch: { height: '100%', width: '100%', }
}));

const MediaPlayerSeeder = () => {
  const classes = useStyles();
  const videoRef = useRef();
  const { currentUserId, children } = useChannelContext();

  const forwardPeersRef = useRef({});

  const createPeer = useCallback(
    (remoteId) => {
      const stream = videoRef.current.captureStream();
      const newPeer = new Peer({ trickle: false, initiator: true, stream });

      newPeer.on("signal", signal => {
        socket.emit(SEND_SIGNAL, { from: currentUserId, to: remoteId, signal });
      });

      return newPeer;
    },
    [currentUserId]
  );

  useEffect(
    () => {
      const newPeers = (children || []).filter((id) =>
        id !== currentUserId && !forwardPeersRef.current[id]
      );

      newPeers.forEach((id) => {
        forwardPeersRef.current[id] = createPeer(id);
      });
    },
    [children, currentUserId, createPeer]
  );

  useEffect(
    () => {
      socket.on(RECEIVE_SIGNAL, ({ from, to, signal }) => {
        if (to !== currentUserId) { return; }
        forwardPeersRef.current[from].signal(signal);
      });
    },
    [currentUserId]
  );

  return (
    <div>
      <p>Seeder: {currentUserId}</p>
      <video ref={videoRef} autoPlay muted controls className={classes.stretch}>
        <source src="/video/frag_bunny.mp4" />
      </video>

      {(children || []).length
        ? <>
          <p>Forward to:</p>
          <ul>
            {(children || []).map((e, index) => <li key={index}>{e}</li>)}
          </ul>
        </>
        : null}
    </div>
  );
}

export default MediaPlayerSeeder;
