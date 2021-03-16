const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('./config/key');

mongoose.connect(config.MONGO_URI,
{useNewUrlParser: true ,useUnifiedTopology: true}).then(()=>console.log('DB connected')).catch(err=>console.log(err));

app.get("/",(req,res)=>{
    res.send("hello")
})

app.listen(5000);