const express = require('express');
const router = express.Router();
const {check, body} = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');


router.get('/login', authController.getLogin);
router.post('/login',[
    check('email').isEmail().withMessage('Please Enter Valid Email')
    .custom((value,{req}) => {
        return User.findOne({email:value})
        .then(user => {
            if(!user){
                return Promise.reject('This user does not exist');
            }
            req.userval = user;
        })
    }).normalizeEmail(),
    body('password','Password should be atleast 5 chars and alphanumeric')
    .isLength({min: 5})
    .isAlphanumeric().trim()
    ],
    authController.postLogin);
router.get('/signup', authController.getSignup);
router.post('/signup', 
    [    
    check('email').isEmail().withMessage('Please Enter Valid Email') 
    .custom((value, {req}) => {
        return User.findOne({email: value})
        .then(user => {
          if(user){
            return Promise.reject('Email exists already.');
          }
        })
    }).normalizeEmail(),
    body('password','Password should be atleast 5 chars and alphanumeric')
        .isLength({min: 5})
        .isAlphanumeric().trim(),
    body('confirmPassword').custom((value,{req}) => {
        if (value !== req.body.password){
            throw new Error('Passwords have to match');
        }
        return true;
    }).trim()
    ]
    ,authController.postSignup);
router.post('/logout',authController.postLogout);
router.get('/reset',authController.getReset);
router.post('/reset',authController.postReset);
router.get('/reset/:token',authController.getNewPassword);
router.post('/new-password',authController.postNewPassword);

module.exports = router;