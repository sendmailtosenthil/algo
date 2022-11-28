const {transactionsDB} = require('db')(process.env.dbFile)

class OrderUpdate {

    constructor(orderInfo, cb){
        this.updateOrder(orderInfo, cb)
    }

    async updateOrder(o, cb){
        console.log(`Order in Udate order `, o)
        transactionsDB.updateEntryPrice({
            tid: o.tid,
            oid : o.oid,
            status: o.status == 'COMPLETE' ? 'ACTION_PENDING' : o.status,
            price: o.price,
            strike: o.strike
        })

        cb({...o, status:'ACTION_PENDING'})
        
    }
}

module.exports = OrderUpdate
