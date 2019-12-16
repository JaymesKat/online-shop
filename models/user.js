const mongoose = require('mongoose');
const Order = require('./order');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product'
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product){
  const cartProductIndex = this.cart.items.findIndex(item => {
    return item.productId.toString() == product._id.toString();
  });

  let newQuantity = 1;
  let updatedCartItems = this.cart ? [...this.cart.items] : [];

  if (cartProductIndex >= 0) {
    newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;

  return this.save();
}

userSchema.methods.removeFromCart = function(productId){
  const updatedCartItems = this.cart.items.filter(
    item => item.productId.toString() != productId.toString()
  );

  this.cart.items = updatedCartItems;

  return this.save();
}

userSchema.methods.clearCart = function(){
  this.cart = { items: []}
  return this.save()
}

module.exports = mongoose.model('User', userSchema);
