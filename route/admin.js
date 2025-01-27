const express = require('express')
const router= express.Router()
const User =require('../model/usermodel.js')
const bcrypt = require('bcrypt');
const adminCustomerController = require('../controller/admin/customerController.js')
const adminAuth= require("../middlewares/adminAuth.js")
const adminController = require('../controller/admin/adminController.js')
require('dotenv').config();

router.get('/login',adminAuth.isLogin, (req, res) => res.render('admin/adminlogin'));

router.post('/login',adminAuth.isLogin,(req,res)=>{
  if(req.body.email===process.env.ADMIN_EMAIL && req.body.password===process.env.ADMIN_PASSWORD){   
    req.session.admin=req.body.email
    res.json({success:true})
  } else {
    res.json({ error: 'Invalid credentials' });
  }
})

router.get('/dashboard', adminAuth.checkSession, adminController.getDashboard);
router.get('/products', adminAuth.checkSession, adminController.getProducts);
router.get('/categories', adminAuth.checkSession, adminController.getCategories);
router.get('/customers', adminAuth.checkSession, adminController.getCustomers);

// Add new route for toggling user status
router.patch('/toggle-user-status/:id', adminAuth.checkSession, adminCustomerController.toggleUserStatus);

router.get('/logout',adminAuth.checkSession, (req, res) => {
  req.session.destroy()
  res.redirect('/admin/login');
});

module.exports=router
 
