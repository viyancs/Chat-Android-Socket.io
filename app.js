/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , io = require('socket.io').listen(3001)
  , mongoose = require('mongoose')
  , models = require('./models/BasicModels');
  /*, async = require('async');
  , javaServer = require('net').createServer();*/
  
/*
 * configuration express web framework
 */ 
var app = module.exports = express.createServer();



/*
 * create connection to mongodb
 * create a model from schema
 * create new object from model
 * =============================================================================
 * */
var conn = mongoose.createConnection('mongodb://localhost/vynchat');
var Users = conn.model('Users', Users);
var users = new Users();

//initializing object 
var fn = {};
var alluser = {};

/*
 * seaching by id => cM is model,id is string 
 */
fn.find = function(cM,id){
    cM.findById( id, function (err, found) {
      return found.username;
    });
}

/*
 * seaching by query
 */
fn.findQuery = function(cM,data,handler){  
    var query = cM.find({});
    query.where(data.field, data.value);
    query.exec(function (err, docs) {
        if(!err){
            handler(docs);
        }else{
            console.log("opps...something wrong whenss findQuery...")
        }

    });
}

/*
 * delete all data from database => cn is collection name ----- not tested
 */
fn.drop = function(cM){
    cM.find({}, function (err, docs) {
        if (err) return console.log(err);
        if (!docs || !Array.isArray(docs) || docs.length === 0) 
            return console.log('no docs found');
        docs.forEach( function (doc) {
            doc.remove();
        });

    });
}

/*
 * delete data byID =>cn is collection name, id is string
 */
fn.dropById = function(cM,id){
    cM.findById(id, function (err, docs) {
        console.log(docs);
        if(!err){
            docs.remove();
            docs.save(function(err){
                err ? console.log("something wrong"):console.log("delete id = " + id + " successfull");
                console.log(fn.loadData(Users));
            });
        }
    });
}

/*
 * select all row in database
 */
fn.loadData = function(cM,callback){
   cM.find({},function (err, found) {
       err ? callback("oops...somethis wrong when loadData") : callback(found);
    });
}

//fn.drop(Users)
//    
//fn.loadData(Users,function(data){   
//   console.log(data);
//});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/twitter',routes.twitter);

/*
 *get user online
 */
function loadUserOnline(idSocket){
    fn.loadData(Users,function(datas){
        console.log(datas);
        io.sockets.emit("online",{online:datas,socketId:idSocket}); 
        //io.sockets.socket(idSocket).emit("welcome",{welcome:idSocket});
    });
}
/*
 * get chat
 */
function chat(user,socket,message){
     //checking user
     fn.findQuery(Users,{field:"username",value:user},function(docs){
         console.log("pengirim socket" + socket.id);
         console.log(docs);
         console.log("penerima socket" + docs[0].uid);
         io.sockets.socket(docs[0].uid).emit("chat",{msg:message});
     });

}
//socket io configuration
io.sockets.on('connection', function (socket) {

    //fn.find(Users,"id");
    console.log("client with id  " + socket.id +" is connected");
    socket.on('chat',function(data){
        chat(data.user,socket,data.msg);
        //socket.emit("chat",{msg:"hai juga .. gimana kabarnya..?"});
    });
    socket.on('login',function(data){
	console.log("username  :  " + data.username + " is login");
        var uon = new Users();
        uon.username = data.username;
        uon.uid = socket.id;
        uon.save(function(err,data){
            if(!err){
                loadUserOnline(socket.id);
            }else{
                console.log("oops...something wrong in socket login");
            }           

        });
    });
    

    //console.log(socket);
});

//javasocket configuration
/*javaServer.on('error',function(e){
 	console.log("Server Error  :" + e.code);
});
javaServer.on('listening',function(){

	console.log("Server is Listening on 8081");
});
javaServer.on('close',function(){
	console.log("server closed");
});
javaServer.on("connection",function(javaSocket){
        
	var clientAddress = javaSocket.address().address + ':' + javaSocket.address().port;
	console.log("Java" + clientAddress + "connected");
        javaServer.emit("hello",{colek:"hai kemana ja sih loe gua ping ngga replly2!!"});
	var firstDataListener = function(data){
		console.log("Receive namespace from java : " + data);
		javaSocket.removeListener("data",firstDataListener);
		createNamespace(data,javaSocket);
                console.log("lewaat");
	};
	javaSocket.on('data',firstDataListener);
	javaSocket.on("close",function(){
		console.log("Java " + clientAddress + 'disconnected');
	});

});

javaServer.listen(8081);
function createNamespace(namespaceName, javaSocket) {
 var browserConnectionListenner = function (browserSocket) {
  console.log('Browser Connected');
  var javaSocketDataListenner = function(data) {
   console.log('Data received from java socket and sent to browser: ' + data);
   browserSocket.emit('m', data + '\r\n');
  }

  var javaSocketClosedListenner = function() {
   console.log('The java socket that was providing data has been closed, removing namespace'); 
   browserSocket.disconnect();
   io.of('/' + namespaceName).removeListener('connection', browserConnectionListenner);
   javaSocket.removeListener('data', javaSocketDataListenner);
   javaSocket.removeListener('close', javaSocketClosedListenner);
  }

  javaSocket.on('close', javaSocketClosedListenner);
  javaSocket.on('data', javaSocketDataListenner);

  browserSocket.on('disconnect', function () {
   console.log('Browser Disconnected');
   javaSocket.removeListener('data', javaSocketDataListenner);
   javaSocket.removeListener('close', javaSocketClosedListenner);
  });
 }

 var namespace = io.of('/' + namespaceName).on('connection', browserConnectionListenner);
}*/
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

