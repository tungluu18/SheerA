import React, { useState, useEffect, useContext } from 'react';

import socket from 'services/socket';
import { UPDATE_USER_LIST, REMOVE_USER } from 'services/socket';

const RoomContext = React.createContext();

const RoomProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  const setupSocket = () => {
    socket.on(UPDATE_USER_LIST, ({ users: newUsers }) => {
      setUsers([...users, ...newUsers]);
      console.log(UPDATE_USER_LIST, newUsers);
    });

    socket.on(REMOVE_USER, ( userId ) => {
      setUsers(users.filter(e => e !== userId));
      console.log(REMOVE_USER, userId);
    });

    return () => {
      socket.off(UPDATE_USER_LIST);
      socket.off(REMOVE_USER);
    }
  }

  useEffect(setupSocket, [users]);

  return (
    <RoomContext.Provider value={{ users }}>
      {children}
    </RoomContext.Provider>
  )
}

const useRoomContext = () => useContext(RoomContext);

export {
  RoomProvider,
  useRoomContext,
}
