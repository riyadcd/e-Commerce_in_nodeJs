const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressHandlebars = require('express-handlebars');
const csrf = require('csurf');
const flash = require('connect-flash')
// const routes = require('./routes');

const adminRoutes = require('./router/admin');
const shopRoutes = require('./router/shop');
const authRoutes = require('./router/auth');

const rootDir = require('./util/path'); 
const sequelize = require('./util/database');
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const multer = require('multer');

const errorController = require('./controllers/error');
const fileStorage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'images')
    },
    filename: (req,file,cb) => {
        const safeDate = new Date().toISOString().replace(/:/g, '-');
        cb(null, safeDate + '-' + file.originalname);
    }
})
const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/png'|| file.mimetype === 'image/jpg'|| file.mimetype === 'image/jpeg')
    {
        cb(null,true);
    }else{
        cb(null,false);
    }
}
const Products = require('./models/products');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartProducts = require('./models/cartProducts');
const Order = require('./models/order');
const OrderProducts = require('./models/orderProducts');
const options ={
    host : 'localhost',
    port : '3306',
    user : 'root',
    database : 'node_complete',
    password : '0105Aish@123',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}
const app = express();
const sessionStorage = new mysqlStore(options);
// app.engine('handlebars', engine());
// app.engine('handlebars', expressHandlebars.engine({
//             layoutsDir: 'views/layouts/',
//             defaultLayout: 'main-layouts' // looks for views/layouts/main.handlebars
// }));
const csrfProtection = csrf();
app.set('view engine', 'ejs');
app.set('views', 'views'); // sets the views folder

// db.execute('SELECT * FROM products')
//     .then(result => {
//         console.log(result[0],result[1]);
//     })
//     .catch(error => {
//         console.log(error);
//     });

// app.engine('handlebars',expressHandlebars.engine());//This tells express that this is templating engine and its name is handlebars
// app.set('view engine','handlebars');//This will tell express to use handlebars or it allows to use it
// app.set('view engine','pug');  //This is template engine pug and we are allowing express to use pug for template engine rendring
// app.set('views','views');   // we want to add dynamic content in views folder files 

//code which parse our form data
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage,fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname,"public")));
app.use('/images',express.static(path.join(__dirname,"images")));

app.use(session({
        store:sessionStorage,secret:'my secret',resave:false,saveUninitialized:false
    }));

app.use(csrfProtection);
app.use((req,res,next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

    app.use((req,res,next) => {
    if(!req.session.userId){
        return next();
    }

    User.findByPk(req.session.userId)
    .then(user => {
        if(!user){
            return next();
        }
        req.user = user; 
        next();
    })
    .catch(err => {
        next(new Error(err));
    });
});


app.use(flash());

app.use("/admin",adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get505);

// app.use((req,res,next) => {
//     console.log('this middleware always runs');
//     next();
// });

app.use(errorController.get404);

app.use((error,req,res,next) => {
    // res.status(500).render('500',{
    //     pageTitle: 'Error!',
    //     path: '/500',
    //     isAuthenticated:req.session.isLoggedIn
    // });
        console.log(error);

})

Products.belongsTo(User,{ constraints : true, onDelete : 'CASCADE'});  ///This means that one user can have many products and when a user is deleted then the products to which it beleongs to will also delete
User.hasMany(Products);
User.hasOne(Cart);
User.hasMany(Order);
Cart.belongsTo(User);
Cart.belongsToMany(Products , { through:CartProducts});
Products.belongsToMany(Cart,{ through:CartProducts});
Products.belongsToMany(Order,{ through: OrderProducts});
Order.belongsToMany(Products, { through: OrderProducts });
Order.belongsTo(User);

sequelize.sync({ force:false }).then(result => {  /// force : ture means that it will update new products or columns without deleting whole product table and will create new table or update when needed
    return User.findByPk(1);
})
.then(user => {
    return user;
})
.then(user => {
    return user.createCart();
})
.then(cart => {
    app.listen(3000)
})
.catch(err => {
    console.log(err)
});
// const server = http.createServer(app);

// server.listen(3000);

//or


// process.exit();