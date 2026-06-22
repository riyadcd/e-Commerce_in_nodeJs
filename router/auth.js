const express = require('express');

const authController = require('../controllers/auth')

const routes = express.Router();

const rootDir = require('../util/path'); 
const User = require('../models/user');
const { check } = require('express-validator');

routes.get('/login', authController.getLogin);
routes.post('/login', authController.postLogin);
routes.post('/logout', authController.postLogout);
routes.get('/signUp', authController.getSignUp);
routes.post('/signUp', 
    check('email').
        isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req })=> {
            return User.findOne({email:value}).then(userDoc => {
                if(userDoc){
                    return Promise.reject('E-mail already exuxtes , try different one');
                }
            });
        }),
    check('password','Please enter a password with numbers and text and alteast five characters.')
        .isLength({min:5})
        .isAlphanumeric(),
    check('confirmPassword')
        .custom((value,{req}) => {
            if(value !== req.body.password)
            {
                throw new Error('Password does not match!');
            }
            return true;
        }),    
authController.postSignUp);
routes.get('/reset', authController.getReset);
routes.post('/reset', authController.postReset);
routes.get('/reset/:token', authController.getNewPassword);
routes.post('/postNewPassword', authController.postNewPassword);


module.exports  = routes;