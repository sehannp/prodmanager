const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://sehan:9BJoAgWT6dqCmRzT@cluster0-lq2mq.mongodb.net/test?retryWrites=true&w=majority';

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
app.set('view engine','ejs');
app.set('views','views');

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection:'sessions'
});

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
        store: store}));

app.use((req,res,next) => {
    User.findById("5e2283d3b7906f42948825e6")
    .then( user => {
        req.user = user;
        
        // req.isLoggedIn = false;
        // if (req.get('Cookie')) {
        //   const cookies = req.get('Cookie').split(';');
        //   const loggedCookie = cookies.find(cookie => {
        //     return cookie.split('=')[0] === 'loggedIn';
        //   });
        //   req.isLoggedIn = loggedCookie.split('=')[1];
        // }
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);


mongoose.connect(MONGODB_URI,{ useNewUrlParser: true})
.then(result => {
    User.findOne()
    .then( user => {
        if(!user){
            const user = new User({
                name: 'sehan',
                email: 'sehanp@test.com',
                cart:{
                    items: []
                }
            });
            user.save();
        }
    });
    app.listen(3000); 
})
.catch(err => console.log(err));
