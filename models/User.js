const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    f_name:{
        type:String,
        required:true
    },
    l_name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    balance:{
        type:String
    },
    last_updated:{
        type:String
    }
})

module.exports = mongoose.model('user_collection',UserSchema)