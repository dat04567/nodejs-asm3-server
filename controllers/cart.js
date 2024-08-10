const mongoose = require('mongoose');
const Cart = require('../models/cart');

const uid = mongoose.Types.ObjectId;

exports.addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;
  try {
    // check if the product is already in the cart
    const updateResult = await Cart.updateOne(
      { userId, 'items.product': productId },
      {
        $inc: { 'items.$.quantity': quantity },
      },
    );

    if (updateResult.matchedCount === 0) {
      await Cart.updateOne(
        { userId },
        {
          $push: { items: { product: productId, quantity } },
        },
        { upsert: true },
      );
    }

    res
      .status(201)
      .json({ message: 'Product was added to cart successfully!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.cacluateCart = async (userId) => {
  const result = await Cart.aggregate()
    .match({ userId: uid.createFromHexString(userId) })
    .unwind('items')
    .lookup({
      from: 'products',
      localField: 'items.product',
      foreignField: '_id',
      as: 'productInfo',
    })
    .unwind('productInfo')
    .project({
      userId: 1,
      totalItemPrice: {
        $multiply: ['$items.quantity', { $toDouble: '$productInfo.price' }],
      },
    })
    .group({
      _id: '$userId',
      total: { $sum: '$totalItemPrice' },
    });

  return result[0]?.total ? result[0].total : 0;
};

exports.updateCartItemAndTotal = async (req, res, next) => {
  const productId = req.params.productId;
  const quantity = req.body.quantity;
  const userId = req.userId;

  try {
    // Kiểm tra số lượng mới
    if (quantity <= 0) {
      throw new Error('Quantity cannot be negative');
    }

    let updatedCart;
    if (quantity === 0) {
      // in the future, we can add a delete method
    } else {
      updatedCart = await Cart.findOneAndUpdate(
        { userId: userId, 'items.product': productId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true },
      );

      if (!updatedCart) {
        const error = new Error('Product not found in cart');
        error.statusCode = 404;
        throw error;
      }
    }

    const carts = await getCartDetails(userId);
    const total = await this.cacluateCart(userId);

    res.status(200).json({ total, carts });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getTotalCart = async (req, res, next) => {
  const userId = req.userId;
  try {
    const total = await this.cacluateCart(userId);

    res.status(200).json({ total });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

async function getCartDetails(userId) {
  const cart = await Cart.findOne({ userId: userId }).populate('items.product');

  // Biến đổi dữ liệu: đưa thông tin sản phẩm ra ngoài
  return (
    cart?.items.map((item) => {
      return {
        idProduct: item.product._id,
        nameProduct: item.product.name,
        priceProduct: item.product.price,
        count: item.quantity,
        img: item.product.img1,
      };
    }) || []
  );
}

const deleteCart = async (userId, productId) => {
  const updateCart = await Cart.updateOne(
    { userId: userId },
    { $pull: { items: { product: productId } } },
  );
  if (!updateCart === 0) {
    const error = new Error('Product not found in cart');
    error.statusCode = 404;
    throw error;
  }
};
exports.deleteCartItem = async (req, res, next) => {
  try {
    const userId = req.userId;
    const productId = req.params.productId;
    await deleteCart(userId, productId);

    const total = await this.cacluateCart(userId);
    const carts = await getCartDetails(userId);
    res.status(200).json({ total, carts });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  const userId = req.userId;

  try {
    const tempProduct = await getCartDetails(userId);
    const total = await this.cacluateCart(userId);
    res.status(200).json({ carts: tempProduct, total });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
