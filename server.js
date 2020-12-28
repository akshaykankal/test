const express = require('express')
const app = express()
const path = require('path')
const database = require('./config/db')
database()
app.use(express.json({extended:true}))

const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, './build')));
app.use('/',express.static(path.join(__dirname, './build')));
app.use('/dashboard',express.static(path.join(__dirname, './build')));
app.use('/transactions',express.static(path.join(__dirname, './build')));
app.use('/profile',express.static(path.join(__dirname, './build')));
app.use('/SignupPage',express.static(path.join(__dirname, './build')));
app.use('/forgotpassword',express.static(path.join(__dirname, './build')));

app.use('/signup',require('./routes/authentication/register_route'))
app.use('/auth',require('./routes/authentication/authenticate_route'))
app.use('/wallet',require('./routes/wallet/wallet_route'))

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`)
})