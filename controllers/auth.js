const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { RefreshToken } = require('../models');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    const messages = errors.array().map((error) => error.msg);
    error.message = messages.join('\n');
    return next(error);
  }
  const email = req.body.email;
  const fullName = req.body.fullName;
  const password = req.body.password;
  const phoneNumber = req.body.phoneNumber;

  try {
    const user = new User({
      email,
      password: bcrypt.hashSync(password, 12),
      fullName: fullName,
      phoneNumber: phoneNumber,
    });

    await user.save();
    res.status(201).json({ message: 'User was registered successfully!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const adminPage = req.body.page;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error('User Not found.');
      error.statusCode = 404;
      throw error;
    }
    // // check valid password
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      const error = new Error('Invalid Password');
      error.statusCode = 401;
      throw error;
    }

    // check if have field adminPage then check role
    if (adminPage === 'admin' && user.role != 'admin' && user.role != 'staff') {
      const error = new Error('You are not admin or staff');
      error.statusCode = 403;
      throw error;
    }
    const expires = process.env.JWT_EXPIRATION;

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: expires,
    });

    const refreshToken = await RefreshToken.createToken(user);

    res.status(200).json({
      username: user.fullName,
      accessToken: accessToken,
      refreshToken: refreshToken,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  const { refreshToken: requestToken } = req.body;

  try {
    if (requestToken == null) {
      const error = new Error('Refresh Token is required!');
      error.statusCode = 403;
      throw error;
    }

    // // find refresh token in database
    const refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      const error = new Error('Refresh token is not in database!');
      error.statusCode = 403;
      error.data = {
        expired: true,
      };
      throw error;
    }

    const newAccessToken = jwt.sign(
      { id: refreshToken.user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRATION,
      },
    );

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  try {
    const token = await RefreshToken.findOne({ token: refreshToken });
    if (!token) {
      const error = new Error('Refresh token is not in database!');
      error.statusCode = 403;
      error.data = {
        expired: true,
      };
      throw error;
    }
    await RefreshToken.deleteOne({ token: refreshToken });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
