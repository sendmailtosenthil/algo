const {expiryInfo} = require('db')(process.env.dbFile);

const populateExpiry = () => {
    const expiryMap = new Map();
    expiryMap.set('CURRENT_WEEK', expiryInfo.currentWeek().expiry)
    console.log(expiryMap)
    return expiryMap;
}

class FindExpiry {

    constructor(expiry, cb){
        this.expiryMap = populateExpiry()
        this.getExpiry(expiry, cb)
    }

    getExpiry(expiry, cb){
        let expiryVal = ""
        switch(expiry){
            case 'CURRENT_WEEK':
                console.log('In current week')
                expiryVal = this.expiryMap.get(expiry);
                break;
            default:
                expiryVal = ""
        }
        cb(expiryVal)
    }
}
module.exports.FindExpiry = FindExpiry 