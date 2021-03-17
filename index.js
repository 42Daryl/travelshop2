const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('./config/key');
const cookieParser = require('cookie-parser');
const User = require('./model/User');
const auth = require('./middleware/auth');

mongoose.connect(config.MONGO_URI,
{useNewUrlParser: true ,useUnifiedTopology: true,useCreateIndex:true,useFindAndModify: false})
.then(()=>console.log('DB connected')).catch(err=>console.log(err));

app.use(cookieParser());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("hello")
});

app.get("/api/users/auth",auth,(req,res)=>{

    res.status(200).json({
        _id:req.user._id,
        isAuth:true,
        email:req.user.email,
        firstname:req.user.firstname,
        lastname:req.user.lastname,
        role:req.user.role
    })
})

app.post("/api/users/register",(req,res)=>{
    const user = new User(req.body);
    user.save((err,UserData)=>{
        if(err) return res.json({success:false,err})
        res.status(200).json({sucess:true,UserData})
    });
});

app.post("/api/users/login",(req,res)=>{

    User.findOne({email:req.body.email},(err,user)=>{
        
        if(!user) return res.json({success:false,message:'Auth Failed, email not found.'});
        
        user.comparePassword(req.body.password,(err,isMatch)=>{
            // console.log(err);
            if(err) return res.json({success:false,message:'Auth Failed, password incorrect.'})
        });
    
        user.generateToken((err,userData)=>{
            
            if(err) return res.status(400).json({success:false,err});
            res.cookie("X_anyName",userData.token).status(200).json({success:true,userData});
        }) 
    }); 
});

app.get("/api/users/logout",auth,(req,res)=>{

    User.findOneAndUpdate({_id:req.user._id},{token:''},(err,success)=>{
        if(err) res.status(400).json({success:false,err});
        res.status(200).json({success:true})
    });
});

app.listen(5000);