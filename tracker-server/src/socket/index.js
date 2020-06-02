import SocketIO from 'socket.io';

import { userLeaveChannel } from 'db/users';
import channelHooks from 'socket/hooks/channel';
import rtcConnectHooks from 'socket/hooks/rtc-connect';

const io = SocketIO();

const handleSocketConnect = socket => {
  console.log(`New client connected: ${socket.id}`);
}

const handleSocketDisconnect = socket => {
  console.log(`Client disconnected: ${socket.id}`);
  userLeaveChannel(socket.id);
}

io.of('/channels').on('connection', (socket) => {
  handleSocketConnect(socket);

  const disconnectHandlers = [];

  rtcConnectHooks(io, socket);
  channelHooks(io, socket, { disconnectHandlers });

  socket.on("disconnect", () => {
    for (const handler of disconnectHandlers) {
      if (handler instanceof Function) { handler(); }
    }
  });
});

export default io;
