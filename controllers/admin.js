const {validationResult} = require('express-validator/check');
const Product = require('../models/product');
const fileHelper = require('../util/file');

const ITEMS_PER_PAGE = 1;

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
  .catch(err => {
    const error = new Error(err)
    error.httpStatus = 500;
    return next(error);
  });
};

exports.postAddProduct = (req, res, next) => {
  const {body: {title, price, description}} = req;
  const image = req.file;
  const errors = validationResult(req);

  if(!image){
    return res.status(422).render('admin/edit-product',{
      pageTitle: 'Add Product', 
      path: '/admin/add-product',
      editing: false,
      product: {title, price, description},
      hasError: true,
      errorMessage: 'Attached file is not an image',
      validationErrors: []
    });
  }

  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product',{
      pageTitle: 'Add Product', 
      path: '/admin/add-product',
      editing: false,
      product: {title, price, description},
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({title,price,description,imageUrl: image.path, userId: req.user._id});
    product.save()
    .then(result => {
      console.log("Record created");
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatus = 500;
      return next(error);
    });
};

exports.postEditProduct = (req,res,next) => {
  const {productId, title, price, description} = req.body;
  const image = req.file;
  const errors = validationResult(req);

 

  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product',{
      pageTitle: 'Edit Product', 
      path: '/admin/edit-product',
      editing: true,
      product: {_id:productId,title, price, description},
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
    //if no file is uploaded keep the old file itself
    if(image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.price = price;
    product.description = description;
    return product.save()
    .then(result => { 
      console.log("updated");
      res.redirect('/admin/products');
    })
  })
 .catch(err => {
    const error = new Error(err)
    error.httpStatus = 500;
    return next(error);
  });
  
};

exports.getProducts = (req, res, next) => {
  const page = req.query.page;
  let totalItems;

  Product.find({userId: req.user._id}).countDocuments()
  .then(numProds => {
    totalItems = numProds;
    return Product.find({userId: req.user._id})
    .skip((page-1)* ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .populate('userId')
  })
  .then(products => {
    res.render('admin/products', {
      prods: products, 
      path:"/admin/products", 
      pageTitle: 'Admin Products',
      currentPage: page,
      lastPage: Math.ceil(totalItems/ ITEMS_PER_PAGE)
    }) 
  })
  .catch(err => {
    console.log(err);
    const error = new Error(err)
    error.httpStatus = 500;
    return next(error);
  });
};

exports.postDeleteProduct = (req,res,next) => {
  const productId = req.body.productId;

  Product.findById(productId)
  .then(product => {
    console.log(product.imageUrl);
    if(!product){
      return next(new Error('Product not found'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({_id:productId, userId: req.user._id});
  })
  .then(() => {
    console.log("deleted product");
    res.redirect('/admin/products');
  })
  .catch(err => {
    console.log(err);
    const error = new Error(err)
    error.httpStatus = 500;
    return next(error);
  });
};
