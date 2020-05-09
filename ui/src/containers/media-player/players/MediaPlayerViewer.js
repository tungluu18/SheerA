import React, { useRef, useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { usePeerConnectionContext } from 'contexts/peer-connection-context';
import { useRoomContext } from 'contexts/room-context';
import Button from 'commons/Button';

import socket from 'services/socket';
import { REQUEST_VIDEO } from 'services/socket';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  stretch: { height: '100%', width: '100%', }
}));

const MediaPlayerViewer = (props) => {
  const classes = useStyles();
  const videoRef = useRef();
  // const [isConnected, setIsConnected] = useState(false);
  const { peerConnection } = usePeerConnectionContext();
  const { users, currentUserId } = useRoomContext();

  useEffect(
    () => {
      const seeder = (users || []).find(e => e.role === "seeder");
      if (!seeder) { return; }
      socket.emit(REQUEST_VIDEO, { to: seeder.id });
    },
    [users]
  );

  useEffect(
    () => {
      try {
        peerConnection.ontrack = ({ streams: [stream] }) => {
          console.log("received", stream);
          if (videoRef.current.srcObject) { return; }
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.log(error);
      }
    },
    [peerConnection]
  );

  return (
    <div>
      <p>{currentUserId}</p>
      {/* <Grid container justify="center">
        <Button onClick={handleConnect}>Get Video</Button>
      </Grid> */}
      <video ref={videoRef} autoPlay muted className={classes.stretch} />
    </div>
  );
}

export default MediaPlayerViewer;
