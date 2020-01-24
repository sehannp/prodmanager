const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SENDGRID_API_KEY = require('../util/email');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

const {validationResult} = require('express-validator/check');

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
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422).render(
      'auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg
      });
  }
  const fetchedPassword = req.userval.password
  bcrypt.compare(password,fetchedPassword)
    .then(doMatch => {
      if(doMatch){
        req.session.isLoggedIn = true;
        req.session.user = req.userval;
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
};

exports.postLogout = (req,res,next) => {
  req.session.destroy( (err)=> {
    console.log(err);
    res.redirect('/');
  });
};

exports.postSignup = (req,res,next) => {
  const {email, password} = req.body;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render(
      'auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errors.array()[0].msg
      });
  }
  bcrypt.hash(password,12)
  .then(hashedPassword => {
    const user = new User({email, password: hashedPassword, cart: {items : []}});
    return user.save();
  })
  .then( result => {
    res.redirect('/login');
    return sgMail.send({
      to: email,
      from: 'shop@nodecomplete.com',
      subject: 'Sign up succeeded',
      text: 'You successfully signed up',
      html: '<h1>You successfully signed up</h1>'
    })
  })
  .catch(err => console.log(err));
};

exports.getReset = (req,res,next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset',
    errorMessage: req.flash('error')[0]
  });
}

exports.postReset = (req,res,next) => {
  crypto.randomBytes(32, (err,buffer) => {
    if(err){
      console.log(err);
      return res.redirect('/');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user => {
      console.log(user);
      if(!user){
        req.flash('error','no account with that email');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save()
      .then(result => {
        res.redirect('/');
        sgMail.send({
          to: req.body.email,
          from: 'shop@nodecomplete.com',
          subject: 'Password reset',
          text:'You requested a password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this<a href="http://localhost:3000/reset/${token}">link</a> link to set new password</p>
            <p>Link expires in 1 hour</p>
          `
        })
      })
    })

    .catch(err => console.log(err));
  });
}

exports.getNewPassword = (req,res,next) => {
  User.findOne(
    {resetToken: req.params.token, 
    resetTokenExpiration: {$gt: Date.now()}
  })
  .then(user => {
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: req.flash('error')[0],
      userId: user._id.toString(),
      passwordToken: req.params.token
    });
  })
  .catch(err => console.log(err));
}

exports.postNewPassword = (req,res,next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({resetToken: passwordToken, 
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId
  })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => console.log(err));
}
