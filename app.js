const dotenv = require('dotenv');
dotenv.config();

const multer  = require('multer')
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

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg'|| file.mimetype === 'image/jpeg'){
    cb(null, true);
  }
  else {
    cb(null, false);
  }
}

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'))
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
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next()
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res
    .status(500)
    .render("500", {
      pageTitle: "Something went wrong",
      path: "/500",
      isAuthenticated: req.session.isLoggedIn
    });
})

mongoose.connect(MONGO_DB_URL)
.then(() => {
    app.listen(3000);
}).catch(err => console.log(err));
