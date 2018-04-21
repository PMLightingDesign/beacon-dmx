const dgram = require('dgram');

let udp = dgram.createSocket('udp4');
udp.bind(8000, function(err){
  if(err){
    throw err;
  } else {
    udp.setBroadcast(true);
    udp.send('ping', 8000, "192.168.0.255");

    setTimeout(function(){
      udp.close();
    },5000);
  }
});

udp.on('message', function(msg){
  try {
    let info = JSON.parse(msg);
    console.log(info);
  } catch (e) {
    //console.log(e);
  }
});
