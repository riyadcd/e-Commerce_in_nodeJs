const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
 
const Products = require('../models/products');
const User = require('../models/user');
const { buffer } = require('stream/consumers');
const { where, QueryError } = require('sequelize');

const transporter = nodemailer.createTransport(sendgridTransport({
        service: 'gmail',
        auth:{
                api_key: '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'
        }
}));

exports.getLogin = (req,res,next) => {        
        res.render('auth/login',{
        path:'/login',
        pageTitle:'Login',
        errorMessage: req.flash('error'),
        validationErrors:[],
        isAuthenticated:false,
        oldInput: {
                email: '',
                password: '',
        },
    });
};

exports.postLogin = (req,res,next) => {
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
                return res.status(422).render('auth/login',{
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: errors.array()[0].msg,
                        isAuthenticated:false,
                        oldInput: { email: email, password: password},
                        validationErrors:  errors.array(),
                });
        }
        User.findOne({ where: { email } })
        .then(user => {
                if(!user){
                        return res.status(422).render('auth/login',{
                                path: '/login',
                                pageTitle: 'Login',
                                isAuthenticated:false,
                                errorMessage: 'invalid password or email',
                                oldInput: { email: email, password: password},
                                validationErrors:  errors.array(),
                        });
                }
                bcrypt.compare(password,user.password)
                .then(result => {
                        if(result){
                                req.session.userId = user.id;
                                req.session.isLoggedIn = true;
                                return req.session.save(err => {
                                        if (err) {
                                                console.log(err);
                                        }
                                        res.redirect('/');
                                });
                        }
                        return res.status(422).render('auth/login',{
                                path: '/login',
                                pageTitle: 'Login',
                                isAuthenticated:false,
                                errorMessage: 'invalid password or email',
                                oldInput: { email: email, password: password},
                                validationErrors:  errors.array(),
                        });
                })
                        
        });
},
exports.postLogout = (req,res,next) => {
        req.session.destroy(err => {
        if (err) {
                console.log(err);
        }
        });
    res.clearCookie('connect.sid'); // It's good practice to clear the cookie explicitly
    res.redirect('/');
},
exports.getSignUp = (req,res,next) => {
        res.render('auth/signUp',{
        path:'/signUp',
        pageTitle:'signUp',
        errorMessage: req.flash('error'),
        oldInput: {
                userName: '',
                email: '',
                password: '',
                confirm_password: ''
        },
        validationErrors:[],
        isAuthenticated:false
    });        
},
exports.postSignUp = (req,res,next) => {
        const userName = req.body.userName;
        const email = req.body.email;
        const password = req.body.password;
        const confirm_password = req.body.confirm_password;
        const errors = validationResult(req);
        if(!errors.isEmpty())
        { 
                return res.status(422).render(
                        'auth/signUp',{
                        path:'/signUp',
                        pageTitle:'signUp',
                        errorMessage: errors.array()[0].msg,
                        oldInput: { email: email, password: password, confirm_password: req.body.confirm_password, userName: userName},
                        isAuthenticated:false,
                        validationErrors:  errors.array()
                });
        }
        bcrypt.hash(password, 12)
                .then(hashPassword =>  {
                console.log(hashPassword);
                User.create({
                        userName: userName,
                        email : email,
                        password : hashPassword
                })
                .then(result => {
                        res.redirect('/login');
                        return transporter.sendMail({
                                to: email,
                                from: 'shop@nodeComplete.com',
                                subject: 'Node complete',
                                html: '<h1>This mail is from node complete</h1>'
                        });
                }).catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                })
        })
                
},
exports.getReset = (req,res,next) => {
        res.render('auth/reset',{
        path:'/reset',
        pageTitle:'reset',
        errorMessage: req.flash('error'),
        isAuthenticated:false
    });       
},
exports.postReset = (req,res,next) => {
        crypto.randomBytes(32, (err , buffer) => {
                if(err){
                        return res.redirect('/reset');
                }
                const token = buffer.toString('hex');
                User.findOne({where:{email: req.body.email}})
                .then(user => {
                        if(!user)
                        {
                                req.flash('error','No account with that email found .');
                                return res.redirect('/reset');
                        }
                        user.resetToken = token;
                        user.resetTokenExpiration = Date.now() + 3600000;
                        return user.save();
                })
                .then(result => {
                        res.redirect('/');
                        transporter.sendMail({
                                to: req.body.email,
                                from: 'aishwaryachurhey@gmail.com',//satyamsss225@gmail.com
                                subject: 'Password Reset',
                                html: `
                                <p>You have requested a password reser .</p>
                                <p>Click this <a href="localhost:3000/reset/${token}"> Link </a> to set your new password</p>
                                `
                        }).catch(err => {
                                const error = new Error(err);
                                error.httpStatusCode = 500;
                                return next(error);
                        })                     
                }).catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                })
        })
},
exports.getNewPassword = (req,res,next) => {
        const token = req.params.token;
        User.findOne({where:{resetToken:token,resetTokenExpiration:{$gt: Date.now()} } })
        .then(user => {
                res.render('auth/password_reset',{
                path:'/password_reset',
                pageTitle:'Password reset',
                errorMessage: req.flash('error'),
                isAuthenticated:false,
                userId: user.id.toString(),
                password_token:token
        }); 
        })
        .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
        })
}
exports.postNewPassword = (req,res,next) => {
        const newPass = req.body.password;
        const userId = req.body.userId;
        const password_token = req.body.password_token;
        let resetUser;
        User.findOne({
                where:{
                        resetToken:password_token,
                        resetTokenExpiration:{ $gt:Date.now() },
                        id:userId
                }
        })
        .then(user => {
                resetUser = user;
                return bcrypt.hash(newPass, 12);
        })
        .then(hashedPassword => {
                resetUser.password = hashedPassword;
                resetUser.resetToken = undefined;
                resetUser.resetTokenExpiration = undefined;
                return resetUser.save();
        })
        .then(result => {
                res.redirect('/login');
        })
        .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
        })
}