const express = require('express');
const path = require('path');

const routes = express.Router();
const rootDir = require('../util/path'); 
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { check } = require('express-validator');

//Get routes

routes.get('/add-product',isAuth, adminController.getAddProduct);
routes.get('/products',isAuth, adminController.getProducts);
//POST routes
routes.get('/edit-product/:productId',isAuth, adminController.getEditProduct);
routes.post('/add-product',isAuth,
    check('title').isLength({min:1}).withMessage('Please enter a valid text with minimun one character'),
    check('description').isLength({min:1}).withMessage('Please enter a valid text with minimun one character')
    ,adminController.storeAddProduct);
routes.post('/edit-product',isAuth,
    check('title').isLength({min:1}).withMessage('Please enter a valid text with minimun one character'),
    check('description').isLength({min:1}).withMessage('Please enter a valid text with minimun one character'),
    adminController.storeEditProduct);
routes.post('/delete-product',isAuth,adminController.deleteProduct);

module.exports = routes;