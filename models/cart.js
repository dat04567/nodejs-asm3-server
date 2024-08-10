const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Định nghĩa schema cho giỏ hàng
const cartSchema = new mongoose.Schema({
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Giá trị này đặt TTL là 3600 giây (1 giờ)
  },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
