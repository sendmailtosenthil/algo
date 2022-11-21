const {scriptInfo, transactionsDB} = require('db')(process.env.dbFile)
const m = require('moment')
const {Broker} = require('../flattrade/api')

class PlaceOrder {

    constructor(emitter, ticker, options, userInfo){
        this.emitter = emitter
        this.ticker = ticker
        this.options = options
        this.userInfo = userInfo
        this.placeOrder()
    }

    async placeOrder(){
        let self = this;
        let opt = self.options
        let expiryDay = m(opt.expiry,'YYYYMMDD').format('DDMMMYY')
        let symb = opt.symbol ? opt.symbol : `NIFTY${expiryDay}${opt.type}${opt.strike}`.toUpperCase();
        console.log(`Symb  ${symb}`)
        const token = scriptInfo.retrieve({name:symb, expiry: opt.expiry}).token
        console.log(`Symb  ${symb} token ${token}`)
        
        const api = new Broker(self.userInfo.userId, self.userInfo.authToken)
        let orderInfo = await api.placeOrder({
            exch: 'NFO',
            symbol: symb,
            qty:50,
            price: 0,
            type: opt.trans,
            otype: 'MKT',
            id: opt.tid
        })

        transactionsDB.save({
            oid : orderInfo.norenordno,
            uid : self.userInfo.userId,
            sid : opt.sid,
            tid : opt.tid,
            strike : symb
        })
    }
}

module.exports = PlaceOrder
