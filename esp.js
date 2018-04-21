const WIFI_NAME = "Struggles8";
const WIFI_OPTIONS = { password : "DootDOotDOOtDOOT" };

console.log = function(){};

var arr = new Uint8ClampedArray(24 * 4);

var curCol = {
  r: 0,
  g: 0,
  b: 0
};

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
      onConnect(info);
    });
  });
});

function identify(udp, idBuf){
  udp.send(idBuf, 0, idBuf.length, 8000, '192.168.0.255');
}


function onConnect(ipv4){
  const dgram = require('dgram');

  let udp = dgram.createSocket('udp4');

  udp.bind(8000, function(err){
    if(err){
      console.log(err);
    }

    let identity = { ip: ipv4.ip, mac: ipv4.mac };
    let idBuf = JSON.stringify(identity);

    identify(udp, idBuf);

    setInterval(function(){
      setColor(curCol);
    }, 150);

    udp.on('message', function(msg){
      console.log(msg);
      if(msg == 'ping'){
        identify(udp, idBuf);
      }
      let state = msg.split(',');
      if(state.length == 3){
        curCol.r = parseInt(state[0]);
        curCol.g = parseInt(state[1]);
        curCol.b = parseInt(state[2]);
      }
    });

    udp.on('close', function(){
      setColor({ r: 30, g: 0, b: 0 });
    });
  });

  setColor(curCol);
}

function setColor(color){
  for (var i=0;i<arr.length;i+=3) {
    arr[i  ] = color.g;
    arr[i+1] = color.r;
    arr[i+2] = color.b;
  }
  neopixel.write(B5, arr);
}

save();
