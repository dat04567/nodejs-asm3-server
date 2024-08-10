const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'message',
    },
  },
  {
    timestamps: true,
  },
);

MessageSchema.statics.getRoomId = async function (roomId) {
  return this.aggregate([
    { $match: { roomId: mongoose.Types.ObjectId.createFromHexString(roomId) } },
    {
      $lookup: {
        from: 'chats',
        localField: 'roomId',
        foreignField: '_id',
        as: 'roomInfo',
      },
    },
    { $unwind: '$roomInfo' },
    { $match: { 'roomInfo.isActive': true } },
    {
      $project: {
        _id: 1,
        message: 1,
        sender: 1,
        receiver: 1,
      },
    },
    { $sort: { createdAt: 1 } },
  ]);
};

module.exports = mongoose.model('Message', MessageSchema);
