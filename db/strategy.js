function retrieveStrategy(db){
    return (strategyId) => {
        const row = db.prepare(`SELECT id, name, entry_time as entryTime, 
            exit_time as exitTime, expiry, pe_strike as peStrike, ce_strike as ceStrike, 
            sl FROM strategy WHERE id = ?`).get(strategyId)
        if(typeof row === 'undefined'){
            throw Error('Strategy Not available for ' + strategyId)
        }
        return row;
    }
    
}

module.exports = function(db){
    return {
        retrieve: retrieveStrategy(db)
    }
}