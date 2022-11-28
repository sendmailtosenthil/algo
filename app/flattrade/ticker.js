const WebSocket = require ('ws');

let connectionTimeout=1000;

let Ticker = function(emitter) {
  let ticker = Object.create({...Actions, emitter});
  return ticker.init();
}

let Actions = {
  init(){
    console.log('Init ticker')
    this.ws = new WebSocket (process.env.socketUrl);
    this.connect()
    return this
  },

  subscribeScript(exch, token, listen){
    let self = this;
    self.emitter.on(token, listen)
    console.log(`Subscribing to ${exch} ${token}`)
    this.ws.send(JSON.stringify({
      "t":"t",
      "k": `${exch}|${token}`
    }));
    return this;
  },

  unsubscribeScript(exch, token, listen){
    let self = this;
    self.emitter.removeListener(token, listen)
    console.log("Unregister ", token)
    this.ws.send(JSON.stringify({
        "t":"u",
        "k": `${exch}|${token}`
    }));
  },

  registerOrderUpdate(){
    this.ws.send(JSON.stringify({
        "t":"o",
        "accid": this.userId
    }));
  },

  connect(){
    let self = this;
    console.log('Connecting....') 

    function publishData(data){
      //console.log(data)
      switch(data.t){
        case 'tk':
        case 'tf':
          self.emitter.emit(data.tk, data)
          break;
        case 'om':
          self.emitter.emit(`order`, data)
          break;
        case 'ck':
          //self.subscribeScript(self.exch, self.token)
          self.registerOrderUpdate()
          break;
        default:
          console.log('Missing type')
          console.log(JSON.stringify(data))
      }
    }


    function identifyYourself(ws){
      ws.send(JSON.stringify({
          "uid":self.userId,
          "accid":self.userId,
          "t":"c",
          "source":"API",
          "susertoken":self.token
      }));
    }

    self.ws.on('open', function open() {
      identifyYourself(self.ws);
      connectionTimeout = 1000;
    });

    self.ws.on('close', function(code) {
      console.log('Close..........................', code)
      setTimeout(that => {
        that.ws = new WebSocket (process.env.socketUrl);
        that.connect()
        connectionTimeout += 1000
      }, connectionTimeout, self)
    });

    self.ws.on('message', function (data) {
        //console.log(data)
        publishData(JSON.parse(data))
    });

    self.ws.on('error', function (data) {
      console.log('Error.....')
      console.log(data)
    });
  }
}


module.exports.Ticker = Ticker