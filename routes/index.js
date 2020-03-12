var express = require('express');
var router = express.Router();

router.get('/index.html', function(req, res, next) {
  res.render('index');
});

router.get('/product.html', function(req, res, next) {
  res.render('product');
});

router.post('/product.html', function(req, res, next) {
  res.redirect('/thankyou.html');
});

router.get('/thankyou.html', function(req, res, next) {
  res.render('thankyou');
});

router.get('/profile.html', function(req, res, next) {
   res.render('profile');
});

router.post('/profile.html', function(req, res, next) {
  res.render('profile');
});

router.get('/signin.html', function(req, res, next) {
  res.render('signin_signup');
});

module.exports = router;
