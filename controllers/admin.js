
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
  Product.findById(prodId, product => {
    if(!product){
      return res.redirect('/');
    }
    res.render('admin/edit-product',{
      pageTitle: 'Edit Product', 
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  });


};
exports.postAddProduct = (req, res, next) => {
    const {body: {title, imageUrl, price, description}} = req;

    const product = new Product(null, title,imageUrl,description,price);
    product.save();
    res.redirect('/');
};

exports.postEditProduct = (req,res,next) => {
  const prodId = req.body.productId;
  const {body: {title, imageUrl, price, description}} = req;
  const product = new Product(prodId, title,imageUrl,description,price);
  product.save();
  res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products, 
      path:"/admin/products", 
      pageTitle: 'Admin Products'
    });  
}
);
};

exports.postDeleteProduct = (req,res,next) => {
  const productId = req.body.productId;
  Product.deletebyId(productId);
  res.redirect('/admin/products');
};
