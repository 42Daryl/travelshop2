const User = require('../model/User');

let auth = (req,res,next)=>{
    let token = req.cookies.X_anyName;
  
    User.findByToken(token,(err,userData)=>{
        if(err) return res.status(400).json({sucess:'fail',err});
        if(!userData) return res.json({success:'fail',isAuth:false});

        req.token = token;
        req.user = userData;
        next();

    })

    // we cannot put next() here cause it will call it before User.findByToken finishes. therefore leading to 
    // next function being called.
}


module.exports =auth;