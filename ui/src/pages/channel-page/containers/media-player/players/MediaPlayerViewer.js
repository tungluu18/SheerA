import React, { useRef, useEffect, useCallback } from 'react';
import Peer from "simple-peer";
import { makeStyles } from '@material-ui/core/styles';

import socket from 'services/socket';
import { SEND_SIGNAL, RECEIVE_SIGNAL } from 'services/socket';
import { useChannelContext } from 'contexts/channel-context';

const useStyles = makeStyles(() => ({
  stretch: { height: '100%', width: '100%', }
}));

const MediaPlayerViewer = () => {
  const classes = useStyles();
  const videoRef = useRef();
  const { currentUserId, parent, children } = useChannelContext();

  const sourcePeerRef = useRef();
  const forwardPeersRef = useRef({});

  const createPeer = useCallback(
    (remoteId) => {
      const stream = videoRef.current.srcObject;
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
      if (sourcePeerRef.current) {
        // remove connection to old parent
        sourcePeerRef.current.destroy();
      }

      sourcePeerRef.current = new Peer({ initiator: false, trickle: false, });

      sourcePeerRef.current.on("signal", signal => {
        socket.emit(SEND_SIGNAL, { from: currentUserId, to: parent, signal });
      });

      sourcePeerRef.current.on("stream", stream => {
        const oldStream = videoRef.current.srcObject;
        if (oldStream) {
          for (let peerId in forwardPeersRef.current) {
            if (forwardPeersRef.current[peerId]._remoteStream
              && forwardPeersRef.current[peerId]._remoteStream[0] === oldStream) {
              forwardPeersRef.current[peerId].removeStream(oldStream);
            }
            forwardPeersRef.current[peerId].addStream(stream);
          }
        }
        videoRef.current.srcObject = stream;
      });
    },

    [parent, currentUserId]
  );

  useEffect(
    () => {
      const newPeers = (children || []).filter((id) =>
        id !== currentUserId && !forwardPeersRef.current[id]
      );

      newPeers.forEach((id) => {
        forwardPeersRef.current[id] = createPeer(id);
      });

      // remove old peerConnection to removed children
      for (let peerId in forwardPeersRef.current) {
        if (!(children || []).includes(peerId)) {
          forwardPeersRef.current[peerId].destroy();
        }
      }
    },
    [children, currentUserId, createPeer]
  );

  useEffect(
    () => {
      socket.on(RECEIVE_SIGNAL, ({ from, to, signal }) => {
        if (to !== currentUserId) { return; }
        if (from === parent) {
          sourcePeerRef.current.signal(signal);
        } else {
          if (!(children || []).includes(from)) { return; }
          forwardPeersRef.current[from].signal(signal);
        }
      });

      return () => {
        socket.off(RECEIVE_SIGNAL);
      }
    },
    [currentUserId, parent, children]
  );

  return (
    <div>
      <p>Viewer: {currentUserId}</p>
      <video ref={videoRef} autoPlay muted controls className={classes.stretch} />

      <>
        <p>Receive from:</p>
        <li>{parent}</li>
      </>

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

export default MediaPlayerViewer;
