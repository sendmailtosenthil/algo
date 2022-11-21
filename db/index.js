const Database = require('better-sqlite3');

module.exports = function(dbFile){
    console.log('DB Location :', dbFile)
    const db = new Database(dbFile, { verbose: console.log })
    return {
        token: require('./token')(db),
        strategyDB: require('./strategy')(db),
        user: require('./user')(db),
        transactionsDB: require('./transactions')(db),
        scriptInfo: require('./script-info')(db),
        expiryInfo: require('./expiryDB')(db)
    }
}
