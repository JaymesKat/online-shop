const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Product = require("../models/product");
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  let product = { title: "", price: "", description: "", imageUrl: "" };
  res.render("admin/edit-product", {
    product: product,
    pageTitle: "Add Product",
    path: "/admin/add-product",
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

  if(!image){
    return res.status(422).render("admin/edit-product", {
      product: {
        title,
        price,
        description,
      },
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: 'Attached file is not an image',
      validationErrors: [],
      oldInput: { title, price, description }
    });
  }
  const imageUrl = image.path;
  const product = new Product({
    title,
    price,
    imageUrl,
    description,
    userId: req.user
  });

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      product: product,
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: { title, imageUrl, price, description }
    });
  } 
  
  product
    .save()
    .then(result => {
      console.log("Created Product");
      res.redirect("/admin/products");
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
      res.render("admin/edit-product", {
        product: product,
        pageTitle: "Edit Product",
        path: "/admin/add-product",
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
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
        product: {
          title,
          price,
          description,
          _id: prodIdDesigns
        },
        pageTitle: "Edit Product",
        path: "/admin/add-product",
        editing: true,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
    });
  } 

  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()){
        res.redirect('/');
      }
      product.title = title;
      product.price = price;
      product.description = description;
      if(image){
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save()
        .then(() =>
          res.redirect("/admin/products")
        );
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      if(!product){
        return next(new Error('Product Not Found'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({_id: prodId, userId: req.user._id})    
  })
  .then(() => res.redirect("/admin/products"))
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    .populate("userId")
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
  };
