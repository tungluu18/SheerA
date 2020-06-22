
import React, { useRef, useCallback, useEffect, useState } from 'react';
import Peer from 'simple-peer';

import { useChannelContext } from 'contexts/channel-context'
import socket, { SEND_SIGNAL, RECEIVE_SIGNAL } from 'services/socket';
import { iceServers } from 'utils/config';

const ChannelRTCContext = React.createContext();

export const ChannelRTCProvider = ({ children: childrenComponent }) => {
  const { currentUserId, parent, children } = useChannelContext();
  const [localStream, setLocalStream] = useState();

  const sourcePeerRef = useRef();
  const forwardPeersRef = useRef({});

  const createPeer = useCallback(
    (remoteId) => {
      const newPeer = new Peer({
        trickle: false,
        initiator: true,
        stream: localStream,
        iceServers,
      });

      newPeer.on("signal", signal => {
        socket.emit(SEND_SIGNAL, { from: currentUserId, to: remoteId, signal });
      });

      return newPeer;
    },
    [currentUserId, localStream]
  );

  useEffect(
    () => {
      if (!parent) { return; }

      if (sourcePeerRef.current) {
        // remove connection to old parent
        sourcePeerRef.current.destroy();
      }

      sourcePeerRef.current = new Peer({ initiator: false, trickle: false, iceServers});

      sourcePeerRef.current.on("signal", signal => {
        socket.emit(SEND_SIGNAL, { from: currentUserId, to: parent, signal });
      });

      sourcePeerRef.current.on("stream", stream => {
        // const oldStream = videoRef.current.srcObject;
        if (localStream) {
          for (let peerId in forwardPeersRef.current) {
            if (forwardPeersRef.current[peerId]._remoteStream
              && forwardPeersRef.current[peerId]._remoteStream[0] === localStream) {
              forwardPeersRef.current[peerId].removeStream(localStream);
            }
            forwardPeersRef.current[peerId].addStream(stream);
          }
        }

        setLocalStream(stream);
      });
    },

    [parent, currentUserId]
  );

  useEffect(
    () => {
      const newPeers = (children || []).filter((id) =>
        id !== currentUserId && !forwardPeersRef.current[id]
      );

      // add new peerConnection to new children
      newPeers.forEach((peerId) => {
        forwardPeersRef.current[peerId] = createPeer(peerId);
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
    <ChannelRTCContext.Provider value={{ setLocalStream, localStream }}>
      {childrenComponent}
    </ChannelRTCContext.Provider>
  )
}

export const useChannelRTCContext = () =>
  React.useContext(ChannelRTCContext);

export const withChannelRTCContext = (WrappedComponent) => (props) =>
  <ChannelRTCProvider>
    <WrappedComponent {...props} />
  </ChannelRTCProvider>