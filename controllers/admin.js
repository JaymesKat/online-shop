
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  let product = { title: '', price: '', description: '', imageUrl: ''}
    res.render('admin/edit-product', {
      product: product,
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    
    req.user.createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description
    })
    .then(() => res.redirect('/'))
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId).then(product => {
      res.render('admin/edit-product', {
      product: product,
      pageTitle: 'Edit Product',
      path: '/admin/add-product',
      editing: true
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;

  Product.findByPk(prodId).then(product => {
    product.title = title;
    product.price = price;
    product.imageUrl = imageUrl;
    product.description = description;
    return product.save();
  }).then(() => res.redirect('/admin/products')).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId).then(product => {
    return product.destroy();
  }).then(() => res.redirect("/admin/products"))
  .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
    });
  }).catch(err => console.log(err));
}
