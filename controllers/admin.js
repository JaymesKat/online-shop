const mongoose = require('mongoose');
const Product = require("../models/product");
const { validationResult } = require('express-validator')

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
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
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
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;


  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
        product: {
          title,
          price,
          imageUrl,
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
      product.imageUrl = imageUrl;
      return product.save()
        .then(() =>
          res.redirect("/admin/products")
        );
    })
    
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id: prodId, userId: req.user._id}).then(() => res.redirect("/admin/products"));
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
    .catch(err => console.log(err));
};
