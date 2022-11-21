
function saveToken(db){
    return (user) =>{
        const row = db.prepare('SELECT id, token, login_time FROM user WHERE id = ?').get(user.id)
        console.log(row)
                
        let query;
        if(row){
            query = `UPDATE user SET token = @token, login_time = DATETIME('now','localtime') WHERE id = @id`
        } else {
            query = "INSERT INTO user(id, token) VALUES (@id, @token)"
        }
        db.prepare(query).run({id:user.id,token:user.token})
    }
}

function retrieveToken(db){
    return (user) =>{
        const row = db.prepare('SELECT id, token, login_time as loginTime FROM user WHERE id = ?').get(user.id)
        if(typeof row === 'undefined'){
            throw Error('User does not have token')
        }
        console.log(row)
        return row;
    }
}


module.exports = function(db){
    return {
        save: saveToken(db),
        retrieve: retrieveToken(db)
    }
}
