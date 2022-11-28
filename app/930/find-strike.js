const {scriptInfo} = require('db')(process.env.dbFile)

class ATMStrikeFinder {

    constructor(emitter, ticker, options, cb){
        this.emitter = emitter
        this.options = options
        this.ticker = ticker
        this.findStrike(cb)
    }

    findStrike(cb){
        const nifty = scriptInfo.nifty
        console.log('Nifty ', nifty)
        let self = this;
        self.ticker.subscribeScript('NSE', nifty.token, listenNifty50)

        function listenNifty50(data){
            if(data.lp){
                self.ticker.unsubscribeScript('NSE',nifty.token, listenNifty50);
                let current = data.lp;
                let roundOff = self.options.round || 50
                let currentStrike = Math.round(current/roundOff,0) * roundOff
                cb(currentStrike)
                return;
            }
            console.log('Not received price for nifty')
        }
    }
}

module.exports = ATMStrikeFinder
