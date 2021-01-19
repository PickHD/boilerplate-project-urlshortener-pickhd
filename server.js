require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const AutoIncrement= require("mongoose-auto-increment")
const bodyParser= require("body-parser");
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//Database Configuration & Modelling
const connection=mongoose.createConnection(process.env.DB_URI,{useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true,useFindAndModify:false})
AutoIncrement.initialize(connection)

mongoose.connect(process.env.DB_URI,{useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true,useFindAndModify:false})
.then(()=>console.log("MongoDB Connected!!"))
.catch(e=>console.error(e))

const shortSchema = mongoose.Schema({
  original_url:{
    type:String,
    required:true
  }
})
shortSchema.plugin(AutoIncrement.plugin,{ model: 'Short', field: 'short_url',startAt:1 })
const Short = mongoose.model("Short",shortSchema)

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' })
});

app.post('/api/shorturl/new',function(req,res){
  function isValidURL(string) {
    var res = string.match(/(http|https|ftp):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/);
    return (res !== null)
  };
  if(isValidURL(req.body.url)){
    Short.create({
      original_url:req.body.url
    })
    .then(function(url){
      res.json({
        original_url:url.original_url,
        short_url:url.short_url
      })
      return
    })
    .catch(function(e){
      res.json({error:"Cannot Create Short Url",reason:e})
      return
    })
  }else{
    res.json({error: "invalid url"})
    return
  }
})
app.get("/api/shorturl/:short_url",function(req,res){
  Short.findOne({short_url:parseInt(req.params.short_url)})
  .then(function(url){
    res.redirect(url.original_url)
  })
  .catch(e=>console.log(e))
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`)
});
