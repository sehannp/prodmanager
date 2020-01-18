const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.set('view engine','ejs');
app.set('views','views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

const User = require('./models/user');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req,res,next) => {
    User.findById("5e2283d3b7906f42948825e6")
    .then( user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);


mongoose.connect('mongodb+srv://sehan:9BJoAgWT6dqCmRzT@cluster0-lq2mq.mongodb.net/test?retryWrites=true&w=majority')
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
