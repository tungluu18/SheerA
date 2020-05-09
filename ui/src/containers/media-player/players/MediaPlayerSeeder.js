import React, { useRef, useEffect, useState } from 'react';
import { usePeerConnectionContext } from 'contexts/peer-connection-context';
import { useRoomContext } from 'contexts/room-context';

import { makeStyles } from '@material-ui/core/styles';

import socket from 'services/socket';
import { SEED_VIDEO } from 'services/socket';

const useStyles = makeStyles(theme => ({
  stretch: { height: '100%', width: '100%', }
}));

const MediaPlayerSeeder = () => {
  const classes = useStyles();
  const videoRef = useRef();
  const { peerConnection, connectPeer } = usePeerConnectionContext();
  const { currentUserId } = useRoomContext();

  useEffect(
    () => {
      const video = videoRef.current || {};
      const stream = video.captureStream();
      stream.onactive = (data) =>
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
    },
    [(videoRef.current || {}).captureStream, peerConnection]
  );

  useEffect(
    () => {
      socket.on(SEED_VIDEO, ({ to }) => connectPeer(to));
      return () => {
        socket.off(SEED_VIDEO);
      }
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
