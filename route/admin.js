const express = require('express')
const router= express.Router()
const User =require('../model/usermodel.js')
const bcrypt = require('bcrypt');
const adminController = require('../controller/adminController.js')
const adminAuth= require("../middlewares/adminAuth.js")
require('dotenv').config();

router.get('/login',adminAuth.isLogin, (req, res) => res.render('adminlogin'));

router.post('/login',adminAuth.isLogin,(req,res)=>{
  if(req.body.email===process.env.ADMIN_EMAIL && req.body.password===process.env.ADMIN_PASSWORD){   
    req.session.admin=req.body.email
    res.json({ success: true });
  } else {
    res.json({ error: 'Invalid credentials' });
  }
})


router.get('/home',adminAuth.checkSession, async (req, res) => {
 
    const users = await User.find({ role: 'user' });
    res.render('adminhome', { admin: req.session.admin, users,isLoginned:true });
  });
   
  
  router.post('/addusers',adminAuth.checkSession, adminController.addusers )
  router.get('/delete-user/:id',adminAuth.checkSession, adminController.deleteUser )
  router.post('/editusers/:id', adminAuth.checkSession, adminController.editUser )
  


  router.get('/logout',adminAuth.checkSession, (req, res) => {
    req.session.destroy()
    res.redirect('/admin/login');
  });


module.exports=router
 
