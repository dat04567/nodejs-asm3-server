const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'I am new!',
  },
  role: {
    type: String,
    default: 'user',
    required: true,
    enum: ['user', 'admin', 'staff'],
  },
});

module.exports = mongoose.model('User', userSchema);
