const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const User = require('./models/user');
const errorController = require("./controllers/error");

// const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("5df3ee2ebc4bc77a2b7b8e8b")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb://root:cRpZUMjEnWKC0dcB@cluster0-shard-00-00-aylow.mongodb.net:27017,cluster0-shard-00-01-aylow.mongodb.net:27017,cluster0-shard-00-02-aylow.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority', {useNewUrlParser: true})
.then(result => {
    User.findOne().then(user => {
        if(!user){
            const user = new User({ name: 'James', email: 'james@example.com', cart: {items: []}});
            user.save();
        }
    });
    app.listen(3000);
}).catch(err => console.log(err));
