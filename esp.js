const WIFI_NAME = "Clear Story";
const WIFI_OPTIONS = { password : "Rubber=Duck!" };

//console.log = function(){};

var arr = new Uint8ClampedArray(24 * 3);

var curCol = {
  r: 255,
  g: 0,
  b: 0
};

let write = 1;

//Modules
var wifi = require("EspruinoWiFi");
var neopixel = require("neopixel");

E.on('init', function() {
  setColor({
    r: 50,
    g: 0,
    b: 0
  });
  wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err) {
    if (err) {
      console.log("Connection error: "+err);
      return;
    }
    console.log("Connected!");
    wifi.getIP(function(err, info){
      console.log(info.ip);
      console.log(info.mac);
      onConnect(info);
    });
  });
});

let udp;
let idBuf;

function identify(){
  udp.send(idBuf, 0, idBuf.length, 8000, '192.168.1.255');
}

let state;

function onConnect(ipv4){
  const dgram = require('dgram');

  udp = dgram.createSocket('udp4');

  udp.bind(8000, function(err){
    if(err){
      console.log(err);
    }

    let identity = { ip: ipv4.ip, mac: ipv4.mac };
    idBuf = JSON.stringify(identity);

    identify(udp, idBuf);

    udp.on('message', process);

    udp.on('close', function(){
      setColor({ r: 30, g: 0, b: 0 });
    });
  });

  setColor(curCol);
}

function process(msg){
  if(msg == 'ping'){
    identify();
  }
  state = msg.split(',');
  if(state.length == 3){
    curCol.r = parseInt(state[0]);
    curCol.g = parseInt(state[1]);
    curCol.b = parseInt(state[2]);
  }
  setColor(curCol);
}

function setColor(color){
  //'compiled';
  if(write == 1){
    write = 0;
    for (var i=0;i<arr.length;i+=3) {
      arr[i  ] = color.g;
      arr[i+1] = color.r;
      arr[i+2] = color.b;
    }
    neopixel.write(B5, arr);
    write = 1;
  }

}
