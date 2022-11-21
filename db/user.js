function retrieveStrategies(db){
    return (tradeDay) =>{
        const row = db.prepare('SELECT uid, sid, trade_day as tradeDay FROM user_strategy WHERE trade_day = ?').all(tradeDay)
        if(typeof row === 'undefined'){
            throw Error('No trades for today')
        }
        return row;
    }
}

module.exports = function(db){
    return {
        retrieveStrategies: retrieveStrategies(db)
    }
}
