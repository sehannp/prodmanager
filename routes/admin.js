const path = require('path');
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-Auth');

router.get('/add-product',isAuth, adminController.getAddProduct);
router.get('/products',isAuth, adminController.getProducts);

router.post('/add-product',isAuth,  adminController.postAddProduct);
router.post('/edit-product',isAuth, adminController.postEditProduct);
router.get('/edit-product/:productId',isAuth,  adminController.getEditProduct);
router.post('/delete-product',isAuth, adminController.postDeleteProduct);
module.exports = router;

