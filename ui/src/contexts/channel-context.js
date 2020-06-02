import React, { useState, useEffect } from 'react';
import socket from 'services/socket';
import {
  CREATE_CHANNEL_RESP, JOIN_CHANNEL_RESP,
  CHANNEL_ROUTE_UPDATE,
  JOIN_CHANNEL,
} from 'services/socket';

const ChannelContext = React.createContext();

const ChannelProvider = ({ children }) => {
  const currentUserId = socket.id;
  const [channelRoute, setChannelRoute] = useState();

  const onChannelRoute = ({ status, error, data }) => {
    console.log("onChannelRoute", status, error, data);
    if (status !== 0) {
      setChannelRoute({ error });
      return;
    }
    console.log(data.role, data.parent, data.children);
    setChannelRoute(data);
  }

  const joinChannel = (channelId) => {
    socket.emit(JOIN_CHANNEL, ({ channelId }));
  }

  useEffect(
    () => {
      socket.on(CHANNEL_ROUTE_UPDATE, onChannelRoute);
      socket.on(CREATE_CHANNEL_RESP, onChannelRoute);
      socket.on(JOIN_CHANNEL_RESP, onChannelRoute);

      return () => {
        socket.off(CHANNEL_ROUTE_UPDATE);
        socket.off(CREATE_CHANNEL_RESP);
        socket.off(JOIN_CHANNEL_RESP);
      }
    },
    []
  );

  return (
    <ChannelContext.Provider value={{ joinChannel, currentUserId, ...channelRoute }}>
      {children}
    </ChannelContext.Provider>
  )
}

const useChannelContext = () =>
  React.useContext(ChannelContext);

const withChannelContext = (WrappedComponent) => (props) =>
  <ChannelProvider>
    <WrappedComponent {...props} />
  </ChannelProvider>

export {
  ChannelProvider,
  useChannelContext,
  withChannelContext,
}
