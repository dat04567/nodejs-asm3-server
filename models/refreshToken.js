const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RefreshTokenSchema = new mongoose.Schema(
  {
    token: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: process.env.JWT_REFRESH_EXPIRATION, // 1d
    },
  },
  {
    autoIndex: true,
  },
);

RefreshTokenSchema.statics.createToken = async function (user) {
  const _token = uuidv4();

  const _object = new this({
    token: _token,
    user: user._id,
  });

  let refreshToken = await _object.save();

  return refreshToken.token;
};

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = RefreshToken;
