const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGODB_URI = require('./util/database');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const app = express();
app.set('view engine','ejs');
app.set('views','views');

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection:'sessions'
});
const csrfProtection = csrf();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');

const User = require('./models/user');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'my_secret', 
        resave: false, 
        saveUninitialized: false,
        store: store}
    )
);
app.use(csrfProtection);
app.use(flash());

app.use( (req,res,next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn,
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req,res,next) => {
    
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then( user => {
        //adding to handle unintentional db delettion case
        if(!user){
            return next();
        }
        req.user = user; 
        next();
    })
    .catch(err => {next(new Error(err))});
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);
app.use((error,req,res,next) => {
    res.status(500)
    .render('500', {pageTitle: 'Error', 
    path: '/500', isAuthenticated: req.session.isLoggedIn});
})

mongoose.connect(MONGODB_URI,{ useNewUrlParser: true})
.then(result => {
    app.listen(3000); 
})
.catch(err => console.log(err));
