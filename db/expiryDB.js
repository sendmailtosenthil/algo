
function saveExpiry(db){
    return (expiry) =>{
        const row = db.prepare(`SELECT expiry FROM expiry_info WHERE expiry = ?`)
                .get(expiry)
        console.log(row)
                
        let query;
        if(!row){
            query = "INSERT INTO expiry_info(expiry) VALUES (@expiry)"
            db.prepare(query).run({expiry:expiry})
        }
    }
}

function retrieveExpiry(db){
    return (expiry) =>{
        const row = db.prepare(`SELECT expiry FROM expiry_info WHERE expiry = ?`)
                .get(expiry)
        if(typeof row === 'undefined'){
            throw Error('Script does not found in DB')
        }
        return row;
    }
}

function cleanUp(db){
    return () => {
        db.prepare(`delete from expiry_info where expiry < strftime('%Y%m%d',date('now','localtime'))`).run()
    }
}

function getCurrentWeek(db){
    return () => {
        return db.prepare(`select min(expiry) as expiry from expiry_info`).get()
    }
}

module.exports = function(db){
    return {
        save: saveExpiry(db),
        retrieve: retrieveExpiry(db),
        clean: cleanUp(db),
        currentWeek: getCurrentWeek(db)
    }
}
