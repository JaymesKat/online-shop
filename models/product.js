const fs = require('fs');
const path = require('path');
const Cart = require('./cart');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
    getProductsFromFile(products => {
      if(this.id){
        const existingProductIndex = products.findIndex((prod) => prod.id === this.id);
        let updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        products.push(this);
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err);
        });
      }
      
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb){
    getProductsFromFile(products => {
      const product = products.find(product => product.id === id);
      cb(product);
    });
  }

  static deleteById(id, cb){
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id);
      const updatedProducts = products.filter(product => product.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
        if (!err){
          Cart.deleteProduct(product.id, product.price);
          cb();
        }
      });
    });
  }
};
