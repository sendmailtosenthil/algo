const {transactionsDB} = require('db')(process.env.dbFile)

class OrderUpdate {

    constructor(emitter, orderInfo){
        this.emitter = emitter
        this.orderInfo = orderInfo
        this.updateOrder()
    }

    async updateOrder(){
        let self = this;
        
        transactionsDB.updatePrice({
            oid : self.orderInfo.norenordno,
            uid : self.orderInfo.userId,
            status: self.orderInfo.status === 'COMPLETE' && self.orderInfo.trantype === 'S' ? 'ACTION_PENDING' : self.orderInfo.status,
            price: self.orderInfo.flprc,
            tid: self.orderInfo.tid
        })
        
        if(self.orderInfo.status === 'COMPLETE' && self.orderInfo.trantype === 'S'){
            this.emitter.emit(`sl-update`,{symbol:self.orderInfo.tsym, 
                oid: self.orderInfo.norenordno,
                tid: self.orderInfo.tid,
                tradePrice: self.orderInfo.flprc 
            })
            this.emitter.emit(`open-orders`,{
                symbol:self.orderInfo.tsym, 
                oid: self.orderInfo.norenordno,
                tid: self.orderInfo.tid
            })
        }
    }
}

module.exports = OrderUpdate
