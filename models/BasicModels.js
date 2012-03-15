var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
  
var Users = new Schema({
    uid  : {type:String},
    username: {type:String}
});

// middleware
//Users.pre('save', function (next,done) {
//    if(!done){
//        console.log("something wrong..eehh");
//    }else{
//        console.log("user has been create successfully");
//        next();
//    }
//});

//Users.pre('remove',function(next,done){
//    console.log("remove data on schema users");
//});

Users.methods.getId = function(models,id){
    models.findById( id, function (err, found) {
      return found.username;
    });
}


//registered on mongoose models
mongoose.model("Users",Users);