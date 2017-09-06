var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var notifier = require('node-notifier');
var jwt = require('jwt-simple');
var session = require('express-session');
var multer = require('multer');
var paypal = require('paypal-rest-sdk');
var stripe = require('stripe')('sk_test_0SDZlxbksNogsqKElDOHHqwr'); //public key pk_test_cC8hpFUJLtxcI2SGORAzNElJ
var UserModel  = require('./models/user');
var vocabulary = require('./models/vocabulary');
const PORT = process.env.PORT || 4600;
//console.log(vocabulary);

//console.log(User.getUser());

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname +'/public/images/profiles');
  },
  filename: function (req, file, cb) {
    cb(null,  file.originalname);
  }
});

var upload = multer({ storage: storage });
var loggedIn = false;
var mongoose   = require('mongoose');
mongoose.connect('mongodb://King-tut:Kitabbook007@ds047365.mlab.com:47365/premi');

var completeUserSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    profilePic:{type:String, default:'default_profile_avatar.png'},
    points:{type:Number,default:0},
    level:{type:Number,default:1},
    alltest:{type:[Number],default:[0]},
    avg:{type:Number,default:0},
    bestscore:{type:Number,default:0},
    ranking:{type:Number,default:0}
});

var arabicDonationsSchema = new mongoose.Schema({
    email:String,
    amount:Number,
    token:String,
    date: {type:Date,default:Date.now()}


});

var adminSchema = new mongoose.Schema({
    
    email:{type:String,unique:true},
    password:String

});

/*var fullUserSchema = new mongoose.Schema({
    uname:String,
    profilePic:String,
    points:{type:Number,default:0},
    level:{type:Number,default:0},
    alltest:{type:[Number],default:[0]},
    avg:{type:Number,default:0},
    bestscore:{type:Number,default:0},
    ranking:{type:Number,default:0}

});*/

paypal.configure({
  mode: 'sandbox', // Sandbox or live
  client_id: 'ASzJhFpIE1cb1n4dkFxY0zPdbTApXNF_uc-a0-WIOHFXs9glCqHqSmsw9_kbS16tbcyYrW_jG8beLI5m',
  client_secret: 'ECySan0qflPSeBLDjpuB02gqAX2XhMmF_r_I8MBZ8zyQowxGIcmMkqfIHGdf3stE7izyLIep3UD4p6sq'});

  var payReq = JSON.stringify({
  intent:'sale',
  payer:{
    payment_method:'paypal'
  },
  redirect_urls:{
    return_url:'http://localhost:4000/process',
    cancel_url:'http://localhost:4000/cancel'
  },
  transactions:[{
    amount:{
      total:'10',
      currency:'USD'
    },
    description:'This is the payment transaction description.'
  }]
});

//var User = mongoose.model('arabsnode', userSchema);
var completeUser = mongoose.model('completeusers', completeUserSchema);
var donar = mongoose.model('arabicdonars', arabicDonationsSchema);
var Admin = mongoose.model('arabadmins', adminSchema);
var nodemon = require('nodemon');

var app = express();
  
 
app.engine('.hbs', exphbs({defaultLayout: 'main', extname:'.hbs'}));
app.set('view engine', '.hbs');
//app.set('views', __dirname + '/views/');

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/public', express.static(__dirname + '/public'));




app.use(session({
    
  secret: "Thisisthesecret",
  resave: true,
  saveUninitialized:true,
  cookie: {name:''}
}
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
 



 
app.get('/', function (req, res) {
    if(req.headers.referer == "/logout"){
      res.render('landing',{loggedIn:false});
    }
   
    else{
     res.render('landing',{loggedIn:true});
    }
    
});

app.get('/process', function(req,res,next){
  res.render('process');


});

//get admin backend pages

app.get('/backend-admin',function(req,res,next){
     if(!req.session.admin){ return res.redirect('login');}
   completeUser.find({}, function(err, users){
     if(err){ console.log(err);}
     else{
         var total_users = users.length;
         donar.find({}, function(err,donars){
          if(err){ console.log(err);}
          var numDonars = donars.length;
          res.render('backend-admin', {users:users, total_users:total_users,numDonars:numDonars});
         });
       
     }
    });
});

app.get('/allusers',function(req,res,next){
     if(!req.session.admin){ return res.redirect('login');}
    completeUser.find({}, function(err, users){
     if(err){ console.log(err);}
     else{
         var total_users = users.length;
       res.render('allusers', {users:users, total_users:total_users});
     }
    });
  
});


app.get('/backend-admin/all-donars', function(req,res,next){
     if(!req.session.admin){ return res.redirect('login');}
   donar.find({}, function(err,donars){
    if(err){ console.log(err);}
    var grand_total = 0;
    var arr = [];
    for(var i = 0; i < donars.length;i++){
        arr.push(donars[i].amount);
     
    }

     grand_total = arr.reduce(function(prev,next){
        return (prev + next);
     });

    console.log("BIG MONEY SAYS " + " " + grand_total);

    return res.render('all-donars', {donars:donars,grand_total:grand_total});

   });


});





app.get('/level1/quiz1', function(req,res,next){
 res.render('quiz1');

});

//CRUD FOR THE BACKEND

app.delete('/delete', function(req,res,next){
completeUser.findOneAndRemove({_id:req.body.id}, function(err,data){
  if(err){ console.log(err);}
  res.render('backend-admin');
});




});


app.get('/auth/admin/login', function(req,res){
 
    res.render('auth-login');


});

app.get('/admin/logout', function(req,res){
 req.session.destroy(function(err){
   if(err){ return res.render(200,'error404');}
else{
     return res.redirect(200,'/auth/admin/login');
}

   });



});





app.get('/register', function(req,res,next){
    
  res.render('register', {title:'home'});
});

app.get('/dashboard', function(req,res,next){
    if(!req.session.name){
     return res.render('landing');
    }
   
    
         //req.session.name = sessionStorage.getItem('sessName');
         //req.session.name = user.name;
         var sessName = req.session.name;
         completeUser.findOne({name:sessName}, function(err, user){
            if(err){ console.log(err);}
           
            var profile = false;
           
             return  res.render('dashboard',{sessName: sessName, profile:profile, user:user});
            

           
                
            


         });

    

    
    //console.log("This is the session id " + " " + req.session.id);
    
    

});


app.get('/userdashboard', function(req,res,next){
    
  //var file = req.query.file;
  if(!req.session.name){ return res.redirect(200,'login');}
  
                
  
  completeUser.findOne({name: req.session.name},function(err,user){
    if(err){ return res.redirect(200,'error404');}
    if(!user){ return res.redirect(200, 'login');}
     var alltest = user.alltest;
        var len = alltest.length;
        if(len <= 1){
          completeUser.find({'avg':{$ne: 0}})
              .sort({avg:-1})
              .exec(function(err,data){
        return  res.render('userdashboard', {data:data,user:user, sessName: req.session.name}); 
              });




          
        }
        else{
        var total = alltest.reduce(function(prev,next){
        return (prev + next);
        
       });
    var avg = (total /len); 
    user.avg = avg.toFixed(2);
    user.save();

     completeUser.find({'avg':{$ne: 0}})
              .sort({avg:-1})
              .exec(function(err,data){
        return  res.render('userdashboard', {data:data,user:user, sessName: req.session.name}); 
              });
    
     
    }
       

      
     
   });


         
    });






app.get('/login', function(req,res,next){
   
    
  res.render('login');
});

app.get('/level1', function(req,res,next){
 if(!req.session.name){ return res.redirect(200,'login');}

 
    
     else{
         var loggedIn = true;
         

        
       






          return  res.render('level1', {sessName:req.session.name,loggedIn:loggedIn});
     }
    
  
  
});

app.get('/level1-section2', function(req,res,next){
    
    if(!req.session.name){ return res.redirect(200,'login');}
    completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){
     console.log(err);
     }

     if(user.level < 1.2 ){
       //var lsplit = user.level.toString().split('.');
       // var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,'level1');  
     }
    
     else{
         var loggedIn = true;
         var last_score = user.alltest.pop().toString();
          return  res.render('level1-section2', {last_score:last_score, sessName:req.session.name,loggedIn:loggedIn,user:user});
     }
    }); 
  
 
});

app.get('/level1/quiz2', function(req,res,next){
    if(!req.session.name){ loggedIn = false; return res.redirect(200,'login',{loggedIn:loggedIn});}
    loggedIn = true;
    

     
    
    
    return  res.render('quiz2', {sessName:req.session.name,loggedIn:loggedIn});
     



    

});

app.get('/level1-section3', function(req,res,next){
    if(!req.session.name){ return res.redirect(200,'login');}
    completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){
     res.redirect(200,'error404');
     }
    if(user.level == 1.1 || user.level == 0){
     return res.redirect(200,'level1');
    }
      
     if(user.level < 1.3 && user.level != 1.1 && user.level != 0){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }
    
     else{
         var last_score = user.alltest.pop().toString();
          return  res.render('level1-section3', {last_score: last_score,sessName:req.session.name,user:user});
     }
    
    }); 
  
   
});

app.get('/level1/quiz3', function(req,res,next){
    if(!req.session.name){ res.redirect(200,'login');}
  res.render('quiz3',{sessName:req.session.name});
});

app.get('/level1-section4', function(req,res,next){
   if(!req.session.name){ return res.render('login');}
    completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){
     res.render('error404');
     }

     if(user.level < 1.4 && user.level !== 0){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }
    
     else{
          var last_score = user.alltest.pop().toString();
          return  res.render('level1-section4', {user:user,last_score:last_score,sessName:req.session.name});
     }


});

});

app.get('/level1/quiz4', function(req,res,next){
    if(!req.session.name){
      res.redirect(200, 'login');
    }

     completeUser.findOne({name:req.session.name}, function(err,user){
      if(err){ return res.redirect(200, 'error404');}
        
      if(user.level < 1.3 && user.level !== 0 && user.level != 1.1){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }
    else{
      res.render('quiz4',{sessName:req.session.name});
    }




     });

    

  
});

app.get('/level1-section5', function(req,res,next){
    if(!req.session.name){ return res.redirect(200,'login');}
    completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){
     res.redirect(200,'error404');
     }

     if(user.level < 1.5 && user.level !== 0 && user.level != 1.1){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }
    
     else{
          var last_score = user.alltest.pop().toString();
          return  res.render('level1-section5', {user:user,last_score:last_score,sessName:req.session.name});
     }

});

});

app.get('/level1/quiz5', function(req,res,next){
     if(!req.session.name){
      res.redirect(200, 'login');
    }

    completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){ return res.redirect(200,'error404');}
      if(user.level < 1.5 && user.level !== 0 && user.level != 1.1){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }

  else{
      res.render('quiz5',{sessName:req.session.name});
  }

    });

    
  
});


app.get('/level2-section1', function(req,res,next){
   if(!req.session.name){
      res.redirect(200, 'login');
    }

    completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){ return res.redirect(200,'error404');}
      if(user.level < 2.1 && user.level !== 0 && user.level != 1.1){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }

  else{
      var last_score = user.alltest.pop().toString();
      res.render('level2-section1',{user:user,last_score:last_score,sessName: req.session.name,vocabulary:vocabulary});
  }

    });
  
  
  
  
   
});

app.get('/level2-section2', function(req,res,next){
    if(!req.session.name){
      res.redirect(200, 'login');
    }
     //console.log('This is the LEVEL from SECTION 2222222 ' + req.body.level);

    completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){ return res.redirect(200,'error404');}
      if(user.level < 2.2 && user.level !== 0 && user.level != 1.1){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }

  else{
    return  res.render('level2-section2',{sessName: req.session.name,vocabulary:vocabulary});
  }

    });




});

app.get('/level2-section3', function(req,res,next){
   if(!req.session.name){
      res.redirect(200, 'login');
    }

    completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){ return res.redirect(200,'error404');}
      if(user.level < 2.3 && user.level !== 0 && user.level != 1.1){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }

  else{
      res.render('level2-section3',{sessName: req.session.name,vocabulary:vocabulary});
  }

    });
});

app.get('/level3-section1', function(req,res,next){
      if(!req.session.name){
      return  res.redirect(200,'login');
      }
   
      completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){ return res.redirect(200,'error404');}
      if(user.level < 3.1 && user.level !== 0 && user.level != 1.1){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }

  else{
     return  res.render('level3-section1',{sessName: req.session.name,vocabulary:vocabulary});
  }

    });


  
});

app.get('/level3-section2', function(req,res,next){
     if(!req.session.name){
      return  res.redirect(200,'login');
      }
   
      completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){ return res.redirect(200,'error404');}
      if(user.level < 3.2 && user.level !== 0 && user.level != 1.1){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }

  else{
     return  res.render('level3-section2',{sessName: req.session.name,vocabulary:vocabulary});
  }

    });

    
  // res.render('level3-section2',{sessName: req.session.name});
});

app.get('/level3-section3', function(req,res,next){
    if(!req.session.name){
      return  res.redirect(200,'login');
      }
   
      completeUser.findOne({name:req.session.name}, function(err,user){
     if(err){ return res.redirect(200,'error404');}
      if(user.level < 3.2 && user.level !== 0 && user.level != 1.1){
       var lsplit = user.level.toString().split('.');
        var str = "level"+lsplit[0]+"-"+"section"+lsplit[1]; 
       return  res.redirect(200,str);  
     }

  else{
     return  res.render('level3-section3',{sessName: req.session.name,vocabulary:vocabulary});
  }

    });

});

app.get('/error404', function(req,res){
 res.render('error404');
});

app.get('/logout', function(req,res,next){
   req.session.destroy(function(err){
   if(err){ return res.render(200,'error404');}
else{
    res.redirect(200,'/');
}

   });
});

app.get('/completed', function(req,res,next){
  res.render('completed');
});

app.post('/register', function(req,res,next){
   
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
        // Store hash in your password DB. 
     new completeUser({
    name:req.body.name,
    email: req.body.email,
    password: hash,
    profilePic:'default_profile_avatar.png',
    points:0,
    level:0,
    alltest:0,
    avg:0,
    bestscore:0,
    ranking:0
   


   
}).save(function(err,data){
       if(err){ console.log(err);}
      console.log(data);
     notifier.notify({
          message: 'You have signed up successsfully',
          timeout:10000
      });
   
       




       res.render('login');
   });
    
    
    
    
    });
});
  
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'juniorjr083@gmail.com',
        pass: 'Abutasnimjaz'
    }
});

// setup email data with unicode symbols
var mailOptions = {
    from: '"Fred Foo 👻" <foo@blurdybloop.com>', // sender address
    to: 'jasonpitts63@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
  
});

});



app.post('/login', function(req,res,next){
//console.log('this is the email ' + ' ' + req.body.email);

completeUser.findOne({email:req.body.email}, function(err,user){
       //var pic = user.profilePic;
       console.log('This is the USERRRR ' + ' ' + user);
     if(err){ console.log(err);}
     
     if(!user){ return res.render('register');}
     bcrypt.compare(req.body.password,user.password, function(err, match) {
    if(err){ console.log(err);}
    if(!match){console.log('THE FUUUUCK ' + ' ' + 'No match found');}
  // console.log('The Fuck this is the user object ' + ' ' + user);
   
  // console.log('MOFO this ' +  ' ' + pic);
  console.log('LEVEL STRAIGHT FROM THE DB ' + typeof user.level);
     if(user.level !== 0  && user.level >= 1.2){
    
    req.session.name = user.name;
    req.session.email = user.email;
      var sessName = req.session.name;
      var sessEmail = req.session.email;
      var level = user.level.toString();
      console.log('USER LEVEL IF NOT EQUAL TO 0 ' + ' ' + level);
     
      req.session.cookie.name = sessName;
      req.session.cookie.email = sessEmail;
// console.log("This is the cookie  " + " "  + req.session);
    var payload = { name: user.name };
    var secret = 'xxx';
 
// HS256 secrets are typically 128-bit random strings, for example hex-encoded: 
// var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex) 
 
// encode 
     var token = jwt.encode(payload, secret);
       res.header('Authorization', token);
       res.header('Access-Control-Expose-Headers', 'token');
     
        loggedIn = true;
        var profile = false;
        var lsplit = level.split('.');
        var str = "/level"+lsplit[0]+"-"+"section"+lsplit[1];
       
        
  return res.send({str:str, user:user, sessName:sessName, loggedIn:loggedIn});
         



     }
   
     /*if(pic !== ""){
         req.session.name = user.name;
      var sessName = req.session.name;
      var payload = { name: user.name };
    var secret = 'xxx';
 
// HS256 secrets are typically 128-bit random strings, for example hex-encoded: 
// var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex) 
 
// encode 
     var token = jwt.encode(payload, secret);
       res.header('Authorization', token);
       res.header('Access-Control-Expose-Headers', 'token');
     
        loggedIn = true;
      return   res.render('dashboard',{user:user, sessName: sessName, profile:true});
     }*/
     
       if(user.level == 0 || user.level == 1.1){
         req.session.name = user.name;
         req.session.email = user.email;
      var sessName = req.session.name;
      var sessEmail = req.session.email;
      var level = user.level.toString();
      console.log('USER IF == 0 ' + ' ' + level);
     
      req.session.cookie.name = sessName;
      req.session.cookie.email = sessEmail;
// console.log("This is the cookie  " + " "  + req.session);
    var payload = { name: user.name };
    var secret = 'xxx';
 
// HS256 secrets are typically 128-bit random strings, for example hex-encoded: 
// var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex) 
 
// encode 
     var token = jwt.encode(payload, secret);
       res.header('Authorization', token);
       res.header('Access-Control-Expose-Headers', 'token');
     
        loggedIn = true;
        var profile = false;
         //var lsplit = level.split('.');
       // var str = "level"+lsplit[0]+"-"+"section"+lsplit[1];
           var str = "/level1";
          return res.send({str:str,user:user, sessName:sessName});
       }
     

      });
     


   });

    
 
});



app.post('/userdashboard', upload.single('file'), function(req,res,next){
   // console.log('REQUEST FILE ' + ' ' + req.files[0]);
   
   
  // console.log('Regexp ' + ' ' + pic);
   
    var pic = req.body.file;
    completeUser.findOneAndUpdate({name:req.session.name}, {profilePic:pic},function(err,user){
    if(err){ console.log(err);}
   
       var profile = true;
      
       //user.profilePic = pic;
       
        console.log('Need the file name ' + ' ' + pic);
       console.log("Data from the callback" + " " + user);
      return  res.send({user:user, sessName:req.session.name,profile:profile});
   
   });







   
   
  
  
  
});


app.post('/level1/quiz1', function(req,res,next){
    if(!req.session.name){
     return res.render('login');
    }

   if(req.body.level !=""){
    var level = req.body.level;
    var score = req.body.score;
     var points = score * 5;
    completeUser.findOneAndUpdate({name:req.session.name}, {points:points,level:level,$push:{alltest:score}}, function(err,user){
     if(err){ return res.render('error404');}
     if(!user){ res.render('error404');}
     user.points = user.points + points;
        return res.send({score:score});
    });

}

 });


app.post('/level1/quiz2', function(req,res,next){
     if(!req.session.name){
    return  res.render('login');
     }
    //console.log('Cookie anme ' + ' ' + req.body.name);
    var incoming = req.body.score;
    //console.log("This is the type " + typeof incoming);
     var score = incoming * 14;
    
    var points = score * 3;
    
    
    if(score > 65){
     completeUser.findOneAndUpdate({name:req.session.name},{level:1.3,points:points,$push:{alltest:score}}, function(err,user){
     if(err){ res.render('error404');}
     if(!user){ console.log('No user was found');}
    console.log("Greater than 65 " + " " + score);
        user.alltest.push(score);
        user.points = user.points + points;
        user.save();
        var alltest = user.alltest;
        var len = alltest.length;
        var total = alltest.reduce(function(prev,next){
        return (prev + next);
        
       });

    var avg = (total /len); 
    user.avg = avg;
    user.save();
    console.log(user.avg);
        res.send({score:score});
     });
     }


     if(score < 65){
      var score = incoming * 14;
   console.log("Less than 65 " + " " + score);
    var points = score * 3;
   

    completeUser.findOneAndUpdate({name:req.session.name},{points:points,$push:{alltest:score}}, function(err, user){
   if(err){ return res.render('error404');}
   if(!user){ console.log('No user was found');}
    
        user.alltest.push(score);
        user.points = user.points + points;
         var alltest = user.alltest;
        var len = alltest.length;
        var total = alltest.reduce(function(prev,next){
        return (prev + next);
        
       });

    var avg = (total /len); 
    user.avg = avg;
    user.save();
    console.log(user.avg);
        res.send({score:score});
    
  });



     }
    
   
    
    
    

});

app.post('/level1/quiz3', function(req,res,next){
    if(!req.session.name){
    return  res.render('login');
     }
    //console.log('Cookie anme ' + ' ' + req.body.name);
    var incoming = req.body.score;
    //console.log("This is the type " + typeof incoming);
     var score = incoming * 14;
    console.log(score);
    var points = score * 3;
    
    
    if(score > 65){
     completeUser.findOneAndUpdate({name:req.session.name},{level:1.4,points:points,$push:{alltest:score}}, function(err,user){
     if(err){ res.render('error404');}
     if(!user){ console.log('No user was found');}
    
        user.alltest.push(score);
        user.points = user.points + points;
        res.send({score:score});
     });
     }


     if(score < 65){
      var score = incoming * 14;
    console.log(score);
    var points = score * 3;
    score = score + 2;

    completeUser.findOneAndUpdate({name:req.session.name},{points:points,$push:{alltest:score}}, function(err, user){
   if(err){ return res.render('error404');}
   if(!user){ console.log('No user was found');}
    
        user.alltest.push(score);
        user.points = user.points + points;
        res.send({score:score});
    
  });



     }
    
   
    

});


app.post('/level1/quiz4', function(req,res,next){
    console.log('Cookie anme ' + ' ' + req.body.name);
    var incoming = req.body.score;
    var score = incoming * 14;
    score = score + 2;
    var points = score * 3;
    var level = 0;
    if(score >= 65){
      level= 1.5;

       completeUser.findOneAndUpdate({name:req.body.name},{level:level,$push:{alltest:score}}, function(err, user){
   if(err){ console.log(err);}
   if(!user){ console.log('No user was found');}
    else{
        user.alltest.push(score);
        return res.send({score:score});
    }
  });
    }

    else{
      completeUser.findOneAndUpdate({name:req.body.name},{score:score,$push:{alltest:score}}, function(err, user){
   if(err){ console.log(err);}
   if(!user){ console.log('No user was found');}
    else{
        user.alltest.push(score);
        return res.send({score:score});
    }
  });


    }

 

});


app.post('/level1/quiz5', function(req,res,next){
    console.log('Cookie anme ' + ' ' + req.body.name);
    var incoming = req.body.score;
    var score = incoming * 5;
    var points = score * 5;

    if(score >= 80){
         var level = 2.1;
        completeUser.findOneAndUpdate({name:req.body.name},{level:level,points:points,$push:{alltest:score}}, function(err, user){
     if(err){ console.log(err);}
     if(!user){ console.log('No user was found');}
           
           return  res.send({score:score, level:level});
           });
        }

   
 else if(score < 79 && score >= 71 ){
    var level = 1.4;
    completeUser.findOneAndUpdate({name:req.session.name},{level:level,points:points,$push:{alltest:score}}, function(err, user){
     if(err){ console.log(err);}
     if(!user){ console.log('No user was found');}
           
           return  res.send({score:score, level:level});
           });
        }


 else if(score <= 78 && score >= 70){
    var level = 1.3;
     completeUser.findOneAndUpdate({name:req.session.name},{level:level,points:points,$push:{alltest:score}}, function(err, user){
     if(err){ console.log(err);}
     if(!user){ console.log('No user was found');}
           
           return  res.send({score:score, level:level});
           });
        }

        
        
else if(score <= 77 && score >= 65){
    var level = 1.2;
    completeUser.findOneAndUpdate({name:req.session.name},{level:level,points:points,$push:{alltest:score}}, function(err, user){
     if(err){ console.log(err);}
     if(!user){ console.log('No user was found');}
           
           return  res.send({score:score, level:level});
           });
        }

 else{
     var level = 1.1;
     completeUser.findOneAndUpdate({name:req.session.name},{level:level,points:points,$push:{alltest:score}}, function(err, user){
         if(err){ console.log(err);}
     if(!user){ console.log('No user was found');}
           var str = "level1";
           return  res.send({score:score, level:level});
           });
        }

       
    
  });


app.post('/level2-section2', function(req,res,next){
 var level = req.body.level;
 completeUser.findOneAndUpdate({name:req.body.name}, {level:level}, function(err, user){
   if(err){
    return res.redirect(200, 'error404');
   }
    return res.render('level2-section2');


 });


});


app.post('/level2-section3', function(req,res,next){
 var level = req.body.level;
 completeUser.findOneAndUpdate({name:req.body.name}, {level:level}, function(err, user){
   if(err){
    return res.redirect(200, 'error404');
   }
    return res.render('level2-section3');


 });


});


app.post('/level3-section1', function(req,res,next){
 var level = req.body.level;
 completeUser.findOneAndUpdate({name:req.body.name}, {level:level}, function(err, user){
   if(err){
    return res.redirect(200, 'error404');
   }
    return res.render('level3-section1');


 });


});

app.post('/level3-section2', function(req,res,next){
 var level = req.body.level;
 completeUser.findOneAndUpdate({name:req.body.name}, {level:level}, function(err, user){
   if(err){
    return res.redirect(200, 'error404');
   }
    return res.render('level3-section2');


 });


});

app.post('/final', function(req,res,next){
 if(!req.session.name){ return res.redirect(200,'login');}
 console.log('THE FUCK ' + ' ' + req.body.score);
 var score = req.body.score * 5;
 var points = score * 8;
 completeUser.findOneAndUpdate({name:req.session.name}, {$push:{alltest:score}}, function(err,user){
  if(err){ return res.redirect(200,'error404');}
  user.points = user.points + points;
  user.save();
  return res.send({user:user,score:score});
 });


});


app.post('/ranking', function(req,res,next){
 var name = req.body.name;
 var allUsers = '';
 //allUsers = completeUser.find({}).count();
 var picked = '';
   completeUser.find({'avg':{$ne: 0}})
              .sort({avg:-1})
              .exec(function(err,data){
              if(err){ console.log(err);}
              
                picked  = data.find(function(o,i,a){
                   if(o.name == name){
                       console.log("FOund Object " +" " + o);
                    return o;
                   } 
                
                

               });
             //console.log('no dice' + picked);
                
             if(picked){
function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
 
for (var i = 0; i < arraytosearch.length; i++) {
 
if (arraytosearch[i][key] == valuetosearch) {
return i;
}
}
return null;
}

var index = functiontofindIndexByKeyValue(data, "name", name);
index = (index + 1);
 
  completeUser.findOneAndUpdate({name:name}, {ranking:index}, function(err, userwithrank){
    if(err){ console.log(err);}
     return res.send({user:userwithrank});
  });

                }               
 if(!picked){
                   completeUser.find({}, function(err,users){
                    if(err){ console.log(err);}
                    var lowrank =  users.length;
                    completeUser.findOneAndUpdate({name:name},{ranking:lowrank},function(err,user){
                       // console.log("BUZZ " + " " + lowrank);
                    return res.send({user:user});
                    });
                    
                   });

               }

               
        });
              });



app.post('/process', function(req,res,next){

var token  = req.body.stripeToken;
var chargeAmount = req.body.chargeAmount;
var email = req.session.email;
console.log("Sent FROM EMAIL " + ' ' + email);
new donar({
    email: email,
    amount: chargeAmount,
    token:token

}).save(function(err, user){
    if(err){ console.log(err);}
    console.log('Payment accepted ' + ' ' + user);
});


var charge = stripe.charges.create({
 amount:chargeAmount,
 currency:"usd",
 source:token
}, function(err,charge){
  if(err && err.type == "StripeCardError"){ console.log("Who you trying to play");}


});
   res.redirect(200, 'process');
});



app.post('/allusers', function(req,res){
    if(!req.session.admin){ return res.redirect('login');}
    console.log('Admin email ' + ' ' + req.body.admin + " " + "admin pass " +" " + req.body.adminpass);
 bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.adminpass, salt, function(err, hash) {
        // Store hash in your password DB. 
       
     new Admin({
    
    email: req.body.admin,
    password: hash
   
   }).save(function(err,data){
       if(err){ console.log("errrrrrrrrrrr!!!!!");}
      
       
       console.log("Admin data " + data);
    
   
       




       return res.redirect(200,'/auth/admin/login');
   });
    
    
    
    
    });
});


});


app.post('/auth/admin/login', function(req,res){
 Admin.findOne({email:req.body.admin}, function(err,user){
 if(err){ return res.redirect(200, '/auth/admin/login');}
  bcrypt.compare(req.body.adminpass,user.password, function(err, match) {
    if(!match){ return res.redirect(200,'/auth/admin/login');}
      req.session.admin = user.password;
      
        return res.redirect(200, '/backend-admin');


  });
 
});

});




app.listen(PORT, function(){
    console.log('The server is listening on port 4600');
});
 


