const mongoose = require('mongoose')

const Schema =mongoose.Schema;
const PostSchema =new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
    
});

module.exports= mongoose.model('users',PostSchema)