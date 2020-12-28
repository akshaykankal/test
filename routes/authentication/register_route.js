const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../../middleware/auth')

const {check, validationResult }= require('express-validator')

router.post('/',
check('f_name','Please Enter First Name').not().isEmpty(),
check('l_name','Please Enter Last Name').not().isEmpty(),
check('phone','Please Enter Valid Number').not().isEmpty(),
check('phone','Please Enter Valid Number').not().isNumeric(),
check('address','Please Enter Address').not().isEmpty(),
check('email','Please Enter Valid Email').isEmail(),
check('password','Password Should Be Atleast 6 Character Long').isLength({min:6})
,async(req,res)=>{
   try {
       const valError = validationResult(req)
       if(!valError.isEmpty()){
            res.status(400).json({error:valError.array()})
       }
       else{
           const {f_name, l_name, phone, address, email, password} = req.body
            try {
                let user = await User.findOne({phone})
                if(user){
                    res.status(400).json({msg:"Phone Already Exists"})
                }else{
                    user = new User({
                        f_name, l_name, phone, address, email, password
                    })
                    const salt = await bcrypt.genSalt(10)
                    user.password =  await bcrypt.hash(password,salt)
                    await user.save()

                    const payload = {
                        user:{
                            id:user.id
                        }
                    }

                    jwt.sign(payload,process.env.SECRET_KEY,{
                        expiresIn:3600
                    },(error,token)=>{
                        if(error){
                            return res.status(400).json({msg:"server error"})
                        }else{
                            res.send({token})
                        }
                    })
                }
            } catch (error) {
                console.error(error)
            }
       }
   } catch (error) {
        console.log(error)
        res.status(503).json({error})  
   }
})

router.put('/update', 
auth, 
check('f_name','Please Enter First Name').not().isEmpty(),
check('l_name','Please Enter Last Name').not().isEmpty(),
check('address','Please Enter Address').not().isEmpty(),
check('email','Please Enter Valid Email').isEmail(),
async(req,res)=>{
   try {
    const valError = validationResult(req)
    if(!valError.isEmpty()){
         res.status(400).json({error:valError.array()})
    }
           const data = req.body
            try {
                
                var u = await User.findByIdAndUpdate(req.body._id,{$set:{'f_name':req.body.f_name,'l_name':req.body.l_name,'address':req.body.address,'email':req.body.email}},{new:true})
                return res.status(200).json({msg:"Updated Successfully"})
            } catch (error) {
                console.error(error)
            }
       
   } catch (error) {

        console.log(error)
        res.status(503).json({error})  
   }
})
router.delete('/delete', 
auth,
async(req,res)=>{
    try {
        
        var del = await User.findByIdAndDelete(req.user.id)
        return res.status(200).json({msg:"Deleted Succesfully"})
    } catch (error) {
        console.error(error)
    }
})

module.exports = router
