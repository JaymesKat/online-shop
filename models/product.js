const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, id, cart) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.cart = cart;
  }

  save() {
    const db = getDb();

    if (this._id) {
      return db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this })
        .then(result => {
          console.log("Updated Product");
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      return db
        .collection("products")
        .insertOne(this)
        .then(result => {
          console.log("Created Product");
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then(products => {
        return products;
      })
      .catch(err => console.log(err));
  }

  static findById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then(product => {
        console.log(product);
        return product;
      })
      .catch(err => console.log(err));
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then(result => console.log("Deleted"))
      .catch(err => console.log(err));
  }
}

module.exports = Product;
