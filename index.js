const app = require("express")();
const server = require("http")(app);
const io = require("socket.io")(server);
const cryptoRandomString = require('crypto-random-string');
var activePairs=[];
class Pairs {
  socketone;
  sockettwo;
  code;

  constructor(socket) {
    this.socketone = socket;
    this.code = cryptoRandomString(10);
  }
  setPair(socket){
    this.sockettwo = socket;
  }

}

var host = io.of("/host");
var guest = io.of("/guest");
host.on("connection",(socket)=>{
thisPair=new Pairs(socket);
activePairs.push(thisPair);
socket.emit("Code",thisPair.code);


})
