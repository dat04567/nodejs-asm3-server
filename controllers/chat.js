const Message = require('../models/message');
const Chat = require('../models/chat');
const messageHandler = require('../handlers/messageHandler');

exports.sendMessage = async (req, res, next) => {
  const roomId = req.body.roomId;
  const message = req.body.message;
  const sender = req.body.sender;
  const receiver = req.body.receiver;

  try {
    let result;
    if (roomId) {
      if (message === '/end') {
        const chat = await Chat.findById(roomId);
        chat.isActive = false;
        await chat.save();
        result = {
          isEnd: true,
          roomId: roomId,
        };
        const rooms = await getRoomIds();
        messageHandler.sendRoom(req, {
          data: rooms,
          roomId: chat._id,
        });
      } else {
        await Message.create({
          roomId: roomId,
          message: message,
          sender: sender,
          receiver: receiver,
        });
        const data = await getMessageForRoom(roomId);
        result = {
          data,
          roomId: roomId,
        };
      }
    } else {
      const chat = new Chat();
      await Message.create({
        roomId: chat._id,
        message: message,
        sender: sender,
        receiver: receiver,
      });
      await chat.save();
      const data = await getMessageForRoom(chat._id.toString());
      const rooms = await getRoomIds();
      messageHandler.sendRoom(req, {
        data: rooms,
        roomId: chat._id,
      });
      result = {
        data,
        roomId: chat._id,
      };
    }
    messageHandler.sendMessage(req, result);

    res.status(200).json({ roomId: result.roomId });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const getMessageForRoom = async (roomId) => {
  const message = await Message.getRoomId(roomId);

  if (!message) {
    const error = new Error('Not found room id');
    error.statusCode = 404;
    throw error;
  }

  return message;
};

exports.getMessagesForRoom = async (req, res, next) => {
  const roomId = req.query.roomId;

  try {
    const messages = await getMessageForRoom(roomId);
    res.status(200).json(messages);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const getRoomIds = async (getRoomIds) => {
  const rooms = await Chat.find({ isActive: true }).select('_id');
  return rooms;
};

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await getRoomIds();
    res.status(200).json(rooms);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
