import SocketIO from 'socket.io';

const io = SocketIO();

let activeSockets = [];

const handleSocketConnect = socket => {
  console.log(`New client connected: ${socket.id}`);

  socket.emit("update-user-list", { users: activeSockets });
  socket.broadcast.emit("update-user-list", { users: [socket.id] })

  activeSockets.push(socket.id);
}

const handleSocketDisconnect = socket => {
  console.log("Client disconnected");
  activeSockets = activeSockets.filter(e => e !== socket.id);
  socket.broadcast.emit("remove-user", { socketId: socket.id });
}

const handleMakeCall = (socket, { offer, to }) => {
  socket.to(to).emit("call-made", { offer, from: socket.id });
}

const handleMakeAnswer = (socket, { answer, to }) => {
  socket.to(to).emit("answer-made", { answer, from: socket.id });
}

const handleSendICECandidate = (socket, { candidate, to }) => {
  socket.to(to).emit("add-ice-candidate", { candidate, from: to });
}

io.on('connection', (socket) => {
  handleSocketConnect(socket);

  socket.on("make-call", (data) =>
    handleMakeCall(socket, data)
  );

  socket.on("make-answer", (data) =>
    handleMakeAnswer(socket, data)
  );

  socket.on("send-ice-candidate", (data) =>
    handleSendICECandidate(socket, data)
  );

  socket.on("disconnect", () => handleSocketDisconnect(socket));
});

export default io;
