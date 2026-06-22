const express = require('express');
const path = require('path');

const router = express.Router();
const rootDir = require('../util/path');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');


router.get( '/',shopController.getIndex);
router.get( '/products',shopController.getProducts);
router.get('/product/:productId',shopController.getProduct);
// router.get('/product/delete',shopController.deleteProduct);
router.get( '/cart',isAuth,shopController.getCart);
router.post('/delete-cart-items',isAuth,shopController.deleteCartItems);
router.post('/add-to-cart',isAuth,shopController.addToCart);
router.get( '/checkout',isAuth,shopController.getCheckout);
router.get( '/orders',isAuth,shopController.displayOrders);
router.post('/createOrder',isAuth,shopController.createOrder);
router.get( '/checkout/success',isAuth,shopController.getCheckoutSuccess);
router.get( '/checkout/cancel',isAuth,shopController.displayOrders);
router.get('/orders/:orderId', isAuth , shopController.getInvoice);

module.exports = router;