import React, { useState, useEffect, useContext } from 'react';

import socket from 'services/socket';
import { UPDATE_USERS, REMOVE_USER } from 'services/socket';

const RoomContext = React.createContext();

const RoomProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState();
  const [users, setUsers] = useState([]);

  const setupSocket = () => {
    if (!currentUserId) { setCurrentUserId(socket.id); }

    socket.on(UPDATE_USERS, ({ users: newUsers }) => {
      setUsers([...users, ...newUsers]);
    });

    socket.on(REMOVE_USER, (userId) => {
      setUsers(users.filter(e => e !== userId));
      console.log(REMOVE_USER, userId);
    });

    return () => {
      socket.off(UPDATE_USERS);
      socket.off(REMOVE_USER);
    }
  }

  useEffect(setupSocket, [users]);

  return (
    <RoomContext.Provider value={{ users, currentUserId }}>
      {children}
    </RoomContext.Provider>
  )
}

const useRoomContext = () => useContext(RoomContext);

const withRoomContext = (WrappedComponent) => (props) =>
  <RoomProvider>
    <WrappedComponent {...props} />
  </RoomProvider>

export {
  RoomProvider,
  useRoomContext,
  withRoomContext,
}
