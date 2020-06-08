import React, { useState, useEffect, useRef, } from 'react';
import socket from 'services/socket';
import {
  CREATE_CHANNEL_RESP, JOIN_CHANNEL_RESP,
  CHANNEL_ROUTE_UPDATE,
  JOIN_CHANNEL,
} from 'services/socket';

const ChannelContext = React.createContext();

const ChannelProvider = ({ children }) => {
  const currentUserId = socket.id;
  const channelRouteRef = useRef({});
  const [channelRoute, setChannelRoute] = useState({});

  const onChannelRoute = ({ status, error, data }) => {
    if (status !== 0) {
      channelRouteRef.current.error = error;
      setChannelRoute(channelRouteRef.current);
      return;
    }
    Object.assign(channelRouteRef.current, data);
    setChannelRoute(Object.assign({}, channelRouteRef.current));
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
    <ChannelContext.Provider
      value={{ ...channelRoute, joinChannel, currentUserId }}>
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
