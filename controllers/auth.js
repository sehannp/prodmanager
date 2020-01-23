const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req,res,next) => {
    res.render('auth/login', {
      path:"/login", 
      pageTitle: 'Login',
      errorMessage: req.flash('error')[0]
    });
}

exports.getSignup = (req,res,next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: req.flash('error')[0]
  });
};


exports.postLogin = (req,res,next) => {  
  const {email, password}= req.body;
  User.findOne({email})
  .then( user => {
    if(!user){
      req.flash('error','invalid email or password')
      return res.redirect('/login');
    }
    return bcrypt.compare(password,user.password)
    .then(doMatch => {
      if(doMatch){
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save( (err) => {
          console.log(err);
          res.redirect('/');
        });
      }
      req.flash('error','invalid email or password')
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
      res.redirect('/login');
    })

  })
  .catch((err) => console.log(err));  
};

exports.postLogout = (req,res,next) => {
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
      req.flash('error','email exists already')
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
