const {transactionsDB, scriptInfo} = require('db')(process.env.dbFile)

class UpdateSL {

    constructor(emitter, ticker, orderInfo, sl){
        this.emitter = emitter
        this.orderInfo = orderInfo
        this.ticker = ticker
        this.sl = sl
        this.originalTradePrice = orderInfo.tradePrice
        console.log(`>>>>>>> Order Info SL ${JSON.stringify(this.orderInfo)} ${JSON.stringify(sl)}`)
        if(this.orderInfo.slPrice){
            this.slPrice = this.orderInfo.slPrice
        } else {
            this.slPrice = Number(this.originalTradePrice) + (Number(this.originalTradePrice) * Number(sl.percentage) / 100)
        }
        if(this.orderInfo.movePrice){
            this.movePrice = this.orderInfo.movePrice
        } else {
            this.movePrice = Number(this.originalTradePrice) - (Number(this.originalTradePrice) * Number(sl.marketMove) /100)
            
        }
        //console.log('............................', this.slPrice, this.movePrice)
        this.updateDB()
        this.updateSL()
    }

    async updateSL(){
        let self = this;
        let token = scriptInfo.retrieve({name: self.orderInfo.symbol, expiry: self.orderInfo.expiry}).token
        this.token = token;
        self.emitter.on(token, this.listen)
        self.ticker.subscribeScript('NFO', token)
    }

    async listen(data) {
        //console.log(data)

        if(!data.lp){
            console.log('Missing price....')
            return;
        }
        if(Number(data.lp) >= self.slPrice){
            self.emitter.removeListener(token, listen)
            self.emitter.emit('sl-hit', {...self.orderInfo, expiry:self.orderInfo.expiry, slPrice:self.slPrice, movePrice: self.movePrice, exitPrice: data.lp})
            self.ticker.unsubscribeScript('NFO', token)
            return;
        }

        console.log(`${self.orderInfo.symbol} : ${data.lp}`)
        if(Number(data.lp) <= self.movePrice){
            console.log(`Old Price `, self.orderInfo.symbol, data.lp, self.slPrice, self.movePrice)
            //self.tradePrice = self.movePrice
            self.movePrice = Number(data.lp) - (Number(data.lp) * self.sl.marketMove/100)
            self.slPrice = Number(data.lp) + (Number(data.lp) * self.sl.percentage/100)
            
            console.log(`New Price `, self.orderInfo.symbol, data.lp, self.slPrice, self.movePrice) 
            self.updateDB()   
        }
        
    }

    async stopListening(){
        self.emitter.removeListener(this.token, this.listen)
        self.ticker.unsubscribeScript('NFO', this.token)
    }

    async updateDB(){
        console.log(`Setting SL ${this.slPrice} for ${this.orderInfo.symbol}`)
        transactionsDB.updateSL({
            ...this.orderInfo,
            slPrice: this.slPrice,
            movePrice: this.movePrice
        })
    }
}

module.exports = UpdateSL
