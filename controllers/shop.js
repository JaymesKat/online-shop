const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  }).catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
    });
  }).catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    })
  });
};


exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(cartItems => {
      res.render('shop/cart',{
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartItems
      }); 
    }).catch(err => console.log(err));
};

exports.addToCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(result => {
    res.redirect('/cart');
  });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders().then(orders => {
    res.render('shop/orders',{
      path: '/orders',
      orders: orders,
      pageTitle: 'Your Orders'
    })
  }).catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user.addOrder().then(result => {
    res.redirect('/orders')
  }).catch(err => console.log(err));
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteItemFromCart(prodId).then(
    result => res.redirect('/cart')
  ).catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout',{
    path: '/checkout',
    pageTitle: 'Checkout'
  })
};
