
function saveScriptInfo(db){
    return (script) =>{
        const row = db.prepare(`SELECT name, token, expiry FROM script_info WHERE (name = ? and expiry = ?) or (name = ? and will_expire = 'N')`)
                .get(script.name, script.expiry, script.name)
        console.log(row)
                
        let query;
        if(!row){
            query = "INSERT INTO script_info(name, token, expiry) VALUES (@name, @token, @expiry)"
            db.prepare(query).run({name:script.name, token:script.token, expiry: script.expiry})
        }
    }
}

function retrieveScriptInfo(db){
    return (script) =>{
        const row = db.prepare(`SELECT name, token, expiry FROM script_info WHERE (name = ? and expiry = ?) or (name = ? and will_expire='N')`)
                .get(script.name, script.expiry, script.name)
        if(typeof row === 'undefined'){
            throw Error('Script does not found in DB')
        }
        return row;
    }
}

function cleanUp(db){
    return () => {
        db.prepare(`delete from script_info where expiry < strftime('%Y%m%d',date('now','localtime')) and will_expire = 'Y'`).run()
    }
}


module.exports = function(db){
    return {
        save: saveScriptInfo(db),
        retrieve: retrieveScriptInfo(db),
        clean: cleanUp(db),
        nifty: {exch:'NSE', token:26000}
    }
}
