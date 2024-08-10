const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { chatController } = require('../controllers');
const jwtAuth = require('../middleware/authJwt');

router.put('/sendMessage', chatController.sendMessage);

router.get('/getMessagesForRoom', chatController.getMessagesForRoom);

router.get(
  '/getAllRoom',
  [jwtAuth.verifyToken, jwtAuth.isStaffAndAdmin],
  chatController.getRooms,
);

module.exports = router;
