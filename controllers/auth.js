const bcrypt = require('bcryptjs')
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error')[0],
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: req.flash('error')[0],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then(user => {
      if(!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if(doMatch){
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              if(err) console.log(err)
              res.redirect('/');
            })
          }
          req.flash('error', 'Invalid email or password');
          return res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login')
        })
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  User.findOne({ email: email }).then(user => {
    if(user){

      req.flash('error', 'Email already signed up');
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12)
    .then(hashedPass => {
      const newUser = new User({
        email,
        password: hashedPass,
        cart: {items: []}
      });
      return newUser.save().then(result => res.redirect('/'));
    });
    
  }).catch(err => console.log(err))
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if(err) console.log(err);
    res.redirect('/')
  });
};
