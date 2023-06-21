var mongoose = require("mongoose")
var plm = require("passport-local-mongoose")
 
mongoose.connect("mongodb://127.0.0.1:27017/paassdb")

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  number: Number,
  image: {
    type: String,
    default: "default.jpg"
  },
  like:{
    default: [],
    type:Array
  }

});

userSchema.plugin(plm)

module.exports = mongoose.model("users", userSchema)