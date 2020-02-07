const path = require('path');
const { body } = require('express-validator');
const express = require('express');

const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  '/add-product',
  isAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 3, max: 200 })
      .trim()
  ],
  adminController.postAddProduct
);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post(
  '/edit-product',
  isAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('description')
      .isLength({ min: 3, max: 200 })
      .trim()
  ],
  adminController.postEditProduct
);

// // /admin/delete-product => POST
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
