import React, { useState, useEffect, useRef } from 'react';

import socket from 'services/socket';
import RemoteUser from 'containers/remote-user-call/RemoteUserCall';
import { useRoomContext } from 'contexts/room-context';

const MainPage = () => {
  const { users } = useRoomContext();
  const videoRef = useRef();
  const [localStream, setLocalStream] = useState();

  const handleVideoStream = stream => {
    console.log("camera", stream);
    videoRef.current.srcObject = stream;
    setLocalStream(stream);
  }

  const handleVideoError = error =>
    console.log("error", error);

  useEffect(
    () => {
      console.log("watching you ...");
      navigator.getUserMedia(
        { video: true, audio: false },
        handleVideoStream,
        handleVideoError
      );
    },
    []
  );

  return (
    <>
      <div>
        <strong>My video</strong>
        <br />
        <video ref={videoRef} autoPlay={true}></video>
        <br />
        <strong>My id: {socket.id}</strong>
        <br />
        <br />
      </div>
      <div>
        <strong>Current users</strong>
        <div className="video-container">
          {users.map((userId, index) =>
            <RemoteUser key={index} localStream={localStream} userId={userId} />)}
        </div>
      </div>
    </>
  );
}

export default MainPage;
