const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authController = require('../controller/user/authController');
const homeController = require('../controller/user/homeController');
const productController = require('../controller/user/product');

// Landing and Home
router.get('/', homeController.getLanding);
router.get('/home', homeController.getHome);

// Auth
router.get('/signup', auth.isLogin, authController.getSignup);
router.post('/signup', auth.isLogin, authController.postSignup);
router.get('/login', auth.isLogin, authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);
router.get('/auth/google', authController.googleAuth);
router.get('/auth/google/callback', authController.googleAuthCallback);

// ...and so on for OTP, password reset, etc.

// Products
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductDetail);

module.exports = router;