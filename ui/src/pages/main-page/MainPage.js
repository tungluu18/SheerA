import React, { useState, useEffect, useRef } from 'react';

import socket from 'services/socket';
import RemoteUser from 'containers/RemoteUser';

const MainPage = () => {
  const [users, setUsers] = useState([]);
  const [localStream, setLocalStream] = useState();

  const videoRef = useRef();

  const addUser = ({ users: newUsers }) =>
    setUsers([...users, ...newUsers]);

  const rmUser = ({ socketId }) =>
    setUsers(users.filter(e => e !== socketId));

  const setupSocket = () => {
    socket.on("update-user-list", addUser);
    socket.on("remove-user", rmUser);

    return () => {
      socket.off("update-user-list");
      socket.off("remove-user");
    }
  }

  useEffect(setupSocket, [users]);

  const handleVideoStream = stream => {
    console.log("camera", stream);
    videoRef.current.srcObject = stream;
    setLocalStream(stream);
  }


  const handleVideoError = error =>
    console.log("error", error);

  useEffect(() => {
    console.log("watching you bitch...");
    navigator.getUserMedia(
      { video: true, audio: false },
      handleVideoStream,
      handleVideoError
    );
  }, []);

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
