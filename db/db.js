require('dotenv').config();
const mongoose= require('mongoose')
const connectdb= async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URL)
       console.log(`Database connected:${conn.connection.host}`)
    }catch(error){
        console.log(error);
    }
}
module.exports=connectdb;