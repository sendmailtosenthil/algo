const {scriptInfo, transactionsDB} = require('db')(process.env.dbFile)
const m = require('moment')
const {Broker} = require('../flattrade/api')

class PlaceOrder {

    constructor(ticker, options, userInfo){
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
            exch: opt.exchange,
            symbol: symb,
            qty:opt.qty,
            price: 0,
            type: opt.trantype,
            otype: opt.otype,
            id: opt.tid
        })

        transactionsDB.save({
            tid : opt.tid,
            oid : orderInfo.norenordno,
            strike : symb
        })
    }
}

module.exports = PlaceOrder
