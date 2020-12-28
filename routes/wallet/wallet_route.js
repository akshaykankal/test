const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const Transaction = require('../../models/Transactions')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../../middleware/auth')
const {check, validationResult }= require('express-validator')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


//ADD FUNDS TO PERSONAL WALLET
router.post('/',
auth,
async(req,res)=>{
   try {
       const valError = validationResult(req)
       if(!valError.isEmpty()){
            return res.status(400).json({error:valError.array()})
       }
       else{
            try {
                //get User Info and Add Balance
                var user = await User.findById(req.user.id)
                if(user){

                    var newBalance 
                    if(user.balance){
                        newBalance =  +(user.balance) + +(req.body.amount)
                    }else{
                        newBalance = +(req.body.amount)
                    }
                    var last_update = new Date().toUTCString()
                    await User.findByIdAndUpdate(req.user.id,{$set:{'balance':newBalance, 'last_updated':last_update}},{new:true})
                    
                    var addFundR = new Transaction ({
                        from:req.user.id,
                        to:req.user.id,
                        amount:req.body.amount,
                        date_time: last_update
                    })
                    await addFundR.save()
                }

            res.json("Amount Added Succesfully!")
                
               
            } catch (error) {
                console.error(error)
            }
       }
   } catch (error) {
        console.log(error)
        res.status(503).json({error})  
   }
})


//TRANSFER FUNDS TO OTHER MOBILE NUMBER
//1. Check if receiver with given Mobile Number Present in Database
//2. Check if receiver number is same as sender number
//3. Deduct Amount from Balance of Sender
//4. Add Amount to Balance of Receiver
//5. Add Information of Transaction to Transaction Table
//6. Send Email
router.post('/transfer',
auth,
async(req,res)=>{
    let sender
    let receiver
   try {
        //1. check if receiver with MOBILE present in db
        receiver =  await User.find({phone:'+91-'+req.body.mobile})
        sender = await User.findById(req.user.id)
        //if receiver Present
        if(receiver[0].f_name){
            var receiver_newBalance
            var sender_newBalance 
            //2. Check if receiver number is same as sender number
            if(sender.phone === '+91-'+req.body.mobile){
                return res.status(400).json({msg:"Transfer Not Allowed To Same Account"})
            }

            //2. Deduct amount from Balance of Sender
            if(+sender.balance > +req.body.amount){
                sender_newBalance = sender.balance - req.body.amount
            }else{
                return res.status(400).json({msg:"Don't Have Enough Balance"})
            }
            await User.findByIdAndUpdate(req.user.id,{$set:{'balance':sender_newBalance, 'last_updated':last_update}},{new:true})
            
            //3. Add Amount to Balance of Receiver
            if(receiver[0].balance){
                receiver_newBalance =  +receiver[0].balance + +req.body.amount
            }else{
                receiver_newBalance = +req.body.amount
            }
            var last_update = new Date().toUTCString()
            await User.findByIdAndUpdate(receiver[0]._id,{$set:{'balance':receiver_newBalance, 'last_updated':last_update}},{new:true})
            //4. Add Information of Transaction....
            var addFundR = new Transaction ({
                from:req.user.id,
                to:receiver[0]._id,
                amount:req.body.amount,
                date_time: last_update
            })
            await addFundR.save()

            res.json("Amount Transferred Succesfully!")

            //SEND EMAIL
            //Message for Sender (Transferrer)
            const msg_sender = {
                to: sender.email, // Change to your recipient
                from: 'ashokbhatt@nnbid.com', // Change to your verified sender
                subject: 'Transaction Succesful!',
                text: `You have transferred &#x20B9; ${req.body.amount}/- to ${receiver[0].f_name} ${receiver[0].l_name} succesfully. Updated Balance is &#x20B9; ${sender_newBalance}/-`,
                html: `<strong>You have transferred &#x20B9; ${req.body.amount}/- to ${receiver[0].f_name} ${receiver[0].l_name} succesfully. Updated Balance is &#x20B9; ${sender_newBalance}/-</strong>`,
              }
            //Message for Receiver 
            const msg_receiver = {
            to: receiver[0].email, // Change to your recipient
            from: 'ashokbhatt@nnbid.com', // Change to your verified sender
            subject: 'Received Funds in Account!',
            text: `You have received &#x20B9; ${req.body.amount}/- from ${sender.f_name} ${sender.l_name} succesfully. Updated Balance is &#x20B9; ${receiver_newBalance}/-`,
            html: `<strong>You have received &#x20B9; ${req.body.amount}/- from ${sender.f_name} ${sender.l_name} succesfully. Updated Balance is &#x20B9; ${receiver_newBalance}/-</strong>`,
            }
            //send mail to sender
            sgMail
            .send(msg_sender)
            .then(() => {
                console.log('Email sent to sender')
            })
            .catch((error) => {
                console.error(error)
            })
            //send mail to receiver
            sgMail
            .send(msg_receiver)
            .then(() => {
                console.log('Email sent to receiver')
            })
            .catch((error) => {
                console.error(error)
            })
        }else{
            res.status(400).send({msg:"User not found"})

        }
    
   } catch (error) {
        console.log(error)
        res.status(400).send({msg:"User not found"})
   }
})


router.get('/',
auth,
async(req,res)=>{
   try {
       var trans = await Transaction.find({$or:[ {'from':req.user.id}, {'to':req.user.id} ]}).populate("from").populate("to")
       res.json(trans)
   } catch (error) {
        console.log(error)
        res.status(503).json({error})  
   }
})


module.exports = router
