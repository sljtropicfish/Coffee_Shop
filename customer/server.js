if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()

const mysql = require('./dbcon.js');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('mysql', mysql);
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())

const initializePassport = require('./authentication/passport-config-customer')
initializePassport(
  passport
)

app.post('/account/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/account/login',
  failureFlash: true,
}))

app.use('/account', require('./authentication/account.js'));

/*
-------- put your code here--------------------------------------
------------------------------------------------------------------
*/

// 1. add this checkAuthenticated function in your js file
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/account/login')
}


app.get('/', (req, res) => {
  var context = {};
  // 2. add
  // context.loggedin = req.isAuthenticated() ? true : false
  // in each http get function
  context.loggedin = req.isAuthenticated() ? true : false;
  context.name = req.isAuthenticated() ? req.user.name : ""
  context.message = "main page"
  res.render('index', context)
})

// 3. if the page need authentication, add checkAuthenticated into your http call function param
app.get('/placeOrder', checkAuthenticated, (req, res) => {
  var context = {};
  context.loggedin = req.isAuthenticated() ? true : false;
  context.message = "order page"
  context.name = req.user.name + " your id: " + req.user.userID;
  res.render('index', context)
})

/*--------------------------------------------------------------
----------------------------------------------------------------*/

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)
