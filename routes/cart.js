const express = require('express');
const router = express.Router();
const { cartController } = require('../controllers');
const jwtAuth = require('../middleware/authJwt');

// Thêm một sản phẩm vào giỏ hàng
router.put('/', jwtAuth.verifyToken, cartController.addToCart);

// // Lấy thông tin giỏ hàng của người dùng
router.get('/', jwtAuth.verifyToken, cartController.getCart);

// // Cập nhật số lượng của một sản phẩm trong giỏ hàng
router.patch(
  '/:productId',
  jwtAuth.verifyToken,
  cartController.updateCartItemAndTotal,
);

// // Xóa một sản phẩm khỏi giỏ hàng
router.delete(
  '/:productId',
  jwtAuth.verifyToken,
  cartController.deleteCartItem,
);

// get total price of cart
router.get('/total', jwtAuth.verifyToken, cartController.getTotalCart);

module.exports = router;
