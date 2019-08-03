var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var Product = require('../models/product');
var Order = require('../models/order');
var User = require('../models/user');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile-admin', function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function (err, products) {
    res.render('admin/profile-admin', { products: products, successMsg: successMsg, noMessages: !successMsg });
  });
});

router.get('/table-product', function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function (err, products) {
    res.render('admin/table-product', { products: products, successMsg: successMsg, noMessages: !successMsg });
  });
});

router.get('/table-order', function (req, res, next) {
  Order.find(function (err, orders) {
    res.render('admin/table-order', { orders: orders });
  });
});

router.get('/table-user', function (req, res, next) {
  User.find(function (err, users) {
    res.render('admin/table-user', { users: users });
  });
});

router.get('/admin-login', function (req, res, next) {
  var messages = req.flash('error');
  res.render('admin/admin-login', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/admin-login', passport.authenticate('local.admin', {
  successRedirect: '/admin/profile-admin',
  failureRedirect: '/admin/admin-login',
  failureFlash: true
}));

router.get('/insert', function (req, res, next) {
  res.render('admin/insert');
});

router.get('/update/:id', function (req, res, next) {
  var productId = req.params.id;
  Product.findById(productId, function (err, product) {
    if (err) {
      console.error('error, no entry found');
    }
    res.render('admin/update', {ids:productId});
  });
});  

module.exports = router;