const express = require('express');
const { body, param } = require('express-validator');
const { productController } = require('../controllers');
const jwtAuth = require('../middleware/authJwt');
const router = express.Router();

router.get('/pagination', productController.getPanigation);
router.get('/totalPage', productController.getTotalPage);
// uơdate and get product
router.get(
  '/:productId',
  [
    param('productId')
      .isMongoId()
      .withMessage({ productId: 'Invalid product id' }),
  ],
  productController.getProduct,
);
router.patch(
  '/:productId',
  [jwtAuth.verifyToken, jwtAuth.isAdmin],
  productController.updateProduct,
);
router.delete(
  '/:productId',
  [jwtAuth.verifyToken, jwtAuth.isAdmin],
  productController.deleteProduct,
);

router.get('/', productController.getAllProducts);
// add product
router.put(
  '/',
  [
    productController.upload,
    body('nameProduct')
      .trim()
      .isString()
      .isLength({ min: 5 })
      .withMessage({ name: 'Name must be at least 5 characters long' }),
    body('category')
      .trim()
      .isLength({ min: 5 })
      .withMessage({ category: 'Category must be at least 5 characters long' }),
    body('shortDescription').trim().isLength({ min: 5 }).withMessage({
      shortDescription: 'Short description must be at least 5 characters long',
    }),
    body('longDescription').trim().isLength({ min: 5 }).withMessage({
      longDescription: 'Long description must be at least 5 characters long',
    }),
    body('price').isNumeric().withMessage({ price: 'Price must be a number' }),
    jwtAuth.verifyToken,
    jwtAuth.isAdmin,
  ],
  productController.addProduct,
);

module.exports = router;
