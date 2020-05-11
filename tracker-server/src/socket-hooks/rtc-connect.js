const handleMakeCall = (socket, { offer, to }) => {
  socket.to(to).emit("call-made", { offer, from: socket.id });
}

const handleMakeAnswer = (socket, { answer, to }) => {
  socket.to(to).emit("answer-made", { answer, from: socket.id });
}

const handleSendICECandidate = (socket, { candidate, to }) => {
  socket.to(to).emit("add-ice-candidate", { candidate, from: to });
}

const handleRequestVideo = (socket, { to }) => {
  socket.to(to).emit("seed-video", { to: socket.id });
}

const handleSendSignal = (socket, { from, to, signal }) => {
  console.log("send-signal", { from, to, signal });
  socket.to(to).emit("receive-signal", { from, to, signal });
}

export default {
  use: (socket) => {
    socket.on("make-call", (data) =>
      handleMakeCall(socket, data)
    );

    socket.on("make-answer", (data) =>
      handleMakeAnswer(socket, data)
    );

    socket.on("send-ice-candidate", (data) =>
      handleSendICECandidate(socket, data)
    );

    socket.on("request-video", (data) =>
      handleRequestVideo(socket, data)
    );

    socket.on("send-signal", (data) =>
      handleSendSignal(socket, data)
    );
  }
}
