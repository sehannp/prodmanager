
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
  Product.findByPk(prodId)
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
    Product.create({
      title: title, 
      price: price, 
      imageUrl: imageUrl, 
      description: description
    })
    .then(result => {
      console.log("Record created");
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req,res,next) => {
  const {productId, title, imageUrl, price, description} = req.body;

  Product.findByPk(productId)
  .then(product => {
    product.title = title;
    product.imageUrl = imageUrl;
    product.price = price;
    product.description = description;
    return product.save();
  })
  .then(result => { 
    console.log("updated");
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
  
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
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

  Product.findByPk(productId)
  .then(product => {
    return product.destroy()
  })
  .then(result => {
    console.log("deleted product");
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
};
