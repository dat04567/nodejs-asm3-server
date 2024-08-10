const express = require('express');
const { body } = require('express-validator');
const { orderController } = require('../controllers');
const jwtAuth = require('../middleware/authJwt');

const router = express.Router();

router.put(
  '/',
  jwtAuth.verifyToken,
  [
    body('name').isString().withMessage('Name must be a string'),
    body('address').isString().withMessage('Address must be a string'),
    body('phone').isMobilePhone().withMessage('Phone must be a phone number'),
    body('email').isEmail().withMessage('Email must be a valid email'),
  ],
  orderController.addToOrder,
);

router.get('/', jwtAuth.verifyToken, orderController.getOrders);

router.get('/:orderId', jwtAuth.verifyToken, orderController.getDetailOrder);

module.exports = router;
