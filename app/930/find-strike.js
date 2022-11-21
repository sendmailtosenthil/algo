const {scriptInfo} = require('db')(process.env.dbFile)

class ATMStrikeFinder {

    constructor(emitter, ticker, options){
        this.emitter = emitter
        this.options = options
        this.ticker = ticker
        this.findStrike()
    }

    findStrike(){
        const nifty = scriptInfo.nifty
        console.log('Nifty ', nifty)
        let self = this;
        self.emitter.on(nifty.token, listenNifty50)

        function listenNifty50(data){
            if(data.lp){
                self.emitter.removeListener(nifty.token, listenNifty50);
                let current = data.lp;
                let roundOff = self.options.round || 50
                let currentStrike = Math.round(current/roundOff,0) * roundOff
                self.emitter.emit('nifty-atm', currentStrike);
                return;
            }
            console.log('Not received price for nifty')
        }
    }
}

module.exports = ATMStrikeFinder
