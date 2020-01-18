// const mongodb = require('mongodb');
// const ObjectId = mongodb.ObjectId;
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product',{
      pageTitle: 'Add Product', 
      path: '/admin/add-product',
      editing: false
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
      product: product
    });
  })
  .catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const {body: {title, imageUrl, price, description}} = req;
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

  Product.findById(productId)
  .then(product => {
    product.title = title;
    product.imageUrl = imageUrl;
    product.price = price;
    product.description = description;

    return product.save();
  })
  //const product = new Product(title,price,description,imageUrl,productId)
  
  .then(result => { 
    console.log("updated");
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
  
};

exports.getProducts = (req, res, next) => {
  Product.find()
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

  Product.findByIdAndDelete(productId)
  .then(() => {
    console.log("deleted product");
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
};
