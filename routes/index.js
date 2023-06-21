var express = require('express');
var router = express.Router();
var userModel = require("./users")
var passport = require('passport')
var localStrategy = require('passport-local')
var multer = require("multer")
const path = require('path');
const users = require('./users');
var passportLocalMongoose = require( 'passport-local-mongoose');
passport.use(userModel.createStrategy());



// multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    var fn = Math.floor(Math.random()*10000000) + dt.getTime() + path.extname(file.originalname)
    cb(null, fn)
  }
})

// file filter 
function fileFilter (req, file, cb) {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'|| file.mimetype === 'image/svg' || file.mimetype === 'image/webp'){
    cb(null, true)
  }
  else{
    cb(new Error('don"t walk fast.'),false)
  }
}
const upload = multer({ storage: storage, fileFilter: fileFilter})


router.post('/upload',isLoggedIn, upload.single('image'), function(req, res) {
  // res.send('uploaded');
  userModel.findOne({username:req.session.passport.user}).then((loggeduser)=>{
    loggeduser.image = req.file.filename
    loggeduser.save()
  }).then(()=>{ 
    res.redirect('back');
  })
});



//local strategies 
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/feed', isLoggedIn,function(req, res, next) {
  userModel.find().then(function(alluser){
    res.render("alluser",{alluser})
  })
});
// phle find kro ki like array me loggedin user hia ya nahi 

router.get('/like/:id', isLoggedIn,function(req, res, next) {
  userModel.findOne({_id: req.params.id}).then(function(user){
    var indexJisParMila = user.like.indexOf(req.session.passport.user)
    if(indexJisParMila === -1){
      user.like.push(req.session.passport.user);
    }
    else{
      user.like.splice(indexJisParMila, 1)
    }
    user.save().then(function(){
      res.redirect("back");
    });
  })
});


router.get('/profile', isLoggedIn,function(req, res, next) {
  // res.send("hello")
  // var username = req.session.passport.user;
  userModel.findOne({username: req.session.passport.user}).then(function(founduser){

    res.render('profile',{user: founduser})
  })
  // console.log(req.session.passport.user);
  // res.render('profile')
});




router.post('/register', (req, res, next) => {
var newUser = {
//user data here
    username: req.body.username,
    email: req.body.email,
    number: req.body.number,
    image: req.body.image
//user data here
};
userModel
.register(newUser, req.body.password)
.then((result) => {
passport.authenticate('local')(req, res, () => {
//destination after user register
res.redirect('/profile');
});
})
.catch((err) => {
res.send(err);
});
});

router.post("/login",passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/'
}),function(req,res,next){});


function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}

router.get('/logout', (req, res, next) => {
if (req.isAuthenticated())
req.logout((err) => {
if (err) res.send(err);
else res.redirect('/');
});

});

module.exports = router;
