const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);

const User = require('./models/user');
const errorController = require("./controllers/error");

const MONGO_DB_URL = 'mongodb://root:cRpZUMjEnWKC0dcB@cluster0-shard-00-00-aylow.mongodb.net:27017,cluster0-shard-00-01-aylow.mongodb.net:27017,cluster0-shard-00-02-aylow.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: 'randomstring',
  resave: false,
  saveUninitialized: false,
  store: new MongoDBStore({ uri: MONGO_DB_URL, collection: 'sessions' })
}))

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MONGO_DB_URL)
.then(() => {
    app.listen(3000);
}).catch(err => console.log(err));
