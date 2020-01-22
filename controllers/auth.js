const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req,res,next) => {
  // console.log(req.session.isLoggedIn);
    res.render('auth/login', {
      path:"/login", 
      pageTitle: 'Login',
      isAuthenticated: false
    });
}

exports.getSignup = (req,res,next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};


exports.postLogin = (req,res,next) => {  
  User.findById("5e2283d3b7906f42948825e6")
  .then( user => {
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save( (err) => {
      console.log(err);
      res.redirect('/');
    })
  })
  .catch((err) => console.log(err));  
};

exports.getLogout = (req,res,next) => {
  req.session.destroy( (err)=> {
    console.log(err);
    res.redirect('/');
  });
};

exports.postSignup = (req,res,next) => {
  const {email, password, confirmPassword} = req.body;
  //validations to be performed
  User.findOne({email})
  .then(userDoc => {
    if(userDoc){
      return res.redirect('/signup');
    }
    return bcrypt.hash(password,12)
      .then(hashedPassword => {
        const user = new User({email, password: hashedPassword, cart: {items : []}});
        return user.save();
      })
      .then( result => {
        res.redirect('/login');
      })
  })
  .catch(err => console.log(err));
};
