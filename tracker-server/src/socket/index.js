import SocketIO from 'socket.io';
import redisAdapter from 'socket.io-redis';
import redisConfig from 'config/redis';

import channelHooks from './hooks/channel';
import { userLeaveChannel } from 'db/users';
// import rtcConnectHooks from './hooks/rtc-connect';

const io = SocketIO();
io.adapter(redisAdapter(redisConfig));

const handleSocketConnect = socket => {
  console.log(`New client connected: ${socket.id}`);
}

const handleSocketDisconnect = socket => {
  console.log(`Client disconnected: ${socket.id}`);
  userLeaveChannel(socket.id);
}

io.of('/channels').on('connection', (socket) => {
  handleSocketConnect(socket);

  // rtcConnectHooks(io, socket);
  channelHooks(io, socket);

  socket.on("disconnect", () => handleSocketDisconnect(socket));
});

export default io;
