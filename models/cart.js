const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

module.exports = class Cart{
    static addProduct(id, price){
        // Fetch previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0}
            if(!err){
                cart = JSON.parse(fileContent);
            }
            // Analyze the cart
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            
            let updatedProduct;

            // Add new product/ increase quantity
            if(existingProduct){
                updatedProduct = {...existingProduct}
                updatedProduct.qty += 1;
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1}
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice += +price;
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            })
        });
    }

    static deleteProduct(id, productPrice){
        fs.readFile(p, (err, fileContent) => {
            if(err){
                throw err;
            }
            const cartItems = JSON.parse(fileContent);
            let updatedCart = {...cartItems};
            const product = updatedCart.products.find(prod => prod.id === id);
            if(!product){
                return;
            }
            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
            updatedCart.totalPrice -= productQty * productPrice;

            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                if(err) console.log(err);
            })
        });
    }

    static getCart(cb){
        fs.readFile(p, (err, fileContent) => {
            if(!err){
                const cart = JSON.parse(fileContent);
                cb(cart);
            } else {
                cb(null);
            }
        })
    }
}
