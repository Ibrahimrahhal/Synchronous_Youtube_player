const express= require("express")
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cryptoRandomString = require('crypto-random-string');
const hbs = require("express-handlebars");
const path = require("path");
var clientConnected = 0;
var activePairs=[];
app.use("/assets",express.static(path.join(__dirname, 'assets')));
app.engine("hbs",hbs());
app.set("view engine","hbs");

class Pairs {


  constructor(socket) {
    this.socketone = socket;
    this.code = cryptoRandomString(10);
  }
  setPair(socket){
    this.sockettwo = socket;
  }
  setUrl(url){
    this.url =url;

  }

}
app.get("/",(req,res)=> {
res.render("welcome");
});
app.get("/host",(req,res)=> {
  if(req.query.url === null) {res.send("no url")} else{

let url=req.query.url;
res.render("host",{url:url});}
});
app.get("/disconnected",(req,res)=>{
  res.render("message",{title:"Disconnected",resala:"Sorry, Your Host Has Disconnected"});
});
app.get("/urlerror",(req,res)=>{
  res.render("message",{title:"Wrong URL",resala:"Sorry, You Have Submitted an Invalid URL"});
});
app.get("/guest",(req,res)=> {
let code = req.query.code;
let url ="";
let found = false;
activePairs.forEach((x)=>{
if(x.code ===code){
  url =x.url;
  found = true;
}});
if(found)
res.render("guest",{url:url,code:code});
else
  res.render("message",{title:"Code Not Found",resala:"Sorry, You Have Submitted an Invalid Invitaion Code"});



});
var host = io.of("/host");
var guest = io.of("/guest");


host.on("connection",(socket)=>{
clientConnected++;
var thisPair=new Pairs(socket);
var index;
socket.on("url",(url)=>{
thisPair.setUrl(url);
activePairs.push(thisPair);

socket.emit("Code",thisPair.code);

for(let i =0 ;i <activePairs.length;i++){
  if(activePairs[i].code === thisPair.code){
    index = i;
    break;
  }

}
});

socket.on("seek",(time)=>{
activePairs[index].sockettwo.emit("seek",time);

});
socket.on("play",(time)=>{
emitGuest("play",time);
});
socket.on('disconnect', (reason) => {
  emitGuest("pairDisconnected");
  activePairs[index].code="z";
  if(clientConnected === 0){
    activePairs=[];

  }
  });
socket.on("pause",()=>{
emitGuest("pause");
});
socket.on("sms",(data)=>{
  emitGuest("sms",data);
});
function emitGuest(str){
  if(activePairs[index].sockettwo)
  {
activePairs[index].sockettwo.emit(str);
clientConnected--;
}
}
function emitGuest(str,arg){
  if(activePairs[index].sockettwo)
activePairs[index].sockettwo.emit(str,arg);
}

});


guest.on("connection",(socket)=>{
  var thisPair;


  socket.on("code",(code)=>{
    for(let i =0 ;i <activePairs.length;i++){
      if(activePairs[i].code === code){
        thisPair = i;
        break;
      }
  }
  activePairs[thisPair].setPair(socket);
  activePairs[thisPair].socketone.emit("pairConnected");
  socket.on("getTime",()=>{
  activePairs[thisPair].socketone.emit("getTime");
  });
  socket.on("pause",()=>{
  activePairs[thisPair].socketone.emit("pause");
  });
  socket.on("play",(time)=>{
  activePairs[thisPair].socketone.emit("play",time);
  });
  socket.on("sms",(data)=>{
    activePairs[thisPair].socketone.emit("sms",data);
  });
  socket.on("disconnect",()=>{
  activePairs[thisPair].socketone.emit("pairDisconnected");



  });
});





});

server.listen(3000,()=>{});
