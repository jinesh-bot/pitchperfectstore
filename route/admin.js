require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../model/usermodel.js');
const bcrypt = require('bcrypt');
const Category = require('../model/categorymodel.js');

const adminCustomerController = require('../controller/admin/customerController.js');
const adminAuth = require("../middlewares/adminAuth.js");
const adminController = require('../controller/admin/adminController.js');
const productController = require('../controller/admin/productController');
const upload = require('../middlewares/multer');

// Login Routes
router.get('/login', adminAuth.isLogin, (req, res) => res.render('admin/adminlogin'));

router.post('/login', adminAuth.isLogin, (req, res) => {
    if (req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.admin = req.body.email;
        res.json({ success: true });
    } else {
        res.json({ error: 'Invalid credentials' });
    }
});

// Dashboard Route
router.get('/dashboard', adminAuth.checkSession, adminController.getDashboard);

// Product Routes
router.get('/products', adminAuth.checkSession, productController.getProductsByCategory);
router.get('/products/add', adminAuth.checkSession, productController.showAddProduct);
router.post('/products/add', 
    adminAuth.checkSession, 
    upload.array('images', 5), // Allow up to 5 images
    productController.addProduct
);
router.get('/products/edit/:id', adminAuth.checkSession, productController.showEditProduct);
router.post('/products/edit/:id', 
    adminAuth.checkSession, 
    upload.array('images', 5),
    productController.updateProduct
);
router.post('/products/delete/:id', adminAuth.checkSession, productController.deleteProduct);

// Category and Customer Routes
router.get('/categories', adminAuth.checkSession, async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.render('admin/categories', { categories });
});

router.post('/categories', adminAuth.checkSession, async (req, res) => {
  try {
    await Category.create({ name: req.body.name });
    res.redirect('/admin/categories');
  } catch (err) {
    res.render('admin/categories', { categories: await Category.find(), error: 'Category already exists or invalid.' });
  }
});

router.post('/categories/delete/:id', adminAuth.checkSession, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.redirect('/admin/categories');
});

router.get('/customers', adminAuth.checkSession, adminController.getCustomers);
router.patch('/toggle-user-status/:id', adminAuth.checkSession, adminCustomerController.toggleUserStatus);

// Logout Route
router.get('/logout', adminAuth.checkSession, (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

module.exports = router;
 
