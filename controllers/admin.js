const {validationResult} = require('express-validator/check');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product',{
    pageTitle: 'Add Product', 
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  })  
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode){
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  //req.user.getProducts({where:{id: prodId}})  
  Product.findById(prodId)
  .then(product => {
    if(!product){
      return res.redirect('/');
    }
    res.render('admin/edit-product',{
      pageTitle: 'Edit Product', 
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  })
  .catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const {body: {title, imageUrl, price, description}} = req;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product',{
      pageTitle: 'Add Product', 
      path: '/admin/edit-product',
      editing: false,
      product: {title, imageUrl, price, description},
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  
  const product = new Product({title,price,description,imageUrl, userId: req.user._id});
    product.save()
    .then(result => {
      console.log("Record created");
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req,res,next) => {
  const {productId, title, imageUrl, price, description} = req.body;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    // console.log(errors.array());
    return res.status(422).render('admin/edit-product',{
      pageTitle: 'Edit Product', 
      path: '/admin/edit-product',
      editing: true,
      product: {_id:productId,title, imageUrl, price, description},
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  Product.findById(productId)
  .then(product => {
    if(product.userId.toString() !== req.user._id.toString()){
      return res.redirect('/');
    }
    product.title = title;
    product.imageUrl = imageUrl;
    product.price = price;
    product.description = description;

    return product.save()
    .then(result => { 
      console.log("updated");
      res.redirect('/admin/products');
    })
  })
  //const product = new Product(title,price,description,imageUrl,productId)
  .catch(err => console.log(err));
  
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
  .populate('userId')
  .then(products => {
    res.render('admin/products', {
      prods: products, 
      path:"/admin/products", 
      pageTitle: 'Admin Products'
    }) 
  })
  .catch(err => console.log(err));
};

exports.postDeleteProduct = (req,res,next) => {
  const productId = req.body.productId;

  // Product.findByIdAndDelete(productId)
  Product.deleteOne({_id:productId, userId: req.user._id})
  .then(() => {
    console.log("deleted product");
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
};
