import React, { useState, useEffect, useRef } from 'react';

import socket from 'services/socket';
import {
  MAKE_CALL, CALL_MADE,
  MAKE_ANSWER, ANSWER_MADE,
  SEND_ICE_CANDIDATE, ADD_ICE_CANDIDATE
} from 'services/socket';

const RTC_CONFIGURATION = {
  iceServers: [{ url: 'stun:stun.l.google.com:19302' }]
}

const RemoteUser = ({ userId, localStream }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [peerConnection, _] = useState(new RTCPeerConnection(RTC_CONFIGURATION));

  const remoteVideoRef = useRef();

  // Add media stream from camera to peer connection
  useEffect(() => {
    try {
      localStream.getTracks().forEach(track =>
        peerConnection.addTrack(track, localStream)
      );
    } catch (error) {
      console.log(error);
    }
  }, [localStream]);

  // Add received Mediastream from RTCPeerConnection to video element
  useEffect(() => {
    try {
      peerConnection.ontrack = ({ streams: [stream] }) => {
        if (remoteVideoRef.current.srcObject) { return; }
        remoteVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log(error);
    }
  }, [remoteVideoRef.current])

  // Set up and handle ice candidate framework
  useEffect(() => {
    peerConnection.onicecandidate = ({ candidate }) => {
      socket.emit(SEND_ICE_CANDIDATE, { candidate, to: userId });
    };
  }, [userId]);

  const handleCall = async () => {
    if (isConnected) { return; }
    const offer = await peerConnection.createOffer({
      iceRestart: true,
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await peerConnection.setLocalDescription(
      new RTCSessionDescription(offer)
    );
    socket.emit(MAKE_CALL, { to: userId, offer });
  }

  // Setup socket's callbacks
  const setupSocket = () => {
    socket.on(ANSWER_MADE, async ({ from, answer }) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setIsConnected(true);
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
  }

  useEffect(setupSocket, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <strong>{userId}</strong>
      <div>
        <video ref={remoteVideoRef} autoPlay />
      </div>
      <button disabled={isConnected} onClick={handleCall}> Call </button>
    </div>
  );
}

export default RemoteUser;
