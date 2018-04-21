const dgram = require('dgram');
const fs = require('fs');

let udp = dgram.createSocket('udp4');
let sACN = dgram.createSocket('udp4');

let dmxData = new Uint8ClampedArray(512).fill(0);

let patch = JSON.parse(fs.readFileSync('patch.json'));

udp.bind(8000, function(err){
  if(err){
    throw err;
  }
  setInterval(function(){
    sendData();
  }, 150);
});

udp.on('message', function(msg){
  try {
    let info = JSON.parse(msg);
    console.log(info);
  } catch (e) {
    //console.log(e);
  }
});

sACN.bind(5568, function(err){
  if(err){
    throw(err);
  }

  sACN.addMembership('239.255.0.1');

  sACN.on('message', function (msg, remote) {
    let data = new Uint8ClampedArray(msg);
    let packet = msg.toString('hex');
    let startCode = packet.substr(249, 2);
    if (startCode == '10'){
      dmxData = data.slice(data.length - 512, data.length - 1);
    }
  });
});

function sendData(){
  for(let i = 0; i < patch.length; i++){
    let s1 = patch[i].dmx - 1;
    let fxData = dmxData.slice(s1, (s1 + 3));
    let str = fxData[0] + "," + fxData[1] + ',' + fxData[2];
    udp.send(str, 8000, patch[i].ip);
    console.log("Send: " + fxData);
  }
}
