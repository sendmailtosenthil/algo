function retrieve(db){
    return (tid) => {
        const row = db.prepare(`SELECT 
            tid, order_id as oid, strike, 
            entry_at as entryTime, entry_price as entryPrice,
            exit_at as exitTime, exit_price as exitPrice,
            sl_price as slPrice, sl_at as slUpdated,
            status 
            FROM transactions WHERE tid = ?`).get(tid)
        if(typeof row === 'undefined'){
            return null
        }
        return row;
    }
}

function save(db){
    return (orderInfo) =>{
        const row = retrieve(db)(orderInfo.tid, orderInfo.oid)
        console.log(row)
                
        let query;
        if(row == null){
            query = `INSERT INTO transactions(tid, order_id, strike, status) VALUES (@tid, @oid, @strike,'PENDING')`
            db.prepare(query).run(orderInfo)
        } else if (row.oid != orderInfo.oid){
            const msg = `Mismatch in order id ${row.oid} ${orderInfo.oid}`
            throw Error(msg)
        }
        
    }
}

function updateEntryPrice(db){
    return (orderInfo) =>{
        save(db)(orderInfo)
        query = `UPDATE transactions
                SET entry_price = @price, entry_at=TIME('now','localtime'),
                    status = @status
                WHERE tid = @tid and order_id = @oid`
        db.prepare(query).run(orderInfo)
    }
}

function updateStatus(db){
    return (orderInfo) =>{
        save(db)(orderInfo)
        query = `UPDATE transactions
                SET status = @status
                WHERE tid = @tid and order_id = @oid`
        db.prepare(query).run(orderInfo)
    }
}

function updateSL(db){
    return (orderInfo) =>{
        query = `UPDATE transactions
                    SET sl_price = @slPrice, move_at=TIME('now','localtime'), 
                    move_price = @movePrice 
                    WHERE tid = @tid and order_id = @oid and status='ACTION_PENDING'`
        db.prepare(query).run(orderInfo)
    }
}

module.exports = function(db){
    
    return {
        retrieve: retrieve(db),
        save: save(db),
        updateEntryPrice: updateEntryPrice(db),
        updateSL: updateSL(db),
        updateStatus: updateStatus(db)
    }

}