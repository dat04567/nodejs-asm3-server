const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ActiveUserSchema = new Schema(
  {
    email: {
      type: Schema.Types.Mixed,
      default: null,
    },
    loginId: {
      type: String,
      required: true,
    },
    currentChat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
  },
  {
    timestamps: true,
    virtuals: {
      emailOrLoginId: {
        get() {
          return this.email || this.loginId;
        },
      },
      optimizedVersion: {
        get() {
          return {
            id: this._id.toString(),
            email: this.email || null,
            loginId: this.loginId,
            emailOrLoginId: this.emailOrLoginId,
            socketConnections: [],
            socketIds: [],
            currentChatId: this.currentChat?._id?.toString() || null,
            chatIds: [],
          };
        },
      },
    },
  },
);

module.exports = mongoose.model('ActiveUser', ActiveUserSchema);
