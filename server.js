// server.js
// where your node app starts

// init project
var express = require('express');
var mongodb = require('mongodb').MongoClient;
var murl = "mongodb://user:"+process.env.PASSWORD+"@ds034677.mlab.com:34677/urlshortener";
var id = 0;
var app = express();

//check if string is URL, returns boolean
function isURL(url){
  //rudimentary check if string follows the http:// url format
  if(url.substring(0,7) == "http://" || url.substring(0,8) == "https://"){
    return true;
  }
  return false;
}


//ensures that ID order is maintained, even through a restart of server.js
function setLastID(){
  mongodb.connect(murl, function(err, db){
    db.collection("urls").find().toArray(function(err, docs){
      id = docs.length;
      console.log("id=" + id);
      
    });
  });
}


setLastID();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));



app.get("/", function(request, response){
  response.sendFile(__dirname + '/views/index.html');
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/:ID", function (request, response) {
  mongodb.connect(murl, function(err, db){
    db.collection("urls").find({ "id": { $eq: parseInt(request.params.ID)}   }).toArray(function(err, docs){
      if(docs.length == 0){
        response.json({"error":"url not found"});
      }
      else{
        response.redirect(docs[0]["url"]);
        
      }
      
      
      
    });
  });
});

app.get("/new/*", function(request, response) {
  id += 1;
  var boo = false;
  mongodb.connect(murl, function(err, db){
    if(isURL(request.params[0])){
      var obj = {"id": id, "url": request.params[0]};
      console.log("creating");
      db.collection("urls").insertOne(obj, function(err, res ){
        db.close();
      });
      response.json({"original-url": request.params[0], "short-url":"myk-short-url.glitch.me/"+id});
    }
    else{
      console.log("bad url!");
      response.json({"error": "invalid url"});
    }
    
  });

});



// Simple in-memory store for now
var urls = [];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
