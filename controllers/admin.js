const { validationResult } = require('express-validator');
const cloudinary = require('../cloudinaryConfig');
const Product = require('../models/product');
const fileHelper = require('../util/file');

const ITEMS_PER_PAGE = 1;

exports.getAddProduct = (req, res, next) => {
  let product = { title: '', price: '', description: '', image: { url: '' } };
  res.render('admin/edit-product', {
    product: product,
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMessage: null,
    validationErrors: [],
    oldInput: { title: '', imageUrl: '', price: '', description: '' }
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      product: {
        title,
        price,
        description
      },
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage: 'Attached file is not an image',
      validationErrors: [],
      oldInput: { title, price, description }
    });
  }

  const product = new Product({
    title,
    price,
    image: {
      url: image.url,
      public_id: image.public_id
    },
    description,
    userId: req.user
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      product: product,
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: { title, image, description }
    });
  }

  product
    .save()
    .then(result => {
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('admin/edit-product', {
        product: product,
        pageTitle: 'Edit Product',
        path: '/admin/add-product',
        editing: true,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const image = req.file;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      product: {
        title,
        price,
        description,
        _id: prodIdDesigns
      },
      pageTitle: 'Edit Product',
      path: '/admin/add-product',
      editing: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        res.redirect('/');
      }
      product.title = title;
      product.price = price;
      product.description = description;
      if (image) {
        cloudinary.v2.uploader.destroy(product.image.public_id, function(
          error,
          result
        ) {
          if (error) {
            error.httpStatusCode = 500;
            next(error);
          }
          console.log('Image deleted '.result);
        });
        product.image = { url: image.url, public_id: image.public_id };
      }
      return product.save().then(() => res.redirect('/admin/products'));
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product Not Found'));
      }
      cloudinary.v2.uploader.destroy(product.image.public_id, function(
        error,
        result
      ) {
        if (error) {
          error.httpStatusCode = 500;
          next(error);
        }
        console.log('Image deleted '.result);
      });
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      res.status(200).json({ message: 'Success' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Failed to delete product' });
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find({ userId: req.user._id })
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;

      return Product.find({ userId: req.user._id })
        .populate('userId')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
