const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
    });
  }).catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId).then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    })
  });
};

exports.getIndex = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  }).catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      cart.getProducts()
      .then(cartProducts => {
        console.log(cartProducts);
        res.render('shop/cart',{
          path: '/cart',
          pageTitle: 'Your Cart',
          products: cartProducts
        }); 
      })
    })  
    .catch(err => console.log(err));
};

exports.addToCart = (req, res, next) => {
  const prodId = req.body.productId;
  let userCart;
  let newQuantity = 1;

  req.user.getCart()
    .then(cart => {
      userCart = cart;
      return cart.getProducts({where: {id: prodId}});
    })
    .then(products => {
      let product;
      if(products.length > 0) {
        product = products[0];
      }
      if(product){
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }

      return Product.findByPk(prodId);
    })
    .then(product => {
      console.log(product);
      return userCart.addProduct(product, { through: { quantity: newQuantity } });
    })
    .then(() => res.redirect('/cart'))
    .catch(err => console.log(err))
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ['products']})
    .then(orders => {
      console.log(orders[0].products[0]);
      res.render('shop/orders',{
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      })
    })
    .catch(err => console.log(err))
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart()
  .then(cart => {
    return cart.getProducts({ where: { id: prodId }});
  })
  .then(products => {
    const product = products[0];
    return product.cartItem.destroy();
  })
  .then(() => res.redirect('/cart'))
  .catch(err => console.log())
}

exports.postOrder = (req, res, next) => {
  let userCart;
  req.user.getCart()
    .then(cart => {
      userCart = cart;
      return cart.getProducts()
        .then(products => {
          return req.user.createOrder()
            .then(order => {
              return order.addProducts(
                products.map(product => {
                  console.log(product.cartItem.quantity);
                  product.orderItem = { quantity: product.cartItem.quantity };
                  return product;
                }
              ))
            })
        })
    })
    .then(result => userCart.setProducts(null))
    .then(result => res.redirect('/orders'))
    .catch(err => console.log(err))
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout',{
    path: '/checkout',
    pageTitle: 'Checkout'
  })
};
