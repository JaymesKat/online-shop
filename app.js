const dotenv = require('dotenv');
dotenv.config();

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
let session = require('express-session');
const csrf = require('csurf')
const flash = require('connect-flash');
const MongoDBStore = require('connect-mongodb-session')(session);

const User = require('./models/user');
const errorController = require("./controllers/error");

const MONGO_DB_URL = process.env.MONGO_DB_URL;

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const csrfProtection = csrf();

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
}));

app.use(csrfProtection);
app.use(flash());

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

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MONGO_DB_URL)
.then(() => {
    app.listen(3000);
}).catch(err => console.log(err));
