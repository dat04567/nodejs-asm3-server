const express = require('express');
const { body } = require('express-validator');
const { adminController } = require('../controllers');
const jwtAuth = require('../middleware/authJwt');

const router = express.Router();

router.get(
  '/orders',
  [jwtAuth.verifyToken, jwtAuth.isAdmin],
  adminController.getOrders,
);

module.exports = router;
