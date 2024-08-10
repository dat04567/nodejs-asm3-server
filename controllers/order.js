const { validationResult } = require('express-validator');
const Cart = require('../models/cart');
const Order = require('../models/order');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const hbs = require('nodemailer-express-handlebars');
const { log } = require('../util');
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAILZOHO,
    pass: process.env.PASSWORDZOHO,
  },
});

const hbsOptions = {
  viewEngine: {
    partialsDir: 'templates',
    layoutsDir: 'templates',
    defaultLayout: 'index',
  },

  viewPath: 'templates',
};

transporter.use('compile', hbs(hbsOptions));

function calculateTotalAmount(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

exports.addToOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    const messages = errors.array().map((error) => error.msg);
    error.message = messages.join('\n');
    return next(error);
  }
  const customerInfo = req.body;

  const userId = req.userId;

  try {
    const cart = await Cart.findOne({ userId: userId }).populate({
      path: 'items.product',
      select: 'price _id img1 name',
    });

    // Kiểm tra xem giỏ hàng có tồn tại không

    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }
    const cartObject = cart.toObject();

    cartObject.items = cartObject.items.map((item) => {
      return {
        product: item.product._id, // Giữ lại ID của sản phẩm
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    // caluate total amount and create order
    const total = calculateTotalAmount(cartObject.items);
    const order = new Order({
      items: cartObject.items,
      totalAmount: total,
      user: userId,
      customerInfo: customerInfo,
    });

    await order.save();
    await Cart.findByIdAndDelete(cart._id);

    // send email to customer
    const itemContext = cart.toObject().items.map((item) => ({
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      img1: item.product.img1,
      totalProduct: item.product.price * item.quantity,
    }));

    const context = {
      items: itemContext,
      totalAmount: total,
      name: customerInfo.name,
      phone: customerInfo.phone,
      address: customerInfo.address,
    };

    const attachmentsImage = context.items.map((item, index) => ({
      filename: `image${index}.png`,
      path: item.img1,
      cid: `image${index}`,
    }));

    const mailOptions = {
      to: customerInfo.email,
      from: 'phone_ecomerce@zohomail.com',
      subject: 'New Order',
      template: 'welcomeMessage',
      context,
      attachments: attachmentsImage,
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        log.info('server', 'Send email successfully');
      }
    });

    res.status(201).json({ message: 'Order was added successfully!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  const userId = req.userId;
  try {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    if (!orders) {
      const error = new Error('Orders not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(orders);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDetailOrder = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findById(orderId).populate({
      path: 'items.product',
      select: 'name img1',
    });
    if (!order) {
      const error = new Error('Order detail not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(order);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
