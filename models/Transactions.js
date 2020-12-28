const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user_collection',
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user_collection',
        required:true
    },
    amount:{
        type:String,
        required:true
    },
    date_time:{
        type:String,
        required:true
    },
})

module.exports = mongoose.model('transactions',TransactionSchema)