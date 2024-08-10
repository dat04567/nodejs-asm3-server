const { validationResult } = require('express-validator');
const Product = require('../models/product');

const multer = require('multer');
const Order = require('../models/order');
const path = require('path');
const fs = require('fs');

const fetchProducts = async (currentPage, perPage, category) => {
  const products = await Product.find(category ? { category: category } : {})
    .skip((currentPage - 1) * perPage)
    .limit(perPage);
  return products;
};

exports.getAllProducts = async (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const category =
    req.query.category === 'all' || !req.query.category
      ? null
      : req.query.category;
  const perPage = req.query.perPage || 4;

  try {
    const products = await fetchProducts(currentPage, perPage, category);
    const totalItems = await Product.countDocuments();
    res
      .status(200)
      .json({ totalPage: Math.ceil(totalItems / perPage), products });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter }).array(
  'images',
  5,
);

exports.upload = (req, res, next) => {
  console.log(req.body);

  upload(req, res, (err) => {
    if (err) {
      err.statusCode = 422;
      err.message = { image: err.message };
      next(err);
    }

    if (!req.files || req.files.length === 0) {
      const err = new Error();
      err.statusCode = 422;
      err.message = { image: 'File upload failed.' };
      next(err);
    }
    // convert to { img1: 'path', img2: 'path' }
    const photosArray = req.files
      .map((file, index) => ({ [`img${index + 1}`]: file.path }))
      .reduce((acc, photo) => {
        return { ...acc, ...photo };
      }, {});
    req.body.photos = photosArray;

    next();
  });
};
exports.addProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    const messages = errors
      .array()
      .map((error) => error.msg)
      .reduce((acc, msg) => ({ ...acc, ...msg }), {});

    error.message = messages;
    return next(error);
  }

  const name = req.body.nameProduct;
  const category = req.body.category;
  const short_desc = req.body.shortDescription;
  const long_desc = req.body.longDescription;
  const price = +req.body.price;

  try {
    await Product.create({
      name,
      category,
      long_desc,
      short_desc,
      price,
      ...req.body.photos,
    });

    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const name = req.body.nameProduct;
  const category = req.body.category;
  const short_desc = req.body.shortDescription;
  const long_desc = req.body.longDescription;
  const price = +req.body.price;

  try {
    const updateProduct = await Product.updateOne(
      { _id: productId },
      {
        name,
        category,
        long_desc,
        short_desc,
        price,
      },
    );
    if (updateProduct.matchedCount === 0) {
      const error = new Error('Could not find product.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    // Kiểm tra xem sản phẩm có tồn tại trong bất kỳ đơn hàng nào không
    const ordersWithProduct = await Order.find({ 'items.product': productId });

    if (ordersWithProduct.length > 0) {
      const error = new Error(
        'Cannot delete product. Product exists in one or more orders.',
      );
      error.statusCode = 400;
      throw error;
    }

    // // Xóa sản phẩm từ bộ sưu tập products
    const productDelete = await Product.findByIdAndDelete(productId);

    const photos = [
      productDelete.img1,
      productDelete.img2,
      productDelete.img3,
      productDelete.img4,
      productDelete.img5,
    ];
    photos.forEach((photo) => photo && clearImage(photo));

    this.getAllProducts(req, res, next);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;

    const messages = errors.errors.map((error) => error.msg);
    error.message = messages;
    return next(error);
  }

  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Could not find product.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(product);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getTotalPage = async (req, res, next) => {
  const perPage = +req.query.perPage || 4;
  try {
    const totalItems = await Product.countDocuments();

    res.status(200).json({ totalPage: Math.ceil(totalItems / perPage) });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPanigation = async (req, res, next) => {
  try {
    const products = await Product.find(category ? { category } : {})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json(products);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
