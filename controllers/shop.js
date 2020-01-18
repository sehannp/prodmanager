
const Product = require('../models/product');
const Order = require('../models/order');
// const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {

  Product.find()
  .then(products => {
    res.render('shop/product-list', {
      prods: products, 
      path:"/products", 
      pageTitle: 'All Products'
    });
  })
  .catch(err => console.log(err));

};

exports.getProduct = (req,res,next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    res.render('shop/product-detail',{
      product: product, 
      pageTitle: product.title,
      path: "/products"
    })
  })
  .catch(err => console.log(err));
}

exports.getIndex = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('shop/index', {
      prods: products, 
      path:"/", 
      pageTitle: 'Shop'
    });
  })
  .catch(err => console.log(err));
};

exports.getCart = (req,res,next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {
        res.render('shop/cart', {
        path:"/cart", 
        pageTitle: 'Your Cart',
        products: user.cart.items
      }); 
  })
  .catch(err => console.log(err));
};

exports.postCart = (req,res,next) => {
  const prodId = req.body.productId;
  req.user.addToCart(prodId)
  .then(result => {
    res.redirect('/products');
  });
}

exports.postCartDeleteProduct = (req,res,next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};

exports.postOrder = (req,res,next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {

    const products = user.cart.items.map(i => {
      return {quantity: i.quantity, product: {...i.productId._doc}};
    });

    const order = new Order
    ({
      user:{name: req.user.name, userId: req.user._id},
      products: products 
    });
    return order.save();
  })
  .then(result => {
    return req.user.clearCart();
  })
  .then(result => {
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
}

exports.getOrders = (req,res,next) => {
  Order.find({"user.userId": req.user._id})
  .then(orders => {
    res.render('shop/orders', {
      path:"/orders", 
      pageTitle: 'Your Orders',
      orders: orders
    });
  })
  .catch(err => console.log(err)); 
}

