const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
  199;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      err.statusCode = 401;
      return next(err);
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (user.role !== 'admin') {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    return next(error);
  }

  next();
};

const isStaffAndAdmin = async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (user.role !== 'admin' && user.role !== 'staff') {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    return next(error);
  }

  next();
};
const jwtAuth = {
  verifyToken,
  isAdmin,
  isStaffAndAdmin,
};

module.exports = jwtAuth;
