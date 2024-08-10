const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');

// const isAuth = require('../middleware/authJwt');
const { authController } = require('../controllers');
const jwtAuth = require('../middleware/authJwt');

const router = express.Router();

router.put(
  '/signup',
  [
    body('phoneNumber')
      .isLength({ min: 10 })
      .withMessage('Phone number must be at least 10 characters')
      .matches(/^[0-9]+$/)
      .withMessage('Phone number must contain only numbers'),
    body('fullName')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Full name must not be empty'),
    body('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Password must be at least 5 characters'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      }),
  ],
  authController.signup,
);

router.post(
  '/refreshtoken',
  [
    body('refreshToken')
      .not()
      .isEmpty()
      .withMessage('Refresh token is not empty'),
  ],
  authController.refreshToken,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email.'),
    body('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Password must be at least 5 characters'),
  ],
  authController.login,
);

router.post('/logout', jwtAuth.verifyToken, authController.logout);

module.exports = router;
