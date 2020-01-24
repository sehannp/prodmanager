const path = require('path');
const express = require('express');
const router = express.Router();
const {body} = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-Auth');

router.get('/add-product',isAuth, adminController.getAddProduct);
router.get('/products',isAuth, adminController.getProducts);

router.post('/add-product',[
    body('title').isString().isLength({min:3}).trim(),
    body('imageUrl').trim().isURL(),
    body('price').isFloat(),
    body('description').trim().isLength({min:8, max:400})
],isAuth,  adminController.postAddProduct);
router.post('/edit-product',[
    body('title').isString().isLength({min:3}).trim(),
    body('imageUrl').trim().isURL(),
    body('price').isFloat(),
    body('description').trim().isLength({min:8, max:400})
],isAuth, adminController.postEditProduct);
router.get('/edit-product/:productId',isAuth,  adminController.getEditProduct);
router.post('/delete-product',isAuth, adminController.postDeleteProduct);
module.exports = router;

