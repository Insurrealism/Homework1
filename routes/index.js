var express = require('express');
var router = express.Router();

var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function(err, products) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < products.length; i += chunkSize){
      productChunks.push(products.slice (i, i + chunkSize));
    }
    res.render('shop/index', { title: 'Sole-Klab ', products: productChunks, successMsg: successMsg, noMessages: !successMsg });
  });
});

router.get('/add-to-cart/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart: {});

  Product.findById(productId, function(err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/reduce/:id', function(req, res,next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res,next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  
  var stripe = require("stripe")(
    "sk_test_1EH3JNYCGgYJrvMxpf0Tt521"
  );
  
  stripe.charges.create({
    amount: cart.totalPrice * 1,
    currency: "idr",
    source: "tok_mastercard", // obtained with Stripe.js
    description: "Test Charge"
  }, function(err, charge) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/checkout');
      }
      var order = new Order({
        user: req.user,
        cart: cart,
        address: req.body.address,
        name: req.body.name,
        paymentId: charge.id
      });
      order.save(function(err, result) {
        req.flash('success', 'Successfully bought product');
        req.session.cart = null;
        res.redirect('/')
      });
  });
});

router.get('/get-data', function(req,res, next) {
  Product.find()
    .then(function(product) {
      res.render('index', {items: product});
    });
});

router.post('/insert', function(req, res, next) {
  var item = {
    title: req.body.title,
    imagePath: req.body.imagePath,
    description: req.body.description,
    price: req.body.price
  };
  var product = new Product(item);
  product.save(function(err, result) {
    req.flash('success', 'Successfully insert product');
    res.redirect('/admin/table-product');
  });
});

router.post('/update', function(req, res, next) {
  var productId = req.body.id;
  Product.findById(productId, function(err, product) {
    if (err) {
      console.error('error, no entry found');
    }
    product.title = req.body.title;
    product.imagePath = req.body.imagePath;
    product.description = req.body.description;
    product.price = req.body.price;
    product.save(function(err, result) {
      req.flash('success', 'Successfully update product');
      res.redirect('/admin/table-product');
    });
  });
});

router.post('/delete/:id', function(req, res, next) {
  var productId = req.params.id;
  Product.findByIdAndRemove(productId).exec();
  req.flash('success', 'Successfully delete product');
  res.redirect('/admin/table-product');
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}