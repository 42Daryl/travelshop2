const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/key');

const UserSchema = mongoose.Schema({
    firstname:{
        type:String,
        maxlength:50
    },
    lastname:{
        type:String,
        maxlength:50
    },
    email:{
        type:String,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        minlength:6
    },
    role:{
        type:Number,
        default:0,
    },
    token:{
        type:String
    },
    tokenExp:{
        type:Number
    }
});

UserSchema.pre('save',function(next){
    
    let userSchema = this;
    
    if(userSchema.isModified('password')){
        bcrypt.hash(userSchema.password,10,function(err,hash){
           
            if(err) return next(err);
            userSchema.password = hash;
            next();
        })
    }else{
        next();
    }
    // similarly if we put next() here, it will call the next function to run before setting password =hash
});

//demonstrates the difference between this keyword in regular function and aarrow function.
  const myObject2={
        'prop':'he',
        someMethod:function(){
            console.log(this.prop); //this points to the object calling the function.
        },
        arrowSomeMethod:()=>{
            console.log(this.prop); //this points to User
        }
  }

//   myObject2.someMethod();
//   myObject2.arrowSomeMethod();

UserSchema.method('comparePassword',function(password,next){ // we cannot use arrow function here because of 'this' keyword will point to global object (USER)


    bcrypt.compare(password,this.password,(err,isMatch)=>{
        if(err) return next(err);
        next();
    });
});

UserSchema.method('generateToken',function(next){
    const token = jwt.sign({
        id:this._id.toHexString()
    },config.secret);
    this.token = token;
    this.save((err,userData)=>{
        if(err) return next(err);
        next(null,userData); //we need null here so our index.js won't capture wrongly.
    });
});

UserSchema.static('findByToken',function(token,next){
    jwt.verify(token,config.secret,(err,decode)=>{
        if(err) return next(err);
        
        this.findOne({_id:decode.id,token:token},(err,userData)=>{
            if(err) return next(err);
            next(null,userData);
        })
    });
})

const User = mongoose.model('User',UserSchema);


module.exports=User;