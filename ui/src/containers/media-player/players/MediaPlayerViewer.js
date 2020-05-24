import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Peer from "simple-peer";
// import { usePeerConnectionContext, withPeerConnectionContext } from 'contexts/peer-connection-context';

import socket from 'services/socket';
import { REQUEST_VIDEO, SEND_SIGNAL, RECEIVE_SIGNAL } from 'services/socket';
import { useRoomContext } from 'contexts/room-context';


const useStyles = makeStyles(theme => ({
  stretch: { height: '100%', width: '100%', }
}));

const MediaPlayerViewer = (props) => {
  const classes = useStyles();
  const videoRef = useRef();
  const { users, currentUserId } = useRoomContext();
  const peerRef = useRef();

  useEffect(
    () => {
      const seeder = (users || []).find(({ role }) => role === "seeder");
      if (!seeder || !currentUserId) { return; }

      peerRef.current = new Peer({ initiator: false, trickle: false, });

      peerRef.current.on("signal", signal => {
        socket.emit(SEND_SIGNAL, { from: currentUserId, to: seeder.id, signal });
      });

      peerRef.current.on("stream", stream => {
        videoRef.current.srcObject = stream;
      });

      socket.on(RECEIVE_SIGNAL, ({ from, to, signal }) => {
        if (to !== currentUserId) { return; }
        peerRef.current.signal(signal);
      });

      return () => {
        socket.off(RECEIVE_SIGNAL);
      }
    },
    [users]
  );

  return (
    <div>
      <p>Viewer: {currentUserId}</p>
      <video ref={videoRef} autoPlay muted controls className={classes.stretch} />
    </div>
  );
}

export default MediaPlayerViewer;
