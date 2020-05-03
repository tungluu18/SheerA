import React, { useState, useEffect } from 'react';

import socket from 'services/socket';
import {
  MAKE_CALL, CALL_MADE,
  MAKE_ANSWER, ANSWER_MADE,
  ADD_ICE_CANDIDATE, SEND_ICE_CANDIDATE,
} from 'services/socket';

const RTC_CONFIGURATION = {
  iceServers: [{ url: 'stun:stun.l.google.com:19302' }]
}

const PeerConnectionContext = React.createContext();


const PeerConnectionProvider = ({ children }) => {
  const [remotePeerId, setRemotePeerId] = useState();
  const [peerConnection] = useState(
    new RTCPeerConnection(RTC_CONFIGURATION)
  );

  // Set up and handle ice candidate framework
  useEffect(
    () => {
      peerConnection.onicecandidate = ({ candidate }) => {
        socket.emit(SEND_ICE_CANDIDATE, {
          candidate, to: remotePeerId
        });
      }
    },
    [remotePeerId, peerConnection]
  );

  const connectPeer = async (socketId) => {
    if (remotePeerId) { return; }

    const offer = await peerConnection.createOffer({
      iceRestart: true
    });
    await peerConnection.setLocalDescription(
      new RTCSessionDescription(offer)
    );
    socket.emit(MAKE_CALL, { to: socketId, offer });
    setRemotePeerId(socketId);
  }

  // Setup socket's callbacks
  useEffect(
    () => {
      socket.on(ANSWER_MADE, async ({ from, answer }) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      socket.on(CALL_MADE, async ({ offer, from }) => {
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(
          new RTCSessionDescription(answer)
        );

        socket.emit(MAKE_ANSWER, { to: from, answer });
      });

      socket.on(ADD_ICE_CANDIDATE, async ({ candidate, from }) => {
        if (!candidate) { return; }
        try {
          await peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.log(error);
        }
      });

      return () => {
        socket.off(ANSWER_MADE);
        socket.off(CALL_MADE);

        socket.off(ADD_ICE_CANDIDATE);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  );

  return (
    <PeerConnectionContext.Provider
      value={{ peerConnection, connectPeer }}>
      {children}
    </PeerConnectionContext.Provider>
  );
}


const usePeerConnectionContext = () =>
  React.useContext(PeerConnectionContext);


const withPeerConnectionContext = (WrappedComponent) => (props) =>
  <PeerConnectionProvider>
    <WrappedComponent {...props} />
  </PeerConnectionProvider>


export {
  PeerConnectionProvider,
  usePeerConnectionContext,
  withPeerConnectionContext,
}
