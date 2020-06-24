import { SEND_SIGNAL, RECEIVE_SIGNAL } from 'socket/messages';

const rtcConnectHooks = (io, socket) => {
  socket.on(SEND_SIGNAL, (data) => {
    try {
      const { from, to, signal } = data;
      io.of('/channels').to(to).emit(RECEIVE_SIGNAL, { from, to, signal });
    } catch (error) {
      console.log(error);
    }
  });
}

export default rtcConnectHooks;
