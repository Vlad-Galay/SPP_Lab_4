var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var fs = require("fs");
let middleware = require('./middleware');
const http = require("http");
const socketIO = require("socket.io");

var app = express();
const server = http.createServer(app);
const io = socketIO(server);

var cors = require('cors');
var jsonParser = bodyParser.json();

//app.use(express.static(__dirname + "/public"));
app.use(cors());
app.use(cookieParser());


io.on("connection", socket => {

      socket.on("GET", () => {

        var content = fs.readFileSync("comps.json", "utf8");
        
        io.sockets.emit("get_data", content);
        console.log("GET");
      });

      socket.on("PUT", comp => {

        var tempcomp = JSON.parse(comp)
          var compId = tempcomp.id; 
          console.log(compId);
        var data = fs.readFileSync("comps.json", "utf8");
        var comps = JSON.parse(data);
        var comp;

        for(var i=0; i<comps.length; i++){
            if(comps[i].id==compId){
                comp = comps[i];
                break;
            }
        }
        //modify data
        if(comp){
            comp.mark = tempcomp.mark;
            comp.model = tempcomp.model;
            comp.year = tempcomp.year;
            var data = JSON.stringify(comps);
            fs.writeFileSync("comps.json", data);
            io.sockets.emit("change_data", data);
        }
              
    });
    
    
      socket.on("DELETE", Id => {



          var id = Id;
    var data = fs.readFileSync("comps.json", "utf8");
    var comps = JSON.parse(data);
    var index = -1;

    //search comp index
    for(var i=0; i<comps.length; i++){
        if(comps[i].id==id){
            index=i;
            break;
        }
    }

    if(index > -1){
        //delete comp 
        var comp = comps.splice(index, 1)[0];//deleted element
        var data = JSON.stringify(comps);
        fs.writeFileSync("comps.json", data);
        //send deleted comp
        io.sockets.emit("change_data", data);
    }
    else{
        //res.status(404).send();
    }
      });
    
    
    socket.on("POST", comp => {

          //var comp = {mark: req.body.mark, model: req.body.model, year: req.body.year};
            var comp = JSON.parse(comp);
          console.log(comp);
            var data = fs.readFileSync("comps.json", "utf8");
            var comps = JSON.parse(data);
     
            if (comps.length === 0){
                comp.id = 1;
            } else {
                var id = Math.max.apply(Math,comps.map(function(o){return o.id;}))
                comp.id = id+1;
            }

            //add comp
            comps.push(comp);
            var data = JSON.stringify(comps);
            //rewrite file
            fs.writeFileSync("comps.json", data);
            io.sockets.emit("change_data", data);
    });
    
    // disconnect is fired when a client leaves the server
      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });




server.listen(8080, () => console.log(`Listening on port ${8080}`));