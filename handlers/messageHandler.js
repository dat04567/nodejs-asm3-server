exports.sendMessage = async (req, data) => {
  const io = req.app.get('socketio');

  io.sockets.in(data.roomId.toString()).emit('newMessage', {
    messages: data,
  });
};

exports.sendRoom = (req, { data }) => {
  const io = req.app.get('socketio');

  io.sockets.in('admin').emit('newRoom', {
    rooms: data,
  });
};
