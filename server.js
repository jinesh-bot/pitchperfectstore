// require('dotenv').config();
const express=require("express")
const app = express()
const session = require('express-session');
const PORT= 7000||process.env.PORT

const connectdb= require('./db/db.js')

const userRoutes =require("./route/user")
const adminRoutes= require("./route/admin")
const path = require("path");
const nocache = require('nocache');

//connecct to DB
connectdb();

// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

// Set the view engine (EJS in this case)
app.set('view engine', 'ejs');
app.use(nocache())
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(express.static('public'))
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
  }));

  //GOOGLE AUTH
//   app.use(passport.initialize());
// app.use(passport.session());



app.use("/admin",adminRoutes)
app.use("/",userRoutes)

app.listen(PORT,()=>{console.log(`Server running on http://localhost:${PORT}`)})