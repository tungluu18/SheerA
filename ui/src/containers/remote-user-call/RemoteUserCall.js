import React, { useState, useEffect, useRef } from 'react';

import {
  usePeerConnectionContext,
  withPeerConnectionContext,
} from 'contexts/peer-connection-context';


const RemoteUser = ({ userId, localStream }) => {
  const { peerConnection, connectPeer } = usePeerConnectionContext();
  const [isConnected, setIsConnected] = useState(false);
  const remoteVideoRef = useRef();

  // Add media stream from camera to peer connection
  useEffect(
    () => {
      try {
        localStream.getTracks().forEach(track =>
          peerConnection.addTrack(track, localStream)
        );
      } catch (error) {
        console.log(error);
      }
    },
    [localStream, peerConnection]
  );

  // Add received Mediastream from RTCPeerConnection to video element
  useEffect(
    () => {
      try {
        peerConnection.ontrack = ({ streams: [stream] }) => {
          if (remoteVideoRef.current.srcObject) { return; }
          remoteVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.log(error);
      }
    },
    [peerConnection]
  );

  const handleCall = async () => {
    await connectPeer(userId);
    setIsConnected(true);
  }

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

export default withPeerConnectionContext(RemoteUser);
