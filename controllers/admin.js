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
    const product = new Product(null, title, imageUrl, price, description);
    product.save();
    res.redirect('/admin/products');
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId, (product) => {
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

  const product = new Product(prodId, title, imageUrl, price, description);
  product.save();
  res.redirect('/admin/products');
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId, () => res.redirect("/admin/products"));
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products',
        });
    });
}
