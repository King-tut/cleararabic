 var express = require('express');
 var jwt = require('jwt-simple');
var session = require('express-session');
var mongoose   = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/premi');
var userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
});
var User = mongoose.model('arabsnode', userSchema);
 var router = express.Router();

 router.post('/login', function(req,res,next){
//console.log('this is the email ' + ' ' + req.body.email);

   User.findOne({email:req.body.email}, function(err,user){
     if(err){ console.log(err);}
     console.log("this is user data " + " " + user);
     if(!user){ res.redirect('login');}
     bcrypt.compare(req.body.password,user.password, function(err, match) {
    if(err){ console.log(err);}
      req.session.cookie.name = user.name;
      var sessName = req.session.cookie.name;
     
      req.session.cookie.uid = req.session.id;
 console.log("This is the cookie  " + " "  + req.session);
       var payload = { name: user.name };
    var secret = 'xxx';
 
// HS256 secrets are typically 128-bit random strings, for example hex-encoded: 
// var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex) 
 
// encode 
     var token = jwt.encode(payload, secret);
       res.header('Authorization', token);
       res.header('Access-Control-Expose-Headers', 'token');
     


       res.send( {token:{token:token}, user:user, wholeCookie: req.cookie});
});
     


   });
    
 
});
