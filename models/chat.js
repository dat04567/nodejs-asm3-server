const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Chat', ChatSchema);
