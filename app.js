// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
// const axios = require("axios");

// app setup
const app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('.well-known'));

app.use('/', require('./routes/index'));
app.use('/api/v1.0/products', require('./api/v1.0/products'));
app.use('/api/v1.0/marketing', require('./api/v1.0/marketing'));

// User API
// app.use('/api/v1.0/user', require('./api/v1.0/user/profile'));
app.use('/api/v1.0/user/signin', require('./api/v1.0/user/signin'));
app.use('/api/v1.0/user/signup', require('./api/v1.0/user/signup'));
app.use('/api/v1.0/user/profile', require('./api/v1.0/user/profile'));

app.use('/api/v1.0/order', require('./api/v1.0/order'));
app.use('/admin_product', require('./routes/admin_product'));
app.use('/admin_campaign', require('./routes/admin_campaign'));

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => console.log('Server running on port 3000'));


