import SocketIO from 'socket.io';
import rtc_connect from 'socket-hooks/rtc-connect';

const io = SocketIO();

let activeSockets = [];

const handleSocketConnect = socket => {
  console.log(`New client connected: ${socket.id}`);
  const newUser = {
    id: socket.id,
    role: activeSockets.length == 0 ? 'seeder' : 'viewer',
  }

  activeSockets.push(newUser);
  socket.emit("update-user-list", { users: activeSockets  });
  socket.broadcast.emit("update-user-list", { users: [newUser] })

}

const handleSocketDisconnect = socket => {
  console.log("Client disconnected");
  activeSockets = activeSockets.filter(e => e.id !== socket.id);
  socket.broadcast.emit("remove-user", { socketId: socket.id });
}

io.on('connection', (socket) => {
  handleSocketConnect(socket);

  rtc_connect.use(socket);

  socket.on("disconnect", () => handleSocketDisconnect(socket));
});

export default io;
