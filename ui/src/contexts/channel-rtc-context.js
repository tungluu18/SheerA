
import React, { useRef, useCallback, useEffect, useState } from 'react';
import Peer from 'simple-peer';

import { useChannelContext } from 'contexts/channel-context'
import socket, { SEND_SIGNAL, RECEIVE_SIGNAL } from 'services/socket';

const ChannelRTCContext = React.createContext();

export const ChannelRTCProvider = ({ children: childrenComponent }) => {
  const { currentUserId, children } = useChannelContext();
  const [localStream, setLocalStream] = useState();
  const forwardPeersRef = useRef({});

  const createPeer = useCallback(
    (remoteId) => {
      const newPeer = new Peer({
        trickle: false,
        initiator: true,
        stream: localStream
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
        forwardPeersRef.current[from].signal(signal);
      });
    },
    [currentUserId]
  );

  return (
    <ChannelRTCContext.Provider value={{ setLocalStream }}>
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
