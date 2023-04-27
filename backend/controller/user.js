const express = require('express');
const path = require('path');
const User = require('../model/user');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendMail = require("../utils/sendMail");
const router = express.Router();
const jwt = require('jsonwebtoken')
const sendToken = require('../utils/jwtToken')
router.post('/create-user', async(req, res, next) => {
    
    try{
   
        const {email, password} = req.body;
        const userEmail = await User.findOne({email})
        if(userEmail){
            return next(new ErrorHandler("User already exists", 400));
        }
    
        const user = {
            email: email,
            password: password
        }
    
        const activationToken = createActivationToken(user);
        const activationUrl = `http://localhost:3000/activation/${activationToken}`;

        try {
            await sendMail({
              email: user.email,
              subject: "Activate your account",
              activationUrl: activationUrl,
              body: `<h1>Hello ${user.email}, please click on the link to activate your account: ${activationUrl}</h1>`,
              message: `Hello ${user.email}, please click on the link to activate your account: ${activationUrl}`,
            });
            res.status(201).json({
              success: true,
              message: `please check your email:- ${user.email} to activate your account!`,
            });
          } catch (error) {
            return next(new ErrorHandler(error.message, 500));
          }


    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }

    

})

// create activation token
const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
      expiresIn: "5m",
    });
};

router.post('/activation', catchAsyncErrors(async(req,res,next) => {
    try{
        const {activation_token} = req.body;
        const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET)

        if(!newUser){
            return next(new ErrorHandler("Invalid token", 400))
        }

        const {email,password} = newUser;

        let user = await User.findOne({email});

        if(user){
            return next(new ErrorHandler("User already exists", 400))
        }

        user = await User.create({
            email,
            password
        })

        sendToken(user, 201, res)

    }catch(error){
        return next(new ErrorHandler(error.message, 500))
    }
}))
  

module.exports = router