const rtcConnectHooks = (io) => (socket) => {
  socket.on("make-call", (data) =>
    io.to(to).emit("call-made", { offer, from: socket.id })
  );

  socket.on("make-answer", (data) =>
    io.to(to).emit("answer-made", { answer, from: socket.id })
  );

  socket.on("send-ice-candidate", (data) =>
    socket.to(to).emit("add-ice-candidate", { candidate, from: to })
  );

  socket.on("request-video", (data) =>
    socket.to(to).emit("seed-video", { to: socket.id })
  );

  socket.on("send-signal", (data) =>
    socket.broadcast.emit("receive-signal", { from, to, signal })
  );
}

export default rtcConnectHooks;
